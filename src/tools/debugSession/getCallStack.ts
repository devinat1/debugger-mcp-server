import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendBridgeCommand } from "../../bridge/bridgeClient.js";
import { formatToolResult, formatErrorResult } from "../toolTypes.js";
import type { GetCallStackResponse } from "../../bridge/bridgeTypes.js";

export const registerGetCallStackTool = (params: { server: McpServer }): void => {
  params.server.tool(
    "get_call_stack",
    "Get the current call stack (stack trace) showing the chain of function calls.",
    {
      sessionId: z.string().optional().describe("Debug session ID. Defaults to the active session."),
      threadId: z.number().optional().describe("Thread ID to get call stack for. Defaults to the first available thread."),
    },
    async (args) => {
      try {
        const result = await sendBridgeCommand<GetCallStackResponse>({
          command: "getCallStack",
          args: {
            sessionId: args.sessionId,
            threadId: args.threadId,
          },
        });
        return { content: [{ type: "text" as const, text: formatToolResult({ data: result }) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatErrorResult({ error }) }], isError: true };
      }
    }
  );
};
