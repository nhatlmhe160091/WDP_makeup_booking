
import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";

const DB_NAME = "services";
const COLLECTION_NAME = "orders";

// API POST - Kiểm tra slot đã tồn tại chưa
export async function POST(req) {
	try {
		const client = await clientPromise;
		const db = client.db(DB_NAME);
		const ordersCollection = db.collection(COLLECTION_NAME);

		const { serviceId, date, time, fieldSlot } = await req.json();
		if (!serviceId || !date || !time || typeof fieldSlot === 'undefined') {
			return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
		}

		// Kiểm tra slot đã tồn tại chưa
		const query = {
			serviceId: getObjectId(serviceId),
			date,
			time,
			fieldSlot
		};
		const existingOrder = await ordersCollection.findOne(query);

		if (existingOrder) {
			return NextResponse.json({ success: true, exists: true, message: "Slot đã được đặt" });
		} else {
			return NextResponse.json({ success: true, exists: false, message: "Slot còn trống" });
		}
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}