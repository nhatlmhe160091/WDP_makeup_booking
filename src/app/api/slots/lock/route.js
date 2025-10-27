import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const DB_NAME = "services";
const SLOT_LOCKS_COLLECTION = "slot_locks";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { serviceId, date, time, fieldSlot } = await request.json();
        if (!serviceId || !date || !time || fieldSlot === undefined) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const slotLocksCollection = db.collection(SLOT_LOCKS_COLLECTION);

        // Kiểm tra xem slot đã bị lock chưa
        const existingLock = await slotLocksCollection.findOne({
            serviceId: getObjectId(serviceId),
            date,
            time,
            fieldSlot,
            expiresAt: { $gt: new Date() } // Chỉ kiểm tra các lock chưa hết hạn
        });

        if (existingLock) {
            // Kiểm tra xem lock có phải của user hiện tại không
            if (existingLock.lockedBy.toString() === session.user.id) {
                return NextResponse.json({ success: true, message: "Slot already locked by you" });
            }
            return NextResponse.json({ success: false, message: "Slot is already locked by another user" }, { status: 409 });
        }

        // Tạo lock mới với thời hạn 10 phút
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        const newLock = {
            serviceId: getObjectId(serviceId),
            date,
            time,
            fieldSlot,
            lockedBy: getObjectId(session.user.id),
            lockedAt: new Date(),
            expiresAt
        };

        await slotLocksCollection.insertOne(newLock);

        return NextResponse.json({ success: true, message: "Slot locked successfully" });
    } catch (error) {
        console.error("Error locking slot:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}