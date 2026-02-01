// db.js
const { MongoClient } = require("mongodb");

let db = null;
let _client = null;

const connectDb = (callback) => {
  const url = "mongodb://127.0.0.1:27017";

  const dbName = "moneymap";

  MongoClient.connect(url, {
    maxPoolSize: 10,      
    minPoolSize: 2,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
  })
    .then((client) => {
      console.log("Connected successfully to MongoDB");
      _client = client;
      db = client.db(dbName);
      callback(null);
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      callback(err);
    });
};

const getDb = () => {
  if (db) {
    return db;
  }
  throw new Error("Database not connected yet. Call connectDb first.");
};

const closeDb = async () => {
  if (_client) {
    await _client.close();
    console.log("MongoDB connection closed");
    db = null;
    _client = null;
  }
};

module.exports = {
  connectDb,
  getDb,
  closeDb,
};