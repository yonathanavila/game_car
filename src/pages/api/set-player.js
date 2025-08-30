import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function post({ request }) {
    try {
        const client = await clientPromise;
        const db = client.db("taxi_driver"); // your DB name
        const playersCollection = db.collection("players");

        const data = await request.json();

        // Example of expected data
        // {
        //   "id": "optional existing player id",
        //   "username": "player1",
        //   "score": 100,
        //   "car": "car1",
        //   "balance": 5000
        // }

        if (!data.username) {
            return { status: 400, body: JSON.stringify({ error: "Username is required" }) };
        }

        let result;

        if (data.id) {
            // Update existing player
            result = await playersCollection.updateOne(
                { _id: new ObjectId() },
                { $set: { ...data, updatedAt: new Date() } }
            );
        } else {
            // Insert new player
            result = await playersCollection.insertOne({
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        return { status: 200, body: JSON.stringify({ success: true, result }) };
    } catch (e) {
        return { status: 500, body: JSON.stringify({ error: e.message }) };
    }
}
