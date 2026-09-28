import type { Request, Response, NextFunction } from "express";
import { formatErrorResponse } from "../utils/error-handler.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  console.error(`[Error] ${req.method} ${req.url}:`, err);
  const formatted = formatErrorResponse(err);
  res.status(formatted.statusCode).json(formatted);
}
