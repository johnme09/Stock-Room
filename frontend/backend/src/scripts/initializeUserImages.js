import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
//iniatializer for user images field in database, feel free to reuse formatting for moderators and other variables as needed.
dotenv.config();

const DEFAULT_IMAGE = "";

const initializeUserImages = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all users where image field is undefined or null
    const usersToUpdate = await User.find({
      $or: [
        { image: { $exists: false } },
        { image: null },
      ],
    });

    if (usersToUpdate.length === 0) {
      console.log("All users already have the image field initialized.");
    } else {
      console.log(`Found ${usersToUpdate.length} users without image field. Initializing...`);

      // Update all users with undefined/null image to default value
      const result = await User.updateMany(
        {
          $or: [
            { image: { $exists: false } },
            { image: null },
          ],
        },
        { $set: { image: DEFAULT_IMAGE } }
      );

      console.log(`Successfully initialized ${result.modifiedCount} users with default image value.`);
    }

    console.log("Initialization complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error during initialization:", error);
    process.exit(1);
  }
};

initializeUserImages();
