import { htmlTemplateEmail, ROLE_MANAGER } from "@muahub/constants/System";
import getObjectId from "@muahub/lib/getObjectId";
import clientPromise from "@muahub/lib/mongodb";
import { encrypt } from "@muahub/utils/Security";
import { NextResponse } from "next/server";
import { sendEmail } from "@muahub/lib/sendEmail";
import { MAIN_URL_APP } from "@muahub/constants/MainContent";
import { v4 as uuidv4 } from "uuid";

// API GET để lấy danh sách users
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const accountsCollection = db.collection("users");

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    const role = searchParams.get("role");

    const users = await accountsCollection
      .find({
        role: role ? role : { $exists: true }
      })
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API POST để tạo một user mới
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const accountsCollection = db.collection("users");
    const tokenCollection = db.collection("tokens");

    const { email, password, address, name, role = ROLE_MANAGER.USER, phone = "", cccd } = await req.json();

    // role phải thuộc ROLE_MANAGER
    if (!Object.values(ROLE_MANAGER).includes(role)) {
      return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 });
    }


    // Kiểm tra xem email đã tồn tại chưa
    const user = await accountsCollection.findOne({ email });
    if (user) {
      return NextResponse.json({ success: false, message: "Email already exists" }, { status: 400 });
    }

    // Kiểm tra xem CCCD đã tồn tại chưa
    if (!cccd) {
      return NextResponse.json({ success: false, message: "CCCD is required" }, { status: 400 });
    }
    const cccdExists = await accountsCollection.findOne({ cccd });
    if (cccdExists) {
      return NextResponse.json({ success: false, message: "CCCD already exists" }, { status: 400 });
    }

    // Mã hóa mật khẩu trước khi lưu vào database
    const hashedPassword = await encrypt(password);

    const newUser = {
      email,
      password: hashedPassword,
      name,
      address,
      phone,
      cccd,
      role,
      totalPrice: 0,
      withdrawn: 0,
      active: false,
      payment_package: null, // Thêm field payment_package mặc định là null
      created_at: new Date()
    };

    const uuid = uuidv4();
    // Tạo token xác thực
    const token = {
      email,
      token: uuid,
      type: "email_verification",
      status: "pending",
      created_at: new Date(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 10000000)
    };
    // Lưu token vào database
    await tokenCollection.insertOne(token);

    await sendEmail({
      to: email,
      subject: "Tài khoản của bạn đã được tạo thành công",
      html: htmlTemplateEmail({
        name,
        email,
        phone,
        address,
        confirm_link: `${MAIN_URL_APP}/xac-thuc-tai-khoan?token=${uuid}`
      })
    });

    // Chèn user mới vào collection
    await accountsCollection.insertOne(newUser);

    return NextResponse.json({ success: true, message: "Tạo tài khoản thành công", data: newUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API PUT để cập nhật thông tin user
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const accountsCollection = db.collection("users");

    const {
      id,
      avatar,
      name,
      phone,
      address,
      bio,
      bank_info,
      bank_info_number,
      active = true,
      password = "",
      role,
      payment_package, // Thêm payment_package vào destructuring
      payment_type, // Thêm payment_type để cập nhật gói thanh toán
      payment_amount, // Thêm payment_amount
      payment_history, // Thêm payment_history
      payment_expiry,
      withdrawn
    } = await req.json();

    // convert id to ObjectId
    const ObjectId = getObjectId(id);

    // Kiểm tra xem user có tồn tại không
    const user = await accountsCollection.findOne({
      _id: ObjectId
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Nếu có password thì chỉ cập nhật password
    if (password) {
      const hashedPassword = await encrypt(password);
      await accountsCollection.updateOne(
        { _id: ObjectId },
        {
          $set: {
            password: hashedPassword,
            updated_at: new Date()
          }
        }
      );
      return NextResponse.json({
        success: true,
        message: "Cập nhật thông tin thành công",
        data: { message: "Password updated" }
      });
    }

    // Cập nhật thông tin user, bao gồm cả role và payment_package nếu có
    // Chỉ cập nhật các trường có dữ liệu mới (khác undefined)
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (bio !== undefined) updateFields.bio = bio;
    if (active !== undefined) updateFields.active = active;
    if (bank_info !== undefined) updateFields.bank_info = bank_info;
    if (bank_info_number !== undefined) updateFields.bank_info_number = bank_info_number;
    updateFields.updated_at = new Date();
    if (payment_expiry !== undefined) updateFields.payment_expiry = payment_expiry;
    if (withdrawn !== undefined) updateFields.withdrawn = withdrawn;

    // Thêm role nếu có
    if (role !== undefined) updateFields.role = role;

    // Thêm payment_package nếu có
    if (payment_package !== undefined) updateFields.payment_package = payment_package;

    // Xử lý payment_type và tính toán payment_amount
    if (payment_type !== undefined) {
      const paymentAmounts = {
        revenue: 0,
        monthly_3: 3000000,
        monthly_6: 5500000,
        yearly: 10000000
      };

      updateFields.payment_type = payment_type;
      updateFields.payment_amount = payment_amount !== undefined ? payment_amount : paymentAmounts[payment_type] || 0;
    }

    // Xử lý payment_history
    if (payment_history !== undefined) {
      // Lấy payment_history hiện tại từ user hoặc tạo mảng rỗng
      const currentHistory = user.payment_history || [];

      // Thêm record mới vào mảng payment_history
      updateFields.payment_history = [...currentHistory, payment_history];
    }

    await accountsCollection.updateOne({ _id: ObjectId }, { $set: updateFields });

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: {
        id,
        name,
        phone,
        address,
        bio,
        active,
        role,
        payment_package,
        withdrawn,
        payment_type: updateFields.payment_type,
        payment_amount: updateFields.payment_amount,
        payment_history: updateFields.payment_history,
        payment_expiry: updateFields.payment_expiry
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
