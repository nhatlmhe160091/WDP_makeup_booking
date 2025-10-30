
import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";

const DB_NAME = "services";
const ORDERS_COLLECTION = "orders";
const SLOT_LOCKS_COLLECTION = "slot_locks";

// API POST - Kiểm tra slot đã tồn tại hoặc đang bị khóa
export async function POST(req) {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const ordersCollection = db.collection(ORDERS_COLLECTION);
        const slotLocksCollection = db.collection(SLOT_LOCKS_COLLECTION);

        const { serviceId, date, time, fieldSlot, userId } = await req.json();
        if (!serviceId || !date || !time || typeof fieldSlot === 'undefined') {
            return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
        }

        // Kiểm tra slot đã được đặt chưa
        const orderQuery = {
            serviceId: getObjectId(serviceId),
            date,
            time,
            fieldSlot,
            status: { $ne: "cancelled" } // Không tính các đơn đã hủy
        };
        const existingOrder = await ordersCollection.findOne(orderQuery);

        // Kiểm tra slot có đang bị khóa không
        const lockQuery = {
            serviceId: getObjectId(serviceId),
            date,
            time,
            fieldSlot,
            expiresAt: { $gt: new Date() } // Chỉ kiểm tra các lock chưa hết hạn
        };
        const existingLock = await slotLocksCollection.findOne(lockQuery);

        let isLocked = false;
        let isLockedByCurrentUser = false;
        let message = "Slot còn trống";
        if (existingOrder) {
            message = "Slot đã được đặt";
        } else if (existingLock) {
            if (userId && existingLock.lockedBy?.toString() === userId) {
                isLockedByCurrentUser = true;
                isLocked = false;
                message = "Slot đang được bạn chọn";
            } else {
                isLocked = true;
                message = "Slot đang được người khác chọn";
            }
        }

        return NextResponse.json({
            success: true,
            exists: !!existingOrder || (!!existingLock && !isLockedByCurrentUser),
            isLocked,
            isLockedByCurrentUser,
            isBooked: !!existingOrder,
            message
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}