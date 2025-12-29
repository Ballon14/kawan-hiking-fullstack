import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://iqbal:iqbal@100.64.75.107:27017/?authSource=admin';
const dbName = process.env.MONGODB_DB || 'kawan_hiking';

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 5,
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function closeConnection() {
  if (client) {
    await client.close();
  }
}

export default clientPromise;
