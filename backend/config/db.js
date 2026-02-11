const mongoose = require("mongoose");

const connectedDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("MongoDB connected");
        // MongoDB connected
    }catch(err){
        // MongoDB connection error
        console.error("MongoDB connection error:", err.message || err);
        process.exit(1);
    }
};

module.exports = connectedDB;