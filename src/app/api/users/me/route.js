import { validateToken } from "@muahub/lib/auth";
import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
// API GET để lấy danh sách users
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const accountsCollection = db.collection("users");

    let objectId = await validateToken(req);
    if (!objectId) {
      // Lấy từ session nếu chưa có
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        objectId = getObjectId(session.user.id);
      }
    }
    if (!objectId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    // Lấy dữ liệu từ bảng users _id = objectid
    const user = await accountsCollection.findOne({
      _id: objectId
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
  // console.log("Fetched user:", user);
  // Trả về dữ liệu user kèm id
  return NextResponse.json({ success: true, data: { ...user, id: user._id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
