import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendBridgeCommand } from "../../bridge/bridgeClient.js";
import { formatToolResult, formatErrorResult } from "../toolTypes.js";
import type { StopDebugSessionResponse } from "../../bridge/bridgeTypes.js";

export const registerStopDebugSessionTool = (params: { server: McpServer }): void => {
  params.server.tool(
    "stop_debug_session",
    "Stop an active debug session. If no session ID is provided, stops the currently active session.",
    {
      sessionId: z.string().optional().describe("ID of the debug session to stop. Omit for the active session."),
    },
    async (args) => {
      try {
        const result = await sendBridgeCommand<StopDebugSessionResponse>({
          command: "stopDebugSession",
          args: {
            sessionId: args.sessionId,
          },
        });
        return { content: [{ type: "text" as const, text: formatToolResult({ data: result }) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatErrorResult({ error }) }], isError: true };
      }
    }
  );
};
