import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import cors from "cors";

dotenv.config();

// 🚨 Simple, permissive CORS (works for Vercel + local dev)
app.use(
  cors({
    origin: true,          // reflect the request Origin header
    credentials: true,     // allow cookies / auth headers
  })
);

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

const start = async () => {
  try {
    await connectDB(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`API server ready on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();