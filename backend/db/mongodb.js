// db/mongodb.js
const { MongoClient } = require('mongodb');

const url = "mongodb://localhost:27017";
const dbName = "socialdb1";

class DB {
  constructor() {
    this.client = new MongoClient(url);
    this.db = null;
    this.ready = this.init(); // Promise that resolves when connected
  }

  async init() {
    try {
      await this.client.connect();
      console.log("✅ Connected to MongoDB");
      this.db = this.client.db(dbName);
      return this.db;
    } catch (err) {
      console.error("❌ MongoDB connection failed:", err);
      throw err;
    }
  }

  // shortcut method
  collection(name) {
    if (!this.db) throw new Error("DB not initialized yet!");
    return this.db.collection(name);
  }
}

// Export a *singleton* instance just like Sequelize does
module.exports = new DB();
