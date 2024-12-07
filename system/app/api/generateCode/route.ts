import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  const { username, code, timestamp, stepName, conversationId,gameName } =
    await request.json();
  // chatType user / gpt
  const client = await clientPromise;
  const db = client.db("multipleGame");
  const collection = db.collection("generateCode");

  const result = await collection.insertOne({
    username,
    code,
    timestamp,
    stepName,
    conversationId,
    gameName
  });

  return new Response(
    JSON.stringify({ success: true, id: result.insertedId }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
