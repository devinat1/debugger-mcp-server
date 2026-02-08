import { getBridgeUrl, invalidateCache } from "./connectionManager.js";

const DEFAULT_TIMEOUT_MS = 30000;

export const sendBridgeCommand = async <T>(params: {
  command: string;
  args?: Record<string, unknown>;
  timeoutMs?: number;
}): Promise<T> => {
  const { command, args = {}, timeoutMs = DEFAULT_TIMEOUT_MS } = params;

  const bridgeUrl = await getBridgeUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${bridgeUrl}/api/${command}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      invalidateCache();
      throw new Error(`Bridge command "${command}" failed (${response.status}): ${errorBody}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      invalidateCache();
      throw new Error(`Bridge command "${command}" timed out after ${timeoutMs}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
