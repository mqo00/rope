import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Sanitize username to be valid MongoDB database name
const sanitizeDbName = (name: string | null | undefined): string => {
  if (!name) return 'anonymous';
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 64) || 'anonymous';
};

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const dbName = sanitizeDbName(data.username);
    
    const client = await clientPromise;
    // Use username as database name, "clickstream" as collection
    const collection = client.db(dbName).collection('clickstream');

    const logDoc = {
      url: data.url, 
      timestamp: data.timestamp, 
      buttonId: data.buttonId, 
      gameName: data.gameName,
      eventType: data.eventType || 'button_click',
      currentStep: data.currentStep,
      stage: data.stage,
      ...(data.canvasX !== undefined && { canvasX: data.canvasX }),
      ...(data.canvasY !== undefined && { canvasY: data.canvasY }),
      ...(data.canvasWidth !== undefined && { canvasWidth: data.canvasWidth }),
      ...(data.canvasHeight !== undefined && { canvasHeight: data.canvasHeight }),
      ...(data.sandboxId !== undefined && { sandboxId: data.sandboxId }),
      ...(data.key !== undefined && { key: data.key }),
    };

    const { insertedId } = await collection.insertOne(logDoc);
    return NextResponse.json({ success: true, id: insertedId });
  } catch (error) {
    console.error('logClick error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
