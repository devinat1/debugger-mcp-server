import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendBridgeCommand } from "../../bridge/bridgeClient.js";
import { formatToolResult, formatErrorResult } from "../toolTypes.js";
import type { EvaluateExpressionResponse } from "../../bridge/bridgeTypes.js";

export const registerEvaluateExpressionTool = (params: { server: McpServer }): void => {
  params.server.tool(
    "evaluate_expression",
    "Evaluate an expression in the context of the current debug session. Useful for inspecting values, calling functions, or testing conditions.",
    {
      expression: z.string().describe("The expression to evaluate"),
      sessionId: z.string().optional().describe("Debug session ID. Defaults to the active session."),
      frameId: z.number().optional().describe("Stack frame ID for evaluation context. Defaults to the top frame."),
      context: z.enum(["watch", "repl", "hover"]).optional().describe("Evaluation context type. Defaults to 'repl'."),
    },
    async (args) => {
      try {
        const result = await sendBridgeCommand<EvaluateExpressionResponse>({
          command: "evaluateExpression",
          args: {
            expression: args.expression,
            sessionId: args.sessionId,
            frameId: args.frameId,
            context: args.context,
          },
        });
        return { content: [{ type: "text" as const, text: formatToolResult({ data: result }) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatErrorResult({ error }) }], isError: true };
      }
    }
  );
};
