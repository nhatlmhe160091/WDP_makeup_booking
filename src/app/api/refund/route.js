import getObjectId from "@muahub/lib/getObjectId";
import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";

const DB_NAME = "accounts";
const COLLECTION_NAME = "refunds";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const bankingsCollection = db.collection(COLLECTION_NAME);

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const userId = searchParams.get("userId");

    const searchQuery = {};
    if (userId) searchQuery.userId = getObjectId(userId);

    const bankings = await bankingsCollection
      .find(searchQuery)
      .sort({ created_at: -1 }) // Sort by created_at in ascending order
      .toArray();

    return new NextResponse(JSON.stringify({ success: true, data: bankings }));
  } catch (error) {
    return new NextResponse(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

// API POST
export async function POST(req) {
  try {
    const client = await clientPromise;

    const db = client.db(DB_NAME);
    const bankingsCollection = db.collection(COLLECTION_NAME);

    let { totalAmount, discount, type, userId, bank_info_number, bank_info, name, email, role } = await req.json();

    const dataOrder = await bankingsCollection.insertOne({
      totalAmount,
      discount,
      type,
      userId: getObjectId(userId),
      bank_info_number,
      bank_info,
      name,
      email,
      role,

      status: "pending",
      created_at: new Date(),
      transactionDate: null,
      updated_at: new Date()
    });

    return NextResponse.json({ success: true, message: "Nhận qr thành công", data: dataOrder });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const client = await clientPromise;

    const db = client.db(DB_NAME);
    const bankingsCollection = db.collection(COLLECTION_NAME);

    let { id, status } = await req.json();

    const ObjectId = getObjectId(id);

    const backingDocument = await bankingsCollection.findOne({ _id: ObjectId });
    if (!backingDocument) {
      return NextResponse.json({ success: false, message: "Banking document not found" }, { status: 404 });
    }
    // Update the banking document with the new status
    await bankingsCollection.updateOne(
      { _id: ObjectId },
      {
        $set: {
          status,
          transactionDate: new Date(),
          updated_at: new Date()
        }
      }
    );

    // If you need to modify or return the banking document, continue with your logic here
    return NextResponse.json({ success: true, data: "done" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
