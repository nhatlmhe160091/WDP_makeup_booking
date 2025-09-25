import clientPromise from "@quanlysanbong/lib/mongodb";
import getObjectId from "@quanlysanbong/lib/getObjectId";
import { NextResponse } from "next/server";
import { validateToken } from "@quanlysanbong/lib/auth";

const DB_NAME = "stadiums";
const COLLECTION_NAME = "stadium";

// API GET - Lấy danh sách dịch vụ makeup
export async function GET(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const stadiumsCollection = db.collection(COLLECTION_NAME);

    const dbUser = client.db("accounts");
    const accountsCollection = dbUser.collection("users");

    const { id } = params;

    let stadium = await stadiumsCollection.findOne({ _id: getObjectId(id) });

    if (!stadium) {
      return NextResponse.json({ success: false, error: "Không tìm thấy dịch vụ makeup" }, { status: 404 });
    }

    const user = await accountsCollection.findOne({ _id: stadium.ownerId });

    if (user) {
      stadium = { ...stadium, owner: user };
    }

    return NextResponse.json({ success: true, data: stadium });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API PUT - Cập nhật dịch vụ makeup
export async function PUT(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const stadiumsCollection = db.collection(COLLECTION_NAME);

    const { id } = params;
    const body = await req.json();

    const result = await stadiumsCollection.updateOne(
      { _id: getObjectId(id) },
      { $set: { ...body, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Không tìm thấy dịch vụ makeup" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Cập nhật dịch vụ makeup thành công" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API PATCH - Cập nhật thông tin từ sân sang dịch vụ makeup
export async function PATCH(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const stadiumsCollection = db.collection(COLLECTION_NAME);

    const { id } = params;

    // Danh sách các loại dịch vụ makeup
    const makeupServices = [
      "Trang điểm cô dâu",
      "Trang điểm dự tiệc",
      "Trang điểm chụp ảnh",
      "Trang điểm sự kiện",
      "Trang điểm theo xu hướng",
      "Trang điểm tự nhiên",
      "Trang điểm dạ hội",
      "Make up và làm tóc"
    ];

    // Danh sách các mô tả dịch vụ
    const descriptions = [
      "Trang điểm chuyên nghiệp với các sản phẩm cao cấp",
      "Kinh nghiệm nhiều năm trong lĩnh vực make up",
      "Sử dụng các sản phẩm mỹ phẩm nhập khẩu chính hãng",
      "Tư vấn phong cách trang điểm phù hợp với từng khách hàng",
      "Đội ngũ chuyên viên trang điểm có chứng chỉ quốc tế",
      "Cam kết mang lại vẻ đẹp tự nhiên và long lanh nhất"
    ];

    // Random các thông tin cơ bản
    const randomMakeupService = {
      name: makeupServices[Math.floor(Math.random() * makeupServices.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      price: Math.floor(Math.random() * (2000000 - 500000) + 500000), // Giá từ 500k đến 2tr
      duration: Math.floor(Math.random() * (180 - 60) + 60), // Thời gian từ 60-180 phút
      service_type: "makeup",
      stadiumName: makeupServices[Math.floor(Math.random() * makeupServices.length)],
      features: [
        "Tư vấn kiểu make up",
        "Làm sạch da",
        "Trang điểm theo yêu cầu",
        "Fix makeup trong 24h",
        "Chụp ảnh sau make up"
      ],
      updatedAt: new Date()
    };

    const result = await stadiumsCollection.updateOne(
      { _id: getObjectId(id) },
      { 
        $set: randomMakeupService,
        $unset: { 
          // Xóa các trường thông tin của sân
          field_type: "",
          field_size: "",
          sport_type: "",
          capacity: ""
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Không tìm thấy dịch vụ để cập nhật" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Cập nhật sang dịch vụ makeup thành công",
      data: randomMakeupService
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
