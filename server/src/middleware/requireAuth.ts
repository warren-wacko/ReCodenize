import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../lib/jwt.js";
import { ApiError } from "./errorHandler.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) throw new ApiError(401, "Unauthorized");
  try {
    const { userId } = verifyJwt(token);
    req.userId = userId;
    next();
  } catch {
    throw new ApiError(401, "Invalid token");
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (token) {
    try {
      const { userId } = verifyJwt(token);
      req.userId = userId;
    } catch {
      // ignore — treat as anonymous
    }
  }
  next();
}
