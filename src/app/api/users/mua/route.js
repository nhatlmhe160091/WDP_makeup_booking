
import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";

// API GET để lấy danh sách make-up artists (MUA) đã đăng ký gói dịch vụ monthly_6 hoặc yearly
export async function GET(req) {
	try {
		const client = await clientPromise;
		   const db = client.db("accounts");
		const usersCollection = db.collection("users");

		// Lọc payment_type là 'monthly_6' hoặc 'yearly'
		const query = {
			payment_type: { $in: ["monthly_6", "yearly"] }
		};

		const users = await usersCollection.find(query).toArray();

		return NextResponse.json({
			success: true,
			data: users
		});
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}