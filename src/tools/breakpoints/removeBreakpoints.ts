import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendBridgeCommand } from "../../bridge/bridgeClient.js";
import { formatToolResult, formatErrorResult } from "../toolTypes.js";
import type { RemoveBreakpointsResponse } from "../../bridge/bridgeTypes.js";

export const registerRemoveBreakpointsTool = (params: { server: McpServer }): void => {
  params.server.tool(
    "remove_breakpoints",
    "Remove breakpoints by their IDs. If no IDs provided, removes all breakpoints.",
    {
      breakpointIds: z.array(z.string()).optional().describe("Specific breakpoint IDs to remove. Omit to remove all."),
    },
    async (args) => {
      try {
        const result = await sendBridgeCommand<RemoveBreakpointsResponse>({
          command: "removeBreakpoints",
          args: {
            breakpointIds: args.breakpointIds,
          },
        });
        return { content: [{ type: "text" as const, text: formatToolResult({ data: result }) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatErrorResult({ error }) }], isError: true };
      }
    }
  );
};
