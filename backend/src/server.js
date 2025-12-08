import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import cors from "cors";

dotenv.config();

// CORS SETUP FOR DEPLOYMENT
const rawClientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigin = rawClientUrl.replace(/\/$/, "");

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// PORT + MONGO CONFIG
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

// START SERVER + CONNECT DB
const start = async () => {
  try {
    await connectDB(MONGODB_URI);

    app.listen(PORT, () => {
      console.log(`API server ready on port ${PORT}`);
      console.log(`CORS allowed for: ${allowedOrigin}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();