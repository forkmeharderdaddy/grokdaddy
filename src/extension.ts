import * as vscode from "vscode";
import { sendToGrok } from "./api";
import { getFilesList, readFileAsUtf8 } from "./file";

const CONFIG_BASE = "vscodeGrok";
const CONFIG_API_KEY = "apiKey";
const NO_API_KEY = "";

async function promptForApiKey(): Promise<string> {
  const input = await vscode.window.showInputBox({
    prompt: "Enter your xAI API Key",
    password: true,
    placeHolder: "API Key required",
  });
  return input?.trim() || NO_API_KEY;
}

async function saveApiKey(
  config: vscode.WorkspaceConfiguration,
  apiKey: string
): Promise<void> {
  await config.update(
    CONFIG_API_KEY,
    apiKey,
    vscode.ConfigurationTarget.Global
  );
}

async function getApiKey(): Promise<string> {
  const config = vscode.workspace.getConfiguration(CONFIG_BASE);
  let apiKey = config.get<string>(CONFIG_API_KEY);

  if (!apiKey) {
    apiKey = await promptForApiKey();
    if (apiKey && apiKey !== NO_API_KEY) {
      await saveApiKey(config, apiKey);
    }
  }

  return apiKey;
}

async function getQuestion() {
  return vscode.window.showInputBox({
    prompt: "Enter your question for Grok",
  });
}

async function prepareContext() {
  // Ensure workspace folder is available
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("No workspace folder open!");
    return;
  }

  // Get the xAI API Key
  const apiKey = await getApiKey();
  if (!apiKey) {
    vscode.window.showErrorMessage("API Key is required!");
    return;
  }

  // Get the question
  const question = await getQuestion();
  if (!question) {
    vscode.window.showErrorMessage("A question is required!");
    return;
  }

  return {
    workspaceFolder,
    apiKey,
    question,
  };
}

async function askGrok(apiKey: string, prompt: string) {
  // Show progress as notification
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Grok is thinking...",
      cancellable: false,
    },
    async () => {
      try {
        // Send to Grok (via xAI API)
        const response = await sendToGrok(apiKey, prompt);

        // Render each choice in its own tab with markdown format
        (response.choices as any[]).forEach(async (choice) => {
          const document = await vscode.workspace.openTextDocument({
            content: choice.message.content,
            language: "markdown",
          });

          await vscode.window.showTextDocument(document, {
            preview: false,
          });

          vscode.window.showInformationMessage(
            "Grok finished. You can view the response in the newly created tab(s)."
          );
        });
      } catch (error) {
        vscode.window.showErrorMessage(
          "Error sending to Grok: " + (error as Error).message
        );
      }
    }
  );
}

async function handleAskGrokWorkspace() {
  const context = await prepareContext();
  if (!context) {
    return;
  }

  // Get a list of all relevant files
  const uris = await getFilesList();
  if (!uris.length) {
    vscode.window.showErrorMessage("No files found, aborting!");
    return;
  }

  // Read contents of those files
  const content = (
    await Promise.all([
      ...uris.map(async (uri) => ({
        path: uri.path,
        content: await readFileAsUtf8(uri),
      })),
    ])
  ).reduce((buffer, file) => `${buffer}\n\n${file.path}\n${file.content}`, "");

  // Create a message for Grok
  const prompt = `Please consider the following project files:${content}\n\nQuestion: ${context.question}`;

  await askGrok(context.apiKey, prompt);
}

function getActiveTab() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active tab found!");
    return;
  }

  // Full path of the active file
  const path = editor.document.uri.path;

  // Get the full content of the active tab
  const content = editor.document.getText();
  if (!content) {
    vscode.window.showErrorMessage("Active tab appears to be empty!");
    return;
  }

  return {
    path,
    content,
  };
}

async function handleAskGrokTab() {
  const context = await prepareContext();
  if (!context) {
    return;
  }

  const tab = getActiveTab();
  if (!tab) {
    return;
  }

  // Create a message for Grok
  const prompt = `Please consider the following project file:\n\n${tab.path}\n${tab.content}\n\nQuestion: ${context.question}`;

  await askGrok(context.apiKey, prompt);
}

async function getActiveFunctionText(): Promise<string | undefined> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active tab found!");
    return;
  }

  const document = editor.document;
  const position = editor.selection.active;

  // Get all document symbols
  const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    "vscode.executeDocumentSymbolProvider",
    document.uri
  );

  if (!symbols || symbols.length === 0) {
    vscode.window.showErrorMessage("No symbols found!");
    return;
  }

  // Find the function symbol that contains the cursor
  const activeFunction = findContainingFunction(symbols, position);
  if (!activeFunction) {
    vscode.window.showErrorMessage("Unable to determine function!");
    return;
  }

  // Get the full text of the function using its range
  const functionText = document.getText(activeFunction.range);
  return functionText;
}

function findContainingFunction(
  symbols: vscode.DocumentSymbol[],
  position: vscode.Position
): vscode.DocumentSymbol | undefined {
  for (const symbol of symbols) {
    if (
      symbol.kind === vscode.SymbolKind.Function || // Function symbol
      symbol.kind === vscode.SymbolKind.Method // Method symbol
    ) {
      if (symbol.range.contains(position)) {
        return symbol; // Return the symbol with its range
      }
    }

    // Recursively check child symbols
    if (symbol.children && symbol.children.length > 0) {
      const childResult = findContainingFunction(symbol.children, position);
      if (childResult) {
        return childResult;
      }
    }
  }
}

async function handleAskGrokFunction() {
  const context = await prepareContext();
  if (!context) {
    return;
  }

  const funcText = await getActiveFunctionText();
  if (!funcText) {
    return;
  }

  // Create a message for Grok
  const prompt = `Please consider the following function/method:\n\n${funcText}\n\nQuestion: ${context.question}`;

  await askGrok(context.apiKey, prompt);
}

export function activate(context: vscode.ExtensionContext) {
  const askGrok = vscode.commands.registerCommand(
    "vscode-grok.askGrokWorkspace",
    handleAskGrokWorkspace
  );

  const askGrokTab = vscode.commands.registerCommand(
    "vscode-grok.askGrokTab",
    handleAskGrokTab
  );

  const askGrokFunction = vscode.commands.registerCommand(
    "vscode-grok.askGrokFunction",
    handleAskGrokFunction
  );

  context.subscriptions.push(askGrok, askGrokTab, askGrokFunction);
}
