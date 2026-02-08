import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendBridgeCommand } from "../../bridge/bridgeClient.js";
import { formatToolResult, formatErrorResult } from "../toolTypes.js";
import type { StepResponse } from "../../bridge/bridgeTypes.js";

export const registerStepOutTool = (params: { server: McpServer }): void => {
  params.server.tool(
    "step_out",
    "Step out of the current function, returning to the caller.",
    {
      sessionId: z.string().optional().describe("Debug session ID. Defaults to the active session."),
      threadId: z.number().optional().describe("Thread ID to step. Defaults to the first available thread."),
    },
    async (args) => {
      try {
        const result = await sendBridgeCommand<StepResponse>({
          command: "stepOut",
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
