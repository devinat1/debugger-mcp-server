#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/toolRegistry.js";

const server = new McpServer({
  name: "debugger-mcp-server",
  version: "0.1.0",
});

registerAllTools({ server });

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Debugger MCP server running on stdio.");
