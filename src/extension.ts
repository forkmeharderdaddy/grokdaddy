import * as vscode from "vscode";
import { sendToGrok } from "./api";
import { getFilesList, readFileAsUtf8 } from "./file";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "grok-code-sender.sendToGrok",
    async () => {
      // Ensure workspace folder is available
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder open!");
        return;
      }

      // Prompt for API Key (stored in global state for reuse)
      let apiKey = context.globalState.get("xaiApiKey") as string;
      if (!apiKey) {
        apiKey =
          (await vscode.window.showInputBox({
            prompt: "Enter your xAI API Key",
            password: true,
          })) || "";
        if (!apiKey) {
          vscode.window.showErrorMessage("API Key is required!");
          return;
        }
        context.globalState.update("xaiApiKey", apiKey);
      }

      // Get the question
      const question = await vscode.window.showInputBox({
        prompt: "Enter your question for Grok",
      });
      if (!question) {
        vscode.window.showErrorMessage("A question is required!");
        return;
      }

      // Get a list of all relevant files
      const uris = await getFilesList();

      // Read contents of those files
      const content = (
        await Promise.all([
          ...uris.map(async (uri) => ({
            path: uri.path,
            content: await readFileAsUtf8(uri),
          })),
        ])
      ).reduce(
        (buffer, file) => `${buffer}\n\n${file.path}\n${file.content}`,
        ""
      );

      // Create a message for Grok
      const prompt = `Please consider the following project files:${content}\n\nQuestion: ${question}`;

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
            (response.choices as any[]).forEach(async (r) => {
              const document = await vscode.workspace.openTextDocument({
                content: r.message.content,
                language: "markdown",
              });

              await vscode.window.showTextDocument(document, {
                preview: false,
              });

              vscode.window.showInformationMessage(
                "Grok finished. You can view the response in the newly created tab."
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
  );

  context.subscriptions.push(disposable);
}
