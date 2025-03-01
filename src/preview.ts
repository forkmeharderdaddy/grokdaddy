import * as vscode from "vscode";
import {
  PREVIEW_PANEL_KEY,
  PREVIEW_PANEL_TITLE,
  SHOW_PREVIEW_ALWAYS,
  SHOW_PREVIEW_WORKSPACE,
} from "./const";
import { getShowPreview } from "./config";
import { MessageType } from "./types";

export async function handleGrokPreview(type: MessageType, prompt: string) {
  if (await shouldShowGrokPreview(type)) {
    return await showGrokPreview(prompt);
  }
  return true;
}

export async function shouldShowGrokPreview(type: MessageType) {
  const previewMode = await getShowPreview();
  if (previewMode === SHOW_PREVIEW_ALWAYS) {
    return true;
  }

  if (previewMode === SHOW_PREVIEW_WORKSPACE && type === "workspace") {
    return true;
  }

  return false;
}

export function showGrokPreview(data: string) {
  return showDataPreview(PREVIEW_PANEL_TITLE, data);
}

/**
 * Displays a preview of data in a webview panel with confirmation buttons.
 */
export function showDataPreview(title: string, data: string): Promise<boolean> {
  return new Promise((resolve) => {
    const panel = vscode.window.createWebviewPanel(
      PREVIEW_PANEL_KEY,
      title,
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    // HTML content for the webview
    panel.webview.html = getWebviewContent(data);

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "confirm":
          resolve(true);
          panel.dispose();
          break;
        case "cancel":
          resolve(false);
          panel.dispose();
          break;
      }
    });

    // Cleanup when the panel is closed
    panel.onDidDispose(() => resolve(false));
  });
}

/**
 * Generates HTML content for the webview with formatted data and buttons.
 */
function getWebviewContent(data: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
    </head>
    <body>
      <h3>Data to Send to Grok API:</h3>
      <hr>
      <pre>${escapeHtml(data)}</pre>
      <hr>
      <div>
        <button onclick="sendMessage('confirm')">Send</button>
        <button onclick="sendMessage('cancel')">Cancel</button>
      </div>
      <script>
        const vscode = acquireVsCodeApi();
        function sendMessage(command) {
          vscode.postMessage({ command });
        }
      </script>
    </body>
    </html>
  `;
}

/**
 * Escapes HTML characters to prevent injection.
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
