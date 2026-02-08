import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendBridgeCommand } from "../../bridge/bridgeClient.js";
import { formatToolResult, formatErrorResult } from "../toolTypes.js";
import type { ListBreakpointsResponse } from "../../bridge/bridgeTypes.js";

export const registerListBreakpointsTool = (params: { server: McpServer }): void => {
  params.server.tool(
    "list_breakpoints",
    "List all currently set breakpoints in VS Code with their locations and conditions.",
    {},
    async () => {
      try {
        const result = await sendBridgeCommand<ListBreakpointsResponse>({
          command: "listBreakpoints",
        });
        return { content: [{ type: "text" as const, text: formatToolResult({ data: result }) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatErrorResult({ error }) }], isError: true };
      }
    }
  );
};
