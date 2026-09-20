/**
 * MCP connection endpoint.
 *
 * Answers "what URL do I give my AI host, and what will it be able to do?" —
 * the only thing the Connect page in the web app needs from the server.
 */

import type { Request, Response } from "express";

import { getMcpConnection } from "../services/mcp.service.js";
import { sendData } from "../utils/response.js";

export function getMcpConnectionHandler(_req: Request, res: Response) {
  sendData(res, getMcpConnection());
}
