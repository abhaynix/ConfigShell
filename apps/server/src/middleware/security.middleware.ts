/**
 * Hardening headers for Express responses.
 *
 * Sets security headers on all outgoing HTTP responses:
 * - `X-Content-Type-Options: nosniff` (prevents MIME-type sniffing)
 * - `X-Frame-Options: DENY` (prevents clickjacking attacks)
 * - `Referrer-Policy: strict-origin-when-cross-origin` (limits referrer info leakage)
 * - `X-DNS-Prefetch-Control: off` (disables DNS prefetching)
 */

import type { NextFunction, Request, Response } from "express";

export function securityHeadersMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  next();
}
