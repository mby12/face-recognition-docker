// // import { MongoClient } from 'mongodb';

const globalMongoConnection = require("./mongo_connection");

// import globalMongoClient from "./mongo_client.js";

// export default globalMongoClient.db("bca_access_token");
module.exports = globalMongoConnection.db("face_recognition");