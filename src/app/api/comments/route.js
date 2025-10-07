import getObjectId from "@muahub/lib/getObjectId";
import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    const stadiumId = searchParams.get("stadiumId");

    const db = client.db("accounts");
    const dbStadium = client.db("stadiums");
    const commentsCollection = db.collection("comments");
    const accountsCollection = db.collection("users");
    const stadiumsCollection = dbStadium.collection("stadium");
    let comments;
    if (stadiumId) {
      comments = await commentsCollection.find({
      stadiumId: getObjectId(stadiumId)
      }).sort({ created_at: -1 }).toArray();
    } else {
      comments = await commentsCollection.find({}).sort({ created_at: -1 }).toArray();
    }
    const userIds = comments.map((comment) => comment.userId);
    const stadiumIds = comments.map((comment) => comment.stadiumId);
    const users = await accountsCollection.find({ _id: { $in: userIds } }).toArray();
    const stadiums = await stadiumsCollection.find({ _id: { $in: stadiumIds } }).toArray();
    const newComments = comments.map((comment) => {
      const user = users.find((user) => user._id.toString() === comment.userId.toString());
      const stadium = stadiums.find((stadium) => stadium._id.toString() === comment.stadiumId.toString());
      return {
        ...comment,
        user: user ? { name: user.name, email: user.email, avatar: user.avatar } : {},
        stadium: stadium
          ? { stadiumName: stadium.stadiumName, location: stadium.location, locationDetail: stadium.locationDetail }
          : {}
      };
    });

    return NextResponse.json({
      success: true,
      data: newComments
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API POST để tạo một comment mới
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const commentsCollection = db.collection("comments");

    const body = await request.json();
    console.log("Request body:", body); // Debug

    // Kiểm tra dữ liệu đầu vào
    if (!body.stadiumId || !body.content || !body.userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: stadiumId, content, or userId" },
        { status: 400 }
      );
    }

    // Tạo comment mới
    const newComment = {
      stadiumId: getObjectId(body.stadiumId),
      content: body.content,
      userId: getObjectId(body.userId),
      images: Array.isArray(body.images) ? body.images : [],
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await commentsCollection.insertOne(newComment);
    console.log("Inserted comment ID:", result.insertedId); // Debug

    return NextResponse.json({
      success: true,
      message: "Comment created successfully",
      payload: { _id: result.insertedId, ...newComment }
    });
  } catch (error) {
    console.error("Error creating comment:", error); // Debug
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
// thêm api sửa và xóa comment
export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const commentsCollection = db.collection("comments");

    const body = await request.json();
    console.log("Request body for update:", body); // Debug

    // Kiểm tra dữ liệu đầu vào
    if (!body._id || !body.content) {
      return NextResponse.json({ success: false, error: "Missing required fields: _id or content" }, { status: 400 });
    }

    // Cập nhật comment
    const result = await commentsCollection.updateOne(
      { _id: getObjectId(body._id) },
      { $set: { content: body.content, updated_at: new Date() } }
    );
    console.log("Update result:", result); // Debug
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: "Comment updated successfully",
      payload: { _id: body._id, content: body.content }
    });
  } catch (error) {
    console.error("Error updating comment:", error); // Debug
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API DELETE để xóa một comment
export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const commentsCollection = db.collection("comments");

    const body = await request.json();
    console.log("Request body for delete:", body); // Debug

    // Kiểm tra dữ liệu đầu vào
    if (!body._id) {
      return NextResponse.json({ success: false, error: "Missing required field: _id" }, { status: 400 });
    }

    // Xóa comment
    const result = await commentsCollection.deleteOne({ _id: getObjectId(body._id) });
    console.log("Delete result:", result); // Debug
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting comment:", error); // Debug
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

//
