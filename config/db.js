const mongoose = require("mongoose");

const ConnectDb = async () => {
  try {
    const db = await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://bsmcustomer01:bsm123@cluster0.4ig22.mongodb.net/BSM_App",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 60000, // 60 seconds (MongoDB server selection timeout)
        socketTimeoutMS: 60000, // 60 seconds (Keep socket connection alive)
        maxPoolSize: 10, // Limits concurrent connections (adjust as needed)
      }
    );
    console.log(`✅ MongoDB Connected: ${db.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error:`, error);
  }
};

module.exports = ConnectDb;
