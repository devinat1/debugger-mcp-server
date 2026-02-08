# debugger-mcp-server

An MCP server that enables AI agents to debug code in VS Code. It exposes debugging tools (breakpoints, stepping, variable inspection) over the [Model Context Protocol](https://modelcontextprotocol.io), bridging to a companion VS Code extension that controls the actual debugger.

## Setup

1. Install [Agentic Debugger](https://open-vsx.org/extension/devinat1/agentic-debugger) on Cursor or VS Code
2. Add the MCP server to your client configuration:

**Claude Code:**

```bash
claude mcp add debugger --scope user -- npx debugger-mcp-server
```

**Claude Desktop, Cursor, or other MCP clients:**

```json
{
  "mcpServers": {
    "debugger": {
      "command": "npx",
      "args": ["debugger-mcp-server"]
    }
  }
}
```

The package is available on [npm](https://www.npmjs.com/package/debugger-mcp-server).

## Available Tools

| Category | Tool | Description |
|---|---|---|
| Breakpoints | `setBreakpoints` | Set breakpoints in a file |
| Breakpoints | `removeBreakpoints` | Remove breakpoints |
| Breakpoints | `listBreakpoints` | List all active breakpoints |
| Debug Session | `startDebugSession` | Launch a debug session |
| Debug Session | `stopDebugSession` | Stop the active debug session |
| Debug Session | `stepOver` | Step over the current line |
| Debug Session | `stepInto` | Step into a function call |
| Debug Session | `stepOut` | Step out of the current function |
| Debug Session | `continueExecution` | Continue execution to next breakpoint |
| Debug Session | `getVariables` | Inspect variables in current scope |
| Debug Session | `getCallStack` | View the call stack |
| Debug Session | `evaluateExpression` | Evaluate an expression in the debug context |
