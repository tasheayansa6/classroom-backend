import { slidingWindow } from "@arcjet/node";
import type { ArcjetNodeRequest } from "@arcjet/node";
import type { NextFunction, Request, Response } from "express";
import aj from "../config/arcjet.js";

type RateLimitRole = "admin" | "teacher" | "student" | "guest";

const securityMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.method === "OPTIONS" || process.env.NODE_ENV === "test") {
        return next();
    }

    try {
        // Use type assertion or optional chaining to avoid TS errors on req.user
        const role = ((req as any).user?.role as RateLimitRole) ?? "guest";

        let limit: number;
        let message: string;

        switch (role) {
            case "admin":
                limit = 100; // Increased for development
                message = "Admin limit exceeded.";
                break;
            case "teacher":
            case "student":
                limit = 50;  // Increased for development
                message = "User limit exceeded.";
                break;
            default:
                // Increase this from 5 to 50 so Refine doesn't break during dev
                limit = 50;
                message = "Guest limit exceeded. Please log in for higher limits.";
                break;
        }

        const client = aj.withRule(
            slidingWindow({
                mode: "LIVE",
                interval: "1m",
                max: limit,
            })
        );

        const remoteAddress = req.ip || req.socket.remoteAddress || "127.0.0.1";

        const arcjetRequest: ArcjetNodeRequest = {
            headers: req.headers,
            method: req.method,
            url: req.originalUrl ?? req.url,
            socket: {
                remoteAddress: remoteAddress,
            },
        };

        const decision = await client.protect(arcjetRequest);

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                // Add headers so the frontend knows when to try again
                res.set({
                    "X-RateLimit-Limit": limit.toString(),
                    "Retry-After": "60",
                });
                return res.status(429).json({ error: "Too Many Requests", message });
            }
            if (decision.reason.isBot()) {
                return res.status(403).json({ error: "Forbidden", message: "Bot detected" });
            }
            return res.status(403).json({ error: "Forbidden", message: "Denied" });
        }

        next();
    } catch (error) {
        console.error("Arcjet error, bypassing security check:", error);
        next();
    }
};

export default securityMiddleware;