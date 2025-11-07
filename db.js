import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env file");
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI);
        // Connection details will be logged by the caller
        return conn;
    } catch (error) {
        // More detailed error information
        if (error.message.includes("MONGODB_URI")) {
            throw new Error("MONGODB_URI is not defined in .env file. Please create a .env file with your MongoDB connection string.");
        }
        if (error.message.includes("authentication failed")) {
            throw new Error("MongoDB authentication failed. Check your username and password in MONGODB_URI.");
        }
        if (error.message.includes("ECONNREFUSED")) {
            throw new Error("Cannot connect to MongoDB. Make sure MongoDB is running or check your connection string.");
        }
        throw error;
    }
}

export default connectDB;