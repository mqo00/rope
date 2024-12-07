import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  const { username, chatType, timestamp, message, conversationId, gameName } =
    await request.json();
  // chatType user / gpt
  const client = await clientPromise;

  const db = client.db("multipleGame");
  const collection = db.collection("conversation");
  const conversation = await collection.findOne({ conversationId });
  let result;
  if (conversation) {
    result = { insertedId: conversation._id };
    let messages = [
      ...conversation.messages,
      { chatType, createTime: timestamp, message },
    ];
    await collection.updateOne({ conversationId }, { $set: { messages } });
  } else {
    result = await collection.insertOne({
      username,
      createTime: timestamp,
      messages: [{ chatType, createTime: timestamp, message }],
      conversationId,
      gameName,
    });
  }

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
