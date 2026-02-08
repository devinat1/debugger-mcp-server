import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { BridgeHealthResponse } from "./bridgeTypes.js";

const PORT_FILE_PATH = join(homedir(), ".agentic-debugger", "bridge-port");
const HEALTH_TIMEOUT_MS = 5000;

type CachedUrl = string | null;
const cache: { bridgeUrl: CachedUrl } = { bridgeUrl: null };

const readPortFile = (): number => {
  try {
    const content = readFileSync(PORT_FILE_PATH, "utf-8").trim();
    const port = parseInt(content, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
      throw new Error("Invalid port number in bridge port file.");
    }
    return port;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid port")) {
      throw error;
    }
    throw new Error(
      "Bridge port file not found. Make sure VS Code is open with the Agentic Debugger extension installed."
    );
  }
};

const checkHealth = async (params: { url: string }): Promise<boolean> => {
  const { url } = params;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    try {
      const response = await fetch(`${url}/api/health`, {
        method: "GET",
        signal: controller.signal,
      });

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as BridgeHealthResponse;
      return data.status === "ok";
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return false;
  }
};

export const getBridgeUrl = async (): Promise<string> => {
  if (cache.bridgeUrl !== null) {
    const isHealthy = await checkHealth({ url: cache.bridgeUrl });
    if (isHealthy) {
      return cache.bridgeUrl;
    }
    cache.bridgeUrl = null;
  }

  const port = readPortFile();
  const url = `http://127.0.0.1:${port}`;
  const isHealthy = await checkHealth({ url });

  if (!isHealthy) {
    throw new Error(
      "VS Code extension bridge is not responding. Make sure VS Code is open with the Agentic Debugger extension installed."
    );
  }

  cache.bridgeUrl = url;
  return url;
};

export const invalidateCache = (): void => {
  cache.bridgeUrl = null;
};
