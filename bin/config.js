import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./bin/.env" });

const connectDb = async () => {
  const url = process.env.URL;
  try {
    await mongoose.connect(url);
    console.log("✅ Successfully connected to the database");
  } catch (err) {
    console.error(`Error connecting to the database: ${err.message}`);
    process.exit(1); 
  }
};

export default connectDb;
