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

        const { serviceId, date, slots } = await request.json();
        if (!serviceId || !date || !slots || !Array.isArray(slots)) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const slotLocksCollection = db.collection(SLOT_LOCKS_COLLECTION);

        // Giải phóng tất cả các lock của user hiện tại cho các slot được chỉ định
        await slotLocksCollection.deleteMany({
            serviceId: getObjectId(serviceId),
            date,
            lockedBy: getObjectId(session.user.id),
            $or: slots.map(slot => ({
                time: slot.time,
                fieldSlot: slot.fieldIndex
            }))
        });

        return NextResponse.json({ success: true, message: "Slots unlocked successfully" });
    } catch (error) {
        console.error("Error unlocking slots:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}