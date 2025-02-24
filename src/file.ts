import * as vscode from "vscode";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);
const excludeList = new Set(["package-lock.json"]);

import { CODING_EXTENSIONS } from "./coding-extensions";

function isCodingFile(uri: vscode.Uri): boolean {
  const filename = path.basename(uri.path);
  // Include dot files
  if (filename.startsWith(".") || !filename.includes(".")) {
    return true;
  }
  const ext = "." + filename.split(".").pop()?.toLowerCase();
  return CODING_EXTENSIONS.has(ext);
}

function notOnExcludeList(uri: vscode.Uri) {
  const filename = path.basename(uri.path);
  return !excludeList.has(filename);
}

async function getGitLsFilesOutputAsArray(): Promise<vscode.Uri[]> {
  try {
    // Get workspace folder
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    // Path to the workspace root
    const cwd = workspaceFolder!.uri.fsPath;

    // Run the git command
    const { stdout, stderr } = await execPromise(
      "git ls-files --cached --others --exclude-standard",
      { cwd }
    );

    if (stderr) {
      vscode.window.showErrorMessage(`Git error: ${stderr}`);
      return [];
    }

    // Split the output into an array, remove empty lines, and convert to vscode.Uri
    const filesArray = stdout
      .trim()
      .split("\n")
      .filter((line) => line.length > 0)
      .map((relativePath) => vscode.Uri.file(`${cwd}/${relativePath}`));

    return filesArray;
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to execute git ls-files: ${(error as any).message}`
    );
    return [];
  }
}

export async function readFileAsUtf8(uri: vscode.Uri) {
  try {
    const fileContent = await vscode.workspace.fs.readFile(uri);

    // Convert Uint8Array to string with UTF-8 encoding
    const text = new TextDecoder("utf-8").decode(fileContent);
    return text;
  } catch (error) {
    throw error;
  }
}

export async function getFilesList() {
  const gitFiles = await getGitLsFilesOutputAsArray();
  return gitFiles.filter(isCodingFile).filter(notOnExcludeList);
}
