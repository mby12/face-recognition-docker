const globalMongoConnection = require("./mongo_connection");

module.exports = globalMongoConnection.db(process.env.MONGO_DATABASE_NAME);