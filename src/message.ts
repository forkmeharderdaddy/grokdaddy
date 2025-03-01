import * as vscode from "vscode";
import {
  getActiveFunctionText,
  getActiveTab,
  getFilesList,
  getSelectedText,
  readFileAsUtf8,
} from "./editor";
import { MessageType } from "./types";

async function getWorkspaceMessage(
  question: string
): Promise<string | undefined> {
  const uris = await getFilesList();
  if (!uris.length) {
    vscode.window.showErrorMessage("No files found in workspace!");
    throw new Error("No workspace files");
  }
  const content = (
    await Promise.all(
      uris.map(async (uri) => ({
        path: uri.path,
        content: await readFileAsUtf8(uri),
      }))
    )
  ).reduce(
    (buffer, file, i) =>
      `${buffer}${i ? "\n\n" : ""}${file.path}\n${file.content}`,
    ""
  );
  return [
    `Please consider the following project files:`,
    content,
    `Question: ${question}`,
  ].join("\n\n");
}

async function getTabMessage(question: string): Promise<string | undefined> {
  const tab = getActiveTab();
  return [
    `Please consider the following project file:`,
    `${tab.path}\n${tab.content}`,
    `Question: ${question}`,
  ].join("\n\n");
}

async function getFunctionMessage(
  question: string
): Promise<string | undefined> {
  const funcText = await getActiveFunctionText();
  return [
    `Please consider the following function/method:`,
    funcText,
    `Question: ${question}`,
  ].join("\n\n");
}

async function getSelectionMessage(question: string) {
  const selectedText = await getSelectedText();
  return [
    `Please consider the following code:`,
    selectedText,
    `Question: ${question}`,
  ].join("\n\n");
}

export async function getMessage(
  type: MessageType,
  question: string
): Promise<string | undefined> {
  switch (type) {
    case "workspace":
      return getWorkspaceMessage(question);
    case "tab":
      return getTabMessage(question);
    case "function":
      return getFunctionMessage(question);
    case "selection":
      return getSelectionMessage(question);
    default:
      return "";
  }
}
