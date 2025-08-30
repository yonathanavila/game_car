import clientPromise from "@/lib/mongodb";


export async function get({ url }) {
    try {
        const client = await clientPromise;
        const db = client.db("taxi_driver"); // replace with your DB name
        const usersCollection = db.collection("users");

        // Get the user id or email from query params
        const userId = url.searchParams.get("id");
        const email = url.searchParams.get("email");

        // Build the query
        const query = userId
            ? { _id: new ObjectId(userId) } // if searching by ObjectId
            : email
                ? { email } // if searching by email
                : {};

        if (!userId && !email) {
            return { status: 400, body: JSON.stringify({ error: "Provide id or email" }) };
        }

        const user = await usersCollection.findOne(query);

        if (!user) {
            return { status: 404, body: JSON.stringify({ error: "User not found" }) };
        }

        return { status: 200, body: JSON.stringify(user) };
    } catch (e) {
        return { status: 500, body: JSON.stringify({ error: e.message }) };
    }
}