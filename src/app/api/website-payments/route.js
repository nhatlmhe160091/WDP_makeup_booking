// import { validateToken } from "@muahub/lib/auth";
import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// GET - Lấy danh sách thanh toán website
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const paymentsCollection = db.collection("website_payments");


    const url = new URL(req.url);
    const ownerId = url.searchParams.get("ownerId");
    const status = url.searchParams.get("status");

    let query = {};
    if (ownerId) {
      query.ownerId = new ObjectId(ownerId);
    }
    if (status) {
      query.status = status;
    }

    const payments = await paymentsCollection
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "ownerId",
            foreignField: "_id",
            as: "owner"
          }
        },
        { $unwind: "$owner" },
        { $sort: { created_at: -1 } },
        // Loại bỏ trùng lặp theo ownerId + payment_package, chỉ lấy bản mới nhất
        {
          $group: {
            _id: { ownerId: "$ownerId", payment_package: "$payment_package" },
            doc: { $first: "$$ROOT" }
          }
        },
        { $replaceRoot: { newRoot: "$doc" } }
      ])
      .toArray();

    return NextResponse.json({ success: true, payload: payments });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Tạo thanh toán website mới
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const paymentsCollection = db.collection("website_payments");

    const { ownerId, payment_package, amount, status } = await req.json();

    // Lấy thời gian tạo
    const now = new Date();
    // Làm tròn về ngày và giờ
    const roundedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    // Kiểm tra trùng ownerId, payment_package, amount, status, created_at (ngày và giờ)
    const existed = await paymentsCollection.findOne({
      ownerId: new ObjectId(ownerId),
      payment_package,
      amount,
      status: "CONFIRM",
      created_at: roundedDate
    });
    if (existed) {
      return NextResponse.json({
        success: true,
        message: "Payment already exists, returning existing paymentId",
        paymentId: existed._id
      });
    }

    const newPayment = {
      ownerId: new ObjectId(ownerId),
      payment_package,
      amount,
      status: status || "PENDING",
      created_at: roundedDate
    };

    const result = await paymentsCollection.insertOne(newPayment);

    return NextResponse.json({
      success: true,
      message: "Payment created successfully",
      paymentId: result.insertedId
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Cập nhật trạng thái thanh toán
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const paymentsCollection = db.collection("website_payments");

    const { id, status } = await req.json();

    await paymentsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updated_at: new Date()
        }
      }
    );

    return NextResponse.json({ success: true, message: "Payment updated successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
