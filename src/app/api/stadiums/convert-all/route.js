import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";

const DB_NAME = "stadiums";
const COLLECTION_NAME = "stadium";

// API POST - Cập nhật tất cả sân thành dịch vụ makeup
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const stadiumsCollection = db.collection(COLLECTION_NAME);

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

    // Lấy tất cả các bản ghi
    const allStadiums = await stadiumsCollection.find({}).toArray();
    const updateResults = [];

    // Cập nhật từng bản ghi
    for (const stadium of allStadiums) {
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
        updatedAt: new Date(),
        ownerId: stadium.ownerId, // Giữ nguyên ID của chủ sân
        address: stadium.address, // Giữ nguyên địa chỉ
        images: stadium.images, // Giữ nguyên ảnh
        active: stadium.active, // Giữ nguyên trạng thái
        createdAt: stadium.createdAt // Giữ nguyên ngày tạo
      };

      const result = await stadiumsCollection.updateOne(
        { _id: stadium._id },
        {
          $set: randomMakeupService,
          $unset: {
            field_type: "",
            field_size: "",
            sport_type: "",
            capacity: ""
          }
        }
      );

      updateResults.push({
        id: stadium._id,
        success: result.modifiedCount > 0,
        newService: randomMakeupService
      });
    }

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật ${updateResults.length} dịch vụ makeup thành công`,
      updates: updateResults
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}