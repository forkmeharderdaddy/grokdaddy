import * as vscode from "vscode";
import {
  CONFIG_BASE,
  CONFIG_API_KEY,
  CONFIG_MODEL,
  CONFIG_OUTPUT_METHOD,
  CONFIG_SHOW_PREVIEW,
} from "./const";

function getConfigValue(config: string, key: string) {
  return vscode.workspace.getConfiguration(config).get<string>(key);
}

function setConfigValue(config: string, key: string, value: string) {
  return vscode.workspace
    .getConfiguration(config)
    .update(key, value, vscode.ConfigurationTarget.Global);
}

export async function getApiKey() {
  return await getConfigValue(CONFIG_BASE, CONFIG_API_KEY);
}

export async function setApiKey(apiKey: string): Promise<void> {
  await setConfigValue(CONFIG_BASE, CONFIG_API_KEY, apiKey);
}

export async function getModel(): Promise<string | undefined> {
  return getConfigValue(CONFIG_BASE, CONFIG_MODEL);
}

export async function getOutputMethod(): Promise<string | undefined> {
  return getConfigValue(CONFIG_BASE, CONFIG_OUTPUT_METHOD);
}

export async function getShowPreview(): Promise<string | undefined> {
  return getConfigValue(CONFIG_BASE, CONFIG_SHOW_PREVIEW);
}
