import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendBridgeCommand } from "../../bridge/bridgeClient.js";
import { formatToolResult, formatErrorResult } from "../toolTypes.js";
import type { SetBreakpointsResponse } from "../../bridge/bridgeTypes.js";

export const registerSetBreakpointsTool = (params: { server: McpServer }): void => {
  params.server.tool(
    "set_breakpoints",
    "Set breakpoints at specified file locations. Optionally clear existing breakpoints first.",
    {
      locations: z.array(
        z.object({
          filePath: z.string().describe("Absolute or workspace-relative file path"),
          lineNumber: z.number().describe("Line number to set breakpoint on"),
          condition: z.string().optional().describe("Conditional expression for the breakpoint"),
          logMessage: z.string().optional().describe("Log message (logpoint) instead of breaking"),
        })
      ).describe("Array of breakpoint locations to set"),
      shouldClearExisting: z.boolean().default(false).describe("Clear all existing breakpoints before setting new ones"),
    },
    async (args) => {
      try {
        const result = await sendBridgeCommand<SetBreakpointsResponse>({
          command: "setBreakpoints",
          args: {
            locations: args.locations,
            shouldClearExisting: args.shouldClearExisting,
          },
        });
        return { content: [{ type: "text" as const, text: formatToolResult({ data: result }) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatErrorResult({ error }) }], isError: true };
      }
    }
  );
};
