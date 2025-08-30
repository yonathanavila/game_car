import clientPromise from "@/lib/mongodb";

export async function get({ params }) {
    try {
        const client = await clientPromise;
        const db = client.db("taxi_driver"); // your DB name
        const users = await db.collection("users").find({}).toArray();

        return {
            body: JSON.stringify(users),
            status: 200,
        };
    } catch (e) {
        return {
            status: 500,
            body: JSON.stringify({ error: e.message }),
        };
    }
}
