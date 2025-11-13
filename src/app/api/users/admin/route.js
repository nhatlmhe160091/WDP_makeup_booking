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
		const refundsCollection = dbAccounts.collection("refunds");

		// Tìm admin
		const admin = await usersCollection.findOne({ role: "admin" });
		if (!admin) {
			return NextResponse.json({ success: false, message: "Không tìm thấy tài khoản admin" }, { status: 404 });
		}

		// 1. Tổng hợp tổng tiền CỌC admin đã nhận từ tất cả các đơn hàng
		// totalPrice = tổng deposit từ các orders đã được admin xác nhận cọc
		const aggOrders = await ordersCollection.aggregate([
			{
				$match: {
					status: { $in: ["deposit_confirmed", "confirmed"] } // Chỉ tính các đơn đã xác nhận cọc
				}
			},
			{
				$group: {
					_id: null,
					totalPrice: { $sum: "$deposit" },
					remaining: { $sum: "$remaining" }
				}
			}
		]).toArray();

		const totalPrice = aggOrders[0]?.totalPrice || 0;
		const remaining = aggOrders[0]?.remaining || 0;

		// 2. Tổng hợp tổng tiền admin đã RÚT RA (chuyển cho MUA)
		// withdrawn = tổng số tiền thực tế admin đã chuyển cho MUA (sau chiết khấu)
		// Lấy từ collection refunds với status = "completed"
		const aggWithdrawn = await refundsCollection.aggregate([
			{
				$match: {
					status: "completed" // Chỉ tính các yêu cầu đã hoàn thành
				}
			},
			{
				$project: {
					// Tính số tiền thực tế sau chiết khấu
					realAmount: {
						$cond: {
							if: { $gt: ["$discount", 0] },
							then: { 
								$subtract: [
									"$totalAmount", 
									{ $multiply: ["$totalAmount", { $divide: ["$discount", 100] }] }
								]
							},
							else: "$totalAmount"
						}
					}
				}
			},
			{
				$group: {
					_id: null,
					totalWithdrawn: { $sum: "$realAmount" }
				}
			}
		]).toArray();

		const withdrawn = aggWithdrawn[0]?.totalWithdrawn || 0;

		// 3. Cập nhật lại thông tin tài chính cho admin
		await usersCollection.updateOne(
			{ _id: admin._id },
			{ 
				$set: { 
					totalPrice,    // Tổng tiền cọc đã nhận
					remaining,     // Tổng tiền khách còn nợ
					withdrawn      // Tổng tiền đã rút ra (chuyển cho MUA)
				} 
			}
		);

		return NextResponse.json({
			success: true,
			message: "Đã cập nhật tổng quan tài chính cho admin",
			totalPrice,
			remaining,
			withdrawn,
			available: totalPrice - withdrawn, // Số tiền còn có thể rút
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



