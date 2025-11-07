import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";
const DB_NAME = "services";
const COLLECTION_NAME = "service";

// API GET - Lấy danh sách dịch vụ tiêu biểu (featured) với các trường cơ bản
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const servicesCollection = db.collection(COLLECTION_NAME);

    // Lọc các dịch vụ tiêu biểu (có thể dựa vào trường 'featured' hoặc lấy top N dịch vụ active)
    // Ở đây lấy top 6 dịch vụ active mới nhất
    const services = await servicesCollection
      .find({ active: true })
      .project({
        serviceName: 1,
        description: 1,
        active: 1,
        _id: 1
      })
      .sort({ created_at: -1 })
      .limit(6)
      .toArray();

    // Đổi tên _id thành serviceId cho rõ ràng
    const result = services.map(s => ({
      serviceId: s._id,
      name: s.serviceName,
      description: s.description,
      images: s.images,
      packages: s.packages,
      active: s.active
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}