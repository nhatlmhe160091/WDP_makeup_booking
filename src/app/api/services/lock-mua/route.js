import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";
import getObjectId from "@muahub/lib/getObjectId";
const DB_NAME = "services";
const COLLECTION_NAME = "service";

// API PUT - Khóa toàn bộ dịch vụ của MUA (makeup_artist) theo id
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const servicesCollection = db.collection(COLLECTION_NAME);
    const body = await req.json();
    const { muaId } = body;
    if (!muaId) {
      return NextResponse.json({ success: false, message: "Thiếu muaId" }, { status: 400 });
    }
    // Chuyển toàn bộ dịch vụ của MUA này thành active: false
    const result = await servicesCollection.updateMany(
      { ownerId: getObjectId(muaId) },
      { $set: { active: false } }
    );
    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error in PUT /api/services/lock-mua:", error);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}
