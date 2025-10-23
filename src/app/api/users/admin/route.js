import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";

// PATCH: Tổng hợp lại tổng tiền và còn lại cho admin dựa trên các giao dịch
export async function PATCH(req) {
	try {
		const client = await clientPromise;
		const dbAccounts = client.db("accounts");
		const dbServices = client.db("services");
		const usersCollection = dbAccounts.collection("users");
		const ordersCollection = dbServices.collection("orders");

		// Tìm admin
		const admin = await usersCollection.findOne({ role: "admin" });
		if (!admin) {
			return NextResponse.json({ success: false, message: "Không tìm thấy tài khoản admin" }, { status: 404 });
		}

		// Tổng hợp lại tổng tiền và còn lại từ tất cả các đơn hàng (orders)
		// Có thể cần điều chỉnh điều kiện filter cho phù hợp với logic thực tế
		const agg = await ordersCollection.aggregate([
			{
				$group: {
					_id: null,
					totalPrice: { $sum: "$deposit" },
					remaining: { $sum: "$remaining" }
				}
			}
		]).toArray();

		const totalPrice = agg[0]?.totalPrice || 0;
		const remaining = agg[0]?.remaining || 0;

		await usersCollection.updateOne(
			{ _id: admin._id },
			{ $set: { totalPrice, remaining } }
		);

			return NextResponse.json({
				success: true,
				message: "Đã cập nhật tổng quan tài chính cho admin",
				totalPrice,
				remaining,
				admin: {
					id: admin._id,
					email: admin.email,
					name: admin.name
				}
			});
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}



