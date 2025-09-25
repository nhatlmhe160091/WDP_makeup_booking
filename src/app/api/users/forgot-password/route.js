import { htmlTemplateChangePassword, htmlTemplateEmail } from "@quanlysanbong/constants/System";
import { validateToken } from "@quanlysanbong/lib/auth";
import clientPromise from "@quanlysanbong/lib/mongodb";
import { sendEmail } from "@quanlysanbong/lib/sendEmail";
import { encrypt } from "@quanlysanbong/utils/Security";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const accountsCollection = db.collection("users");

    const { email } = await req.json();

    // Kiểm tra xem email có tồn tại trong database không
    const user = await accountsCollection.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: "Email không tồn tại" }, { status: 404 });
    }

    // Tạo ra mật khẩu mới tạm thời
    const tempPassword = Math.random().toString(36).slice(-8); // Tạo mật khẩu ngẫu nhiên 8 ký tự
    const hashedTempPassword = await encrypt(tempPassword);

    // Cập nhật mật khẩu tạm thời cho user
    await accountsCollection.updateOne({ email }, { $set: { password: hashedTempPassword, resetPassword: true } });
    // Gửi email với mật khẩu tạm thời (giả sử bạn có hàm gửi email)
    await sendEmail({
      to: email,
      subject: "Yêu cầu đặt lại mật khẩu",
      html: htmlTemplateChangePassword({
        name: user.name || "Người dùng",
        email,
        password: tempPassword
      })
    });

    // Trả về dữ liệu user
    return NextResponse.json({ success: true, data: { email } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
