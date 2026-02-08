import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendBridgeCommand } from "../../bridge/bridgeClient.js";
import { formatToolResult, formatErrorResult } from "../toolTypes.js";
import type { AnalyzeCodeResponse } from "../../bridge/bridgeTypes.js";

const ANALYZE_CODE_TIMEOUT_MS = 120000;

export const registerAnalyzeCodeTool = (params: { server: McpServer }): void => {
  params.server.tool(
    "analyze_code",
    "Analyze codebase to find relevant code locations for debugging a feature. Uses AI to explore and identify entry points, core logic, and key functions.",
    {
      featureDescription: z.string().describe("Description of the feature or code area to analyze"),
      workspacePath: z.string().describe("Absolute path to the workspace root"),
    },
    async (args) => {
      try {
        const result = await sendBridgeCommand<AnalyzeCodeResponse>({
          command: "analyzeCode",
          args: {
            featureDescription: args.featureDescription,
            workspacePath: args.workspacePath,
          },
          timeoutMs: ANALYZE_CODE_TIMEOUT_MS,
        });
        return { content: [{ type: "text" as const, text: formatToolResult({ data: result }) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatErrorResult({ error }) }], isError: true };
      }
    }
  );
};
