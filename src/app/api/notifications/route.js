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

    const query = {};
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

// API POST - Tạo thông báo mới
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const notificationsCollection = db.collection(COLLECTION_NAME);

    const { userId, type, orderId, message } = await req.json();
    const now = new Date();
    const notification = {
      userId: getObjectId(userId),
      type, // 'admin' | 'owner' | 'user' ...
      orderId: orderId ? getObjectId(orderId) : undefined,
      message,
      isRead: false,
      created_at: now,
      updated_at: now
    };
    await notificationsCollection.insertOne(notification);
    return NextResponse.json({ success: true, message: "Tạo thông báo thành công" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API PUT - Đánh dấu đã đọc
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const notificationsCollection = db.collection(COLLECTION_NAME);

    const { id } = await req.json();
    await notificationsCollection.updateOne(
      { _id: getObjectId(id) },
      { $set: { isRead: true, updated_at: new Date() } }
    );
    return NextResponse.json({ success: true, message: "Đã đánh dấu đã đọc" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
