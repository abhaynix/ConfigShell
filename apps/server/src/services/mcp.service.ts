/**
 * What a user needs in order to connect ConfigShell to an AI host.
 *
 * The web app cannot work any of this out for itself. The public URL comes from
 * `PUBLIC_BASE_URL`, which only the server process knows, and the tool list
 * belongs to `@configshell/mcp`. Hardcoding either in the browser bundle would
 * put a second copy of the truth somewhere it would quietly go stale — the same
 * reason the web app asks the API for anything the resolver decides.
 *
 * Read-only and derived. Nothing here is stored, and nothing about it can be
 * influenced by a request.
 */

import { TOOLS, WITHHELD_CAPABILITIES } from "@configshell/mcp";
import { env } from "../config/env.js";

export function getMcpConnection() {
  return {
    /**
     * The URL a user pastes into Claude, ChatGPT, Cursor or any other MCP host.
     * Derived as `PUBLIC_BASE_URL + MCP_PATH` so the two halves cannot disagree.
     */
    url: env.publicMcpUrl,
    path: env.mcpPath,
    /** The remote transport. stdio exists too, but it is a local-only tool. */
    transport: "streamable-http",
    /**
     * Stated rather than left to be inferred. The endpoint is public and
     * read-only: there is no write path, no per-user data and nothing
     * user-scoped to protect, so an identity system would guard nothing.
     */
    authentication: "none",
    /** Every registered tool, so the page cannot list one that is not there. */
    tools: TOOLS.map((tool) => ({
      name: tool.name,
      title: tool.title,
      description: tool.description,
    })),
    /**
     * The capabilities deliberately withheld, with the reason. Published on
     * purpose: "what it will not do" is as much a part of the contract as the
     * tool list, and a user deciding whether to connect this is entitled to it.
     */
    withheld: WITHHELD_CAPABILITIES.map((capability) => ({
      name: capability.name,
      reason: capability.reason,
    })),
    /** The boundary, in the response itself rather than only in prose. */
    executesCommands: false,
  };
}
