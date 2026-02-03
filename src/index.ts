import classes from "./routes/classes.js";

import('apminsight')
    .then(({ default: AgentAPI }) => AgentAPI.config())
    .catch(() => console.log('APM not available in this environment'));

import cors from "cors";
import express from 'express';
import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js";
import classesRouter from "./routes/classes.js";
import securityMiddleware from "./middleware/security.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import 'dotenv/config'; // this automatically loads variables from .env

const app = express();
const PORT = 4000;



app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

// Auth route
app.use("/api/auth", (req, res) => {
    return toNodeHandler(auth)(req, res);
});

// Body parser for other routes
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Security middleware
app.use(securityMiddleware);

// Mount your API routes
app.use("/api/subjects", subjectsRouter);
app.use("/api/users", usersRouter); // <-- ADD THIS
app.use("/api/classes", classesRouter);

// Root test
app.get('/', (req, res) => {
    res.send('API is Online');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVER IS LIVE AT http://localhost:${PORT}`);
});
