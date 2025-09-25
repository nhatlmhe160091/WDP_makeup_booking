import getObjectId from "@quanlysanbong/lib/getObjectId";
import clientPromise from "@quanlysanbong/lib/mongodb";
import { NextResponse } from "next/server";

// API GET để lấy danh sách replies
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");

    const repliesCollection = db.collection("replies");
    const accountsCollection = db.collection("users");

    const replies = await repliesCollection.find({}).sort({ created_at: -1 }).toArray();

    if (replies.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const userIds = replies.map((reply) => reply.userId);
    const users = await accountsCollection.find({ _id: { $in: userIds } }).toArray();

    const newReplies = replies.map((reply) => {
      const user = users.find((user) => user._id.toString() === reply.userId.toString());

      return {
        ...reply,
        user: user ? { name: user.name, email: user.email, phone: user.phone } : {}
      };
    });

    return NextResponse.json({
      success: true,
      data: newReplies
    });
  } catch (error) {
    console.error("Error in GET replies:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API POST để tạo một reply mới
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const repliesCollection = db.collection("replies");

    const { feedbackId, userId, content } = await req.json();

    // Validate required fields
    if (!feedbackId || !userId || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: feedbackId, userId, content" },
        { status: 400 }
      );
    }

    // Validate content không rỗng
    if (content.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Content cannot be empty" }, { status: 400 });
    }

    const newReply = {
      feedbackId: getObjectId(feedbackId),
      userId: getObjectId(userId),
      content: content.trim(),
      created_at: new Date()
    };

    await repliesCollection.insertOne(newReply);

    return NextResponse.json({
      success: true,
      message: "Reply created successfully"
    });
  } catch (error) {
    console.error("Error in POST replies:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API PUT để cập nhật một reply
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const repliesCollection = db.collection("replies");

    const { id, content } = await req.json();

    if (!id || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields: id, content" }, { status: 400 });
    }

    await repliesCollection.updateOne({ _id: getObjectId(id) }, { $set: { content, updated_at: new Date() } });

    return NextResponse.json({
      success: true,
      message: "Reply updated successfully",
      data: "ok"
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API DELETE để xóa một reply
export async function DELETE(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const repliesCollection = db.collection("replies");

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing reply ID" }, { status: 400 });
    }

    await repliesCollection.deleteOne({ _id: getObjectId(id) });

    return NextResponse.json({
      success: true,
      message: "Reply deleted successfully",
      data: "ok"
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
