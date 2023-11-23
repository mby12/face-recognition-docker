const { MongoClient } = require('mongodb');

const globalMongoConnection = new MongoClient(process.env.MONGO_DSN);
module.exports = globalMongoConnection;