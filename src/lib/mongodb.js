import { MongoClient } from "mongodb";

const uri = import.meta.env.MONGODB_URI; // store connection string in env
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env");
}

if (process.env.NODE_ENV === "development") {
    // In development, use a global variable to avoid creating multiple connections
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production, create a new client
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;
