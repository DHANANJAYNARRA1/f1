import express, { type Request, Response, NextFunction } from "express";
import { createServer } from 'http';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectDB } from "./db";
import mongoose from "mongoose";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: 'http://localhost:3000', // Change to your frontend URL if different
  credentials: true
}));

app.use(session({
  secret: 'your-secret-key', // use a strong secret in production!
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set to true if using HTTPS
    sameSite: 'lax'
  }
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from /uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Only override res.json if it exists and is a function
  if (typeof res.json === 'function') {
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

async function startServer() {
  try {
    await connectDB(); // Wait for MongoDB connection
    console.log('MongoDB connected!');

    const server = createServer(app);
    registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Port selection logic
    const DEFAULT_PORT = 5000;
    const MAX_PORT = 5010;
    let port = DEFAULT_PORT;
    let started = false;
    let lastError = null;
    while (!started && port <= MAX_PORT) {
      try {
        await new Promise<void>((resolve, reject) => {
          server.listen({
            port,
            host: "0.0.0.0",
            credential: true,
          }, (err?: any) => {
            if (err) return reject(err);
            resolve();
          });
        });
        started = true;
        log(`serving on port ${port}`);
      } catch (err: any) {
        if (err.code === 'EADDRINUSE') {
          log(`Port ${port} in use, trying next port...`);
          port++;
          lastError = err;
        } else {
          throw err;
        }
      }
    }
    if (!started) {
      throw lastError || new Error('Could not start server on any port');
    }
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();