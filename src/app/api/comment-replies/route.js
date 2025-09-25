import getObjectId from "@quanlysanbong/lib/getObjectId";
import clientPromise from "@quanlysanbong/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const repliesCol = db.collection("comment_replies");

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const commentId = searchParams.get("commentId");

    const query = commentId ? { commentId: getObjectId(commentId) } : {};
    const replies = await repliesCol.find(query).sort({ created_at: -1 }).toArray();

    return NextResponse.json({ success: true, payload: replies });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const repliesCol = db.collection("comment_replies");

    const body = await req.json();
    const { commentId, userId, content } = body;
    if (!commentId || !userId || !content || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const doc = {
      commentId: getObjectId(commentId),
      userId: getObjectId(userId),
      content: content.trim(),
      created_at: new Date()
    };
    const res = await repliesCol.insertOne(doc);
    return NextResponse.json({ success: true, payload: { _id: res.insertedId, ...doc } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const repliesCol = db.collection("comment_replies");

    const body = await req.json();
    if (!body._id) return NextResponse.json({ success: false, error: "Missing _id" }, { status: 400 });
    const result = await repliesCol.deleteOne({ _id: getObjectId(body._id) });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


