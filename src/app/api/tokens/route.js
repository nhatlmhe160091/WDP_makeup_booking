import clientPromise from "@quanlysanbong/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const tokenCollection = db.collection("tokens");

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    const token = searchParams.get("token");
    const type = searchParams.get("type");

    if (!token || !type) {
      return NextResponse.json({ success: false, message: "Token and type are required" }, { status: 400 });
    }

    // Kiểm tra token có hợp lệ không
    const tokenData = await tokenCollection.findOne({ token, type });
    if (!tokenData) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: tokenData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const tokenCollection = db.collection("tokens");

    const { user_id, email, token, type, status, created_at, expires_at } = await req.json();

    if (!user_id || !email || !token || !type || !status || !created_at || !expires_at) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const result = await tokenCollection.insertOne({
      user_id,
      email,
      token,
      type,
      status,
      created_at: new Date(created_at),
      expires_at: new Date(expires_at)
    });

    return NextResponse.json({ success: true, message: "Token created successfully", insertedId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const tokenCollection = db.collection("tokens");
    const userCollection = db.collection("users");

    const { token, type, status } = await req.json();

    if (!token || !type || !status) {
      return NextResponse.json({ success: false, message: "Token, type and new data are required" }, { status: 400 });
    }

    const tokenData = await tokenCollection.findOne({ token, type });
    if (!tokenData) {
      return NextResponse.json({ success: false, message: "Token not found" }, { status: 404 });
    }

    // Cập nhật token
    const result = await tokenCollection.updateOne(
      { token, type },
      {
        $set: { status }
      }
    );

    if (type === "email_verification" && status === "verified") {
      // Cập nhật trạng thái người dùng nếu token là xác thực email
      await userCollection.updateOne({ email: tokenData.email }, { $set: { active: true } });
    }

    return NextResponse.json({ success: true, message: "Token updated successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
