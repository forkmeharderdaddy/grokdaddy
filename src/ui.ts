import * as vscode from "vscode";

export async function promptForApiKey(): Promise<string> {
  const input = await vscode.window.showInputBox({
    prompt: "Enter your xAI API Key",
    password: true,
    placeHolder: "API Key required",
  });
  return input?.trim() || "";
}

export async function promptForQuestion(): Promise<string | undefined> {
  const input = await vscode.window.showInputBox({
    prompt: "Enter your question for Grok",
  });
  return input?.trim() || "";
}

export async function showProgress<T>(
  title: string,
  task: () => Promise<T>
): Promise<T> {
  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title,
      cancellable: false,
    },
    task
  );
}
