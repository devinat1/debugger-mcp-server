import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendBridgeCommand } from "../../bridge/bridgeClient.js";
import { formatToolResult, formatErrorResult } from "../toolTypes.js";
import type { GetVariablesResponse } from "../../bridge/bridgeTypes.js";

export const registerGetVariablesTool = (params: { server: McpServer }): void => {
  params.server.tool(
    "get_variables",
    "Get variables visible at the current debug position. Returns all scopes (local, closure, global) by default.",
    {
      sessionId: z.string().optional().describe("Debug session ID. Defaults to the active session."),
      frameId: z.number().optional().describe("Stack frame ID to get variables for. Defaults to the top frame."),
      variablesReference: z.number().optional().describe("Specific variables reference to expand (for nested objects)."),
    },
    async (args) => {
      try {
        const result = await sendBridgeCommand<GetVariablesResponse>({
          command: "getVariables",
          args: {
            sessionId: args.sessionId,
            frameId: args.frameId,
            variablesReference: args.variablesReference,
          },
        });
        return { content: [{ type: "text" as const, text: formatToolResult({ data: result }) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatErrorResult({ error }) }], isError: true };
      }
    }
  );
};
