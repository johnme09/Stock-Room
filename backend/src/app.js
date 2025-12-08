import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:4000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", routes);

// Serve static files from the frontend build
const staticPath = path.join(__dirname, '../../frontend/dist');
console.log('Serving static files from:', staticPath);

// First, try to serve static files
app.use(express.static(staticPath));

// Then handle API 404 (AFTER static files but BEFORE SPA route)
app.use("/api", (_req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// SPA fallback - ONLY for non-API, non-file routes
app.get(/^\/(.*)$/, (req, res) => {
  // Skip if it's an API route (should have been caught above)
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: "API route not found" });
  }

  // Serve the SPA
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('=== ERROR DETAILS ===');
  console.error('Path:', req.path);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('===================');
  next(err);
});

app.use(errorHandler);

export default app;