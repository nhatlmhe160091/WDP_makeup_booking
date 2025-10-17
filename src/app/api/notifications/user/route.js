import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";

const DB_NAME = "services";
const COLLECTION_NAME = "notifications";

// API GET - Lấy danh sách thông báo
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const notificationsCollection = db.collection(COLLECTION_NAME);

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const userId = searchParams.get("userId");
    const isRead = searchParams.get("isRead");

    const query = { type: "user" };
    if (userId) query.userId = getObjectId(userId);
    if (isRead !== null && isRead !== undefined) query.isRead = isRead === "true";

    const notifications = await notificationsCollection
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
