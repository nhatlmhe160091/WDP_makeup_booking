import getObjectId from "@quanlysanbong/lib/getObjectId";
import clientPromise from "@quanlysanbong/lib/mongodb";
import { NextResponse } from "next/server";

// API GET để lấy danh sách users
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const accountsCollection = db.collection("history_withdrawn");

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    const ownerId = searchParams.get("ownerId");

    let data = await accountsCollection
      .find({
        ...(ownerId ? { ownerId: getObjectId(ownerId) } : {})
      })
      .sort({ created_at: -1 })
      .toArray();

    const ownerIdList = data.map((item) => item.ownerId);

    const usersCollection = db.collection("users");
    const users = await usersCollection
      .find({ _id: { $in: ownerIdList } }, { projection: { name: 1, email: 1 } })
      .toArray();

    data = data.map((item) => {
      const user = users.find((u) => u._id.toString() === item.ownerId.toString());
      return {
        ...item,
        owner: user,
        status: !item.status ? "PENDING" : item.status
      };
    });

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const accountsCollection = db.collection("users");
    const historyWithdrawnCollection = db.collection("history_withdrawn");

    let { ownerId, bank_info, bank_info_number, amount } = await req.json();

    amount = parseInt(amount);

    const ownerIdObj = getObjectId(ownerId);

    const user = await accountsCollection.findOne({ _id: ownerIdObj });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Kiểm tra số dư
    const soDu = user.totalPrice - (user.withdrawn | 0);

    if (amount === "" || amount <= 0) {
      return NextResponse.json({ success: false, message: "Số tiền rút không hợp lệ" }, { status: 400 });
    }

    if (amount > soDu) {
      return NextResponse.json(
        { success: false, message: "Số tiền rút không được lớn hơn số dư hiện tại" },
        { status: 400 }
      );
    }

    // Cập nhật số tiền rút

    await accountsCollection.updateOne(
      { _id: ownerIdObj },
      {
        $set: {
          withdrawn: (user.withdrawn | 0) + amount
        }
      }
    );

    // Lưu lịch sử rút tiền
    await historyWithdrawnCollection.insertOne({
      ownerId: ownerIdObj,
      bank_info,
      bank_info_number,
      amount,
      status: "PENDING",
      created_at: new Date()
    });

    return NextResponse.json({ success: true, message: "Ruts tien thanh cong", data: "ok" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// update
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const historyWithdrawnCollection = db.collection("history_withdrawn");

    let { id, status } = await req.json();

    const idObj = getObjectId(id);

    await historyWithdrawnCollection.updateOne(
      { _id: idObj },
      {
        $set: {
          status
        }
      }
    );

    return NextResponse.json({ success: true, message: "Update status thanh cong" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
