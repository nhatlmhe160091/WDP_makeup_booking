import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";

const DB_NAME = "services";
const COLLECTION_NAME = "orders";

// API GET - Lấy danh sách các slot đã bị đặt cho 1 dịch vụ trong 1 ngày
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const ordersCollection = db.collection(COLLECTION_NAME);

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date");

    if (!serviceId || !date) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }

    // Lấy tất cả các order đã đặt cho serviceId và date này
    const orders = await ordersCollection.find({
      serviceId: getObjectId(serviceId),
      date
    }, {
      projection: { time: 1, fieldSlot: 1, _id: 0 }
    }).toArray();

    // Trả về danh sách các slot đã bị đặt
    return NextResponse.json({ success: true, slots: orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
