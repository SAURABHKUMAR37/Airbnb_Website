const { MongoClient } = require("mongodb");

let db;

async function mongoConnect() {
  const client = await MongoClient.connect(process.env.MONGO_URL);
  db = client.db("airbnb");
  console.log("MongoDB Connected");
}

function getDb() {
  return db;
}

module.exports = {
  mongoConnect,
  getDb,
};