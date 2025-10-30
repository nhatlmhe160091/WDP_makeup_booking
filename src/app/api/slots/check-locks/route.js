import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";

const DB_NAME = "services";
const SLOT_LOCKS_COLLECTION = "slot_locks";

export async function POST(request) {
  try {
    const { serviceId, date } = await request.json();
    if (!serviceId || !date) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const slotLocksCollection = db.collection(SLOT_LOCKS_COLLECTION);

    // Lấy tất cả các slot đang bị lock (chưa hết hạn)
    const lockedSlots = await slotLocksCollection.find({
      serviceId: getObjectId(serviceId),
      date,
      expiresAt: { $gt: new Date() }
    }).toArray();

    // Trả về mảng các slot đang bị lock
    return NextResponse.json({
      success: true,
      lockedSlots: lockedSlots.map(lock => ({
        time: lock.time,
        fieldSlot: lock.fieldSlot
      }))
    });
  } catch (error) {
    console.error("Error checking slot locks:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}