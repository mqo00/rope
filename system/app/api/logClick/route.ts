
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  const { username, url, timestamp, buttonId,gameName } = await request.json();
  const client = await clientPromise;
  const db = client.db('multipleGame');
  const collection = db.collection('clickLogs');

  const result = await collection.insertOne({ username, url, timestamp, buttonId,gameName });

  return new Response(JSON.stringify({ success: true, id: result.insertedId }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
