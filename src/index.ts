#!/usr/bin/env node
import { createApp } from "./server.js";

const DEFAULT_PORT = 6090;
const PORT = parseInt(process.env["PORT"] ?? String(DEFAULT_PORT), 10);

const app = createApp();

app.listen(PORT, () => {
  console.log(`Debugger MCP server running on port ${PORT}.`);
});
