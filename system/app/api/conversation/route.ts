import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Sanitize username to be valid MongoDB database name
const sanitizeDbName = (name: string | null | undefined): string => {
  if (!name) return 'anonymous';
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 64) || 'anonymous';
};

export async function POST(request: Request) {
  try {
    const { username, chatType, timestamp, message, conversationId, gameName } =
      await request.json();
    
    const dbName = sanitizeDbName(username);
    const client = await clientPromise;
    // Use username as database name, "conversation" as collection
    const collection = client.db(dbName).collection("conversation");
    
    const conversation = await collection.findOne({ conversationId });
    
    if (conversation) {
      await collection.updateOne(
        { conversationId },
        { $push: { messages: { chatType, createTime: timestamp, message } } }
      );
      return NextResponse.json({ success: true, id: conversation._id });
    }
    
    const { insertedId } = await collection.insertOne({
      createTime: timestamp,
      messages: [{ chatType, createTime: timestamp, message }],
      conversationId,
      gameName,
    });
    
    return NextResponse.json({ success: true, id: insertedId });
  } catch (error) {
    console.error("conversation error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
