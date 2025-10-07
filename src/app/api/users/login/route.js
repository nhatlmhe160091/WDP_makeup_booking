import clientPromise from "@muahub/lib/mongodb";
import { decrypt, encrypt } from "@muahub/utils/Security";
import { NextResponse } from "next/server";

// API POST để Dang nhap
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts"); // Tên database của bạn
    const accountsCollection = db.collection("users");

    const { email, password } = await req.json();

    const user = await accountsCollection.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, error: "Email hoặc mật khẩu không đúng" }, { status: 404 });
    }

    if (decrypt(user.password) !== password) {
      return NextResponse.json({ success: false, error: "Email hoặc mật khẩu không đúng" }, { status: 400 });
    }

    // userToken
    let userToken = {
      id: user._id,
      time: new Date().getTime()
    };

    userToken = JSON.stringify(userToken);

    userToken = encrypt(userToken);

    return NextResponse.json({
      success: true,
      data: {
        role: user.role,
        active: user.active,
        token: userToken,
        type: "Bearer"
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
