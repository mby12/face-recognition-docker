const { MongoClient } = require('mongodb');

const globalMongoConnection = new MongoClient(`mongodb://root92441:19661fa1134f5ca8eef87ab8b4778850c68d3582b19973447b1b408031ba7686@mongo_server:27017`);
module.exports = globalMongoConnection;