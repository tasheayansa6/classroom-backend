import cors from "cors";
import express from 'express';
import subjectsRouter from "./routes/subjects.js";
import securityMiddleware from "./middleware/security.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();
const PORT = 4000; // Hardcoded for debugging

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

/**
 * FIX 1: The "Dead Simple" Auth Mount
 * Using app.use with a string prefix is the most stable way in Express.
 * This MUST come before express.json()
 */
app.use("/api/auth", (req, res) => {
    return toNodeHandler(auth)(req, res);
});

/**
 * FIX 2: Body Parser
 * Only runs for routes that aren't /api/auth
 */
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

app.use(securityMiddleware);
app.use("/api/subjects", subjectsRouter);

app.get('/', (req, res) => {
    res.send('API is Online');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVER IS LIVE AT http://localhost:${PORT}`);
});