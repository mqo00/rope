import clientPromise, { ObjectId } from "@/lib/mongodb";

export async function POST(request) {
  const { gameName, baseExplanations, gameDoc, gameStepsCodes, password } =
    await request.json();

  if (password != process.env.PASSWORD) {
    return new Response(JSON.stringify({ success: false }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const client = await clientPromise;
  const db = client.db("multipleGame");
  const collection = db.collection("data");
  const gameObj = await collection.findOne({ gameName });
  if (gameObj) {
    await collection.updateOne(
      { gameName },
      { $set: { baseExplanations, gameDoc, gameStepsCodes } }
    );
  } else {
    const result = await collection.insertOne({
      gameName,
      baseExplanations,
      gameDoc,
      gameStepsCodes,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function GET(request) {
  // let query = request.url.split("?")[1]; // themeId=123&username=123
  // const params = new URLSearchParams(query);
  // const roomId = params.get("roomId");
  const client = await clientPromise;
  const db = client.db("multipleGame");
  const collection = db.collection("data");
  const result = await collection.find().toArray();
  return new Response(JSON.stringify({ data: result }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function DELETE(request) {
  const { gameName, password } =
    await request.json();

    if (password != process.env.PASSWORD) {
      return new Response(JSON.stringify({ success: false }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

  const client = await clientPromise;
  const db = client.db("multipleGame");
  const collection = db.collection("data");
  const result = await collection.deleteOne({gameName});
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
