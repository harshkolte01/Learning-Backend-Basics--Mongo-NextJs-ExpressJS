const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
        });
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error(`Error connecting MongoDB: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;