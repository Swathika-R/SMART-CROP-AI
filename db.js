const mongoose = require('mongoose');

global.dbConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000 // Quick timeout to fall back quickly if local Mongo is not running
    });
    global.dbConnected = true;
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Failed: ${error.message}`);
    console.warn(`📁 Falling back to resilient local JSON file database at ./owner/data/`);
    global.dbConnected = false;
    return null;
  }
};

module.exports = connectDB;
