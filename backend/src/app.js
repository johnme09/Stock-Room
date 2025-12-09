import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:4000", "https://stockroom-1078634816222.us-central1.run.app"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", routes);

// API 404 handler
app.use("/api", (_req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Serve static files from the frontend build
const staticPath = path.join(__dirname, 'dist'); // Changed from '../frontend/dist'

// Debug: Log available files
console.log('=== DEBUG ===');
console.log('Current directory:', __dirname);
console.log('Static path:', staticPath);
if (fs.existsSync(staticPath)) {
  console.log('Dist folder exists, contents:', fs.readdirSync(staticPath));
  if (fs.existsSync(path.join(staticPath, 'assets'))) {
    console.log('Assets folder exists, has', fs.readdirSync(path.join(staticPath, 'assets')).length, 'files');
  }
}

// Serve static files with explicit paths
app.use('/assets', express.static(path.join(staticPath, 'assets')));
app.use(express.static(staticPath));

// SPA fallback - ONLY for non-asset, non-API routes
app.get(/^\/(.*)$/, (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Skip asset files (already handled by static middleware)
  if (req.path.startsWith('/assets/')) {
    return next();
  }
  
  // Skip other static file extensions
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json', '.txt'];
  if (staticExtensions.some(ext => req.path.endsWith(ext))) {
    return next();
  }
  
  // Only serve index.html for actual page routes
  res.sendFile(path.join(staticPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      next(err);
    }
  });
});

// Final 404 for non-API routes that aren't pages
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    res.status(404).send('Not found');
  }
});

app.use(errorHandler);

export default app;
