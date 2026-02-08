import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendBridgeCommand } from "../../bridge/bridgeClient.js";
import { formatToolResult, formatErrorResult } from "../toolTypes.js";
import type { StartDebugSessionResponse } from "../../bridge/bridgeTypes.js";

export const registerStartDebugSessionTool = (params: { server: McpServer }): void => {
  params.server.tool(
    "start_debug_session",
    "Start a new debug session in VS Code. Supports launching programs or attaching to running processes.",
    {
      type: z.string().describe("Debug adapter type (e.g., 'node', 'python', 'cppdbg')"),
      name: z.string().describe("Human-readable name for the debug session"),
      request: z.enum(["launch", "attach"]).describe("Whether to launch a new process or attach to existing"),
      program: z.string().optional().describe("Path to the program to debug"),
      args: z.array(z.string()).optional().describe("Command line arguments for the program"),
      cwd: z.string().optional().describe("Working directory for the program"),
      additionalConfig: z.record(z.unknown()).optional().describe("Additional debug configuration properties passed to the debug adapter"),
    },
    async (args) => {
      try {
        const result = await sendBridgeCommand<StartDebugSessionResponse>({
          command: "startDebugSession",
          args: {
            type: args.type,
            name: args.name,
            request: args.request,
            program: args.program,
            args: args.args,
            cwd: args.cwd,
            additionalConfig: args.additionalConfig,
          },
        });
        return { content: [{ type: "text" as const, text: formatToolResult({ data: result }) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatErrorResult({ error }) }], isError: true };
      }
    }
  );
};
