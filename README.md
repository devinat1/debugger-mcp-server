# debugger-mcp-server

An MCP server that enables AI agents to debug code in VS Code. It exposes debugging tools (breakpoints, stepping, variable inspection) over the [Model Context Protocol](https://modelcontextprotocol.io), bridging to a companion VS Code extension that controls the actual debugger.

## Architecture

```
AI Agent  <-->  MCP Server (:6090)  <-->  VS Code Extension Bridge (:7070)  <-->  VS Code Debugger
                (this repo)                (agentic-debugger extension)
```

The two components communicate over HTTP. The extension writes its port to `~/.agentic-debugger/bridge-port`, which the MCP server reads to discover the bridge automatically.

## Setup

### 1. Install the VS Code Extension

Install [Agentic Debugger](https://open-vsx.org/extension/devinat1/agentic-debugger) on Cursor or Vscode. Once active, it starts a bridge server on port **7070** (configurable via `agenticDebugger.bridgePort` in VS Code settings).

### 2. Connect Your AI Agent

Add this to your MCP client configuration (e.g. Claude Desktop, Claude Code, Cursor):

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
| Analysis | `analyzeCode` | Analyze code with the VS Code language server |
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
