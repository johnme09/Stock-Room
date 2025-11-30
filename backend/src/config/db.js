import mongoose from "mongoose";

const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("Missing MongoDB connection string");
  }

  mongoose.set("strictQuery", false);

  await mongoose.connect(mongoUri);
};

export default connectDB;

