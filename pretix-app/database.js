const { MongoClient } = require('mongodb');

const database_connect = function () {
  const self = this;
  const url = 'mongodb://localhost:27017';
  const dbName = 'tickets';

  self.connect = async function () {
    let client;
    try {
      client = await MongoClient.connect(url);
      console.log('[DB] Connected to MongoDB');

      const db = client.db(dbName);
      const collection = db.collection('scanned_tickets'); // or your actual collection name

      const scanned_tickets = await collection.find().toArray();
      console.log('[DB] Retrieved', scanned_tickets.length, 'tickets from DB');

      return scanned_tickets;
    } catch (err) {
      console.error('[DB] Failed to connect to MongoDB:', err);
      return []; // or throw err;
    } finally {
      if (client) {
        await client.close();
        console.log('[DB] MongoDB connection closed.');
      }
    }
  };
};

module.exports = database_connect;
