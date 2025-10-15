import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";
import { validateToken } from "@muahub/lib/auth";

const DB_NAME = "services";
// const STADIUM_COLLECTION_NAME = "service";
const COLLECTION_NAME = "orders";

// API PATCH - Đổi trạng thái order sang cancelled hoặc completed
export async function PATCH(req) {
	try {
		const client = await clientPromise;
		const db = client.db(DB_NAME);
		const ordersCollection = db.collection(COLLECTION_NAME);

		const { id, status } = await req.json();
		if (!id || !["cancelled", "completed"].includes(status)) {
			return NextResponse.json({ success: false, message: "Trạng thái không hợp lệ" }, { status: 400 });
		}
		await validateToken(req);

		const ObjectId = getObjectId(id);
		const order = await ordersCollection.findOne({ _id: ObjectId });
		if (!order) {
			return NextResponse.json({ success: false, message: "Đơn dịch vụ không tồn tại" }, { status: 404 });
		}

		await ordersCollection.updateOne(
			{ _id: ObjectId },
			{
				$set: {
					status,
					updated_at: new Date()
				}
			}
		);

		// Notification logic
		const notificationsCollection = db.collection("notifications");
		const now = new Date();
		let notifyUsers = [];
		let message = "";
		if (status === "cancelled") {
			// Thông báo cho cả user và owner
			notifyUsers = [order.userId, order.ownerId];
			message = `Đơn dịch vụ #${order._id} đã bị huỷ.`;
		} else if (status === "completed") {
			// Thông báo cho cả user và owner
			notifyUsers = [order.userId, order.ownerId];
			message = `Đơn dịch vụ #${order._id} đã hoàn thành.`;
		}
		for (const userId of notifyUsers) {
			await notificationsCollection.insertOne({
				userId,
				type: "system",
				orderId: order._id,
				message,
				isRead: false,
				created_at: now,
				updated_at: now
			});
		}

		return NextResponse.json({ success: true, message: `Đã cập nhật trạng thái đơn sang ${status}` });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
