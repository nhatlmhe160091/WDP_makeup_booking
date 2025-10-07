import { validateToken } from "@muahub/lib/auth";
import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";

// API GET để lấy danh sách users
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const accountsCollection = db.collection("users");

    const objectId = await validateToken(req);

    // Lấy dữ liệu từ bảng users _id = objectid
    const user = await accountsCollection.findOne({
      _id: objectId
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Trả về dữ liệu user
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
