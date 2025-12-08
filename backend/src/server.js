import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = "mongodb+srv://shared_team_user:sPen4m55fw1Eha8Y@cluster0.pbgatsr.mongodb.net/stock-room";

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

