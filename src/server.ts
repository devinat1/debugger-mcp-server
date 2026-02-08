import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "crypto";
import express from "express";
import { registerAllTools } from "./tools/toolRegistry.js";

const createConnectedServer = (): McpServer => {
  const server = new McpServer({
    name: "debugger-mcp-server",
    version: "0.1.0",
  });
  registerAllTools({ server });
  return server;
};

export const createApp = (): express.Express => {
  const app = express();
  app.use(express.json());

  const transports = new Map<string, StreamableHTTPServerTransport | SSEServerTransport>();

  // ==========================================================================
  // Streamable HTTP transport (protocol version 2025-11-25)
  // ==========================================================================

  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (sessionId !== undefined && transports.has(sessionId)) {
      const existingTransport = transports.get(sessionId) as NonNullable<ReturnType<typeof transports.get>>;
      if (existingTransport instanceof SSEServerTransport) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Session uses a different transport protocol." },
          id: null,
        });
        return;
      }
      await existingTransport.handleRequest(req, res, req.body);
      return;
    }

    if (isInitializeRequest(req.body)) {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          transports.set(newSessionId, transport);
        },
      });

      transport.onclose = () => {
        const transportSessionId = transport.sessionId;
        if (transportSessionId !== undefined) {
          transports.delete(transportSessionId);
        }
      };

      const server = createConnectedServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    }

    res.status(400).json({ error: "Invalid request. Missing session ID or not an initialize request." });
  });

  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (sessionId !== undefined && transports.has(sessionId)) {
      const existingTransport = transports.get(sessionId) as NonNullable<ReturnType<typeof transports.get>>;
      if (existingTransport instanceof SSEServerTransport) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Session uses a different transport protocol." },
          id: null,
        });
        return;
      }
      await existingTransport.handleRequest(req, res);
      return;
    }
    res.status(400).json({ error: "Invalid session." });
  });

  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (sessionId !== undefined && transports.has(sessionId)) {
      const existingTransport = transports.get(sessionId) as NonNullable<ReturnType<typeof transports.get>>;
      if (existingTransport instanceof SSEServerTransport) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Session uses a different transport protocol." },
          id: null,
        });
        return;
      }
      await existingTransport.handleRequest(req, res);
      transports.delete(sessionId);
      return;
    }
    res.status(400).json({ error: "Invalid session." });
  });

  // ==========================================================================
  // Legacy SSE transport (protocol version 2024-11-05)
  // ==========================================================================

  app.get("/sse", async (_req, res) => {
    const transport = new SSEServerTransport("/messages", res);
    transports.set(transport.sessionId, transport);

    res.on("close", () => {
      transports.delete(transport.sessionId);
    });

    const server = createConnectedServer();
    await server.connect(transport);
  });

  app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as string | undefined;
    if (sessionId === undefined) {
      res.status(400).json({ error: "Missing sessionId query parameter." });
      return;
    }

    const existingTransport = transports.get(sessionId);
    if (!(existingTransport instanceof SSEServerTransport)) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "No SSE transport found for this session." },
        id: null,
      });
      return;
    }

    await existingTransport.handlePostMessage(req, res, req.body);
  });

  return app;
};
