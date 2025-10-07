import { htmlUpdateAccount } from "@muahub/constants/System";
import clientPromise from "@muahub/lib/mongodb";
import { sendEmail } from "@muahub/lib/sendEmail";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts"); // Đổi tên db nếu cần
    const collection = db.collection("sale_requests");

    const { userId, email } = await req.json();
    console.log(collection);

    await collection.insertOne({
      userId,
      email,
      requestedRole: "SALE",
      status: "pending",
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, message: "Yêu cầu nâng cấp đã được gửi!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const collection = db.collection("sale_requests");

    const email = req.nextUrl.searchParams.get("email");
    let query = {};
    if (email) query.email = email;

    const requests = await collection.find(query).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const collection = db.collection("sale_requests");
    const { email, name, phone, address } = await req.json();

    await collection.deleteMany({ email });

    await sendEmail({
      to: email,
      subject: "Duyệt yêu cầu nâng cấp tài khoản",
      html: htmlUpdateAccount({
        name: name || "Người dùng",
        email,
        phone: phone || "Không có",
        address: address || "Không có"
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
