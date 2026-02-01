import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const APP_PASSWORD = process.env.APP_PASSWORD;

// Sanitize username to be valid MongoDB database name
const sanitizeDbName = (name: string | null | undefined): string => {
  if (!name) return 'anonymous';
  // Replace invalid characters with underscore, limit length
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 64) || 'anonymous';
};

export async function POST(request: Request) {
  try {
    const { gameName, baseExplanations, gameDoc, gameStepsCodes, password, username } = await request.json();

    if (password !== APP_PASSWORD) {
      return NextResponse.json({ success: false, error: "Invalid password" });
    }

    const dbName = sanitizeDbName(username);
    const client = await clientPromise;
    // Use username as database name, "gamedata" as collection
    const collection = client.db(dbName).collection("gamedata");
    
    await collection.updateOne(
      { gameName },
      { $set: { gameName, baseExplanations, gameDoc, gameStepsCodes } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/data error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const dbName = sanitizeDbName(new URL(request.url).searchParams.get('username'));
    const client = await clientPromise;
    // Use username as database name, "gamedata" as collection
    const data = await client.db(dbName).collection("gamedata").find().toArray();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/data error:", error);
    return NextResponse.json({ data: [], error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { gameName, password, username } = await request.json();

    if (password !== APP_PASSWORD) {
      return NextResponse.json({ success: false, error: "Invalid password" });
    }

    const dbName = sanitizeDbName(username);
    const client = await clientPromise;
    await client.db(dbName).collection("gamedata").deleteOne({ gameName });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/data error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
