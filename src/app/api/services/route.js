import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";
import { validateToken } from "@muahub/lib/auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
const DB_NAME = "services";
const COLLECTION_NAME = "service";

// API GET - Lấy danh sách dịch vụ makeup
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const servicesCollection = db.collection(COLLECTION_NAME);

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    const ownerId = searchParams.get("ownerId");
    const active = searchParams.get("active");

    const findQuery = {
      ownerId: ownerId ? getObjectId(ownerId) : { $exists: true }
    };
    if (typeof active !== 'undefined') {
      findQuery.active = active === 'false' ? false : true;
    }

    const services = await servicesCollection
      .find(findQuery)
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API POST - Tạo một dịch vụ makeup mới
export async function POST(req) {
  try {
    const client = await clientPromise;

    const db = client.db(DB_NAME);
    const servicesCollection = db.collection(COLLECTION_NAME);

    let objectId = await validateToken(req);
    if (!objectId) {
      // Lấy từ session nếu chưa có
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        objectId = getObjectId(session.user.id);
      }
    }
    if (!objectId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const {
      serviceName,
      description,
      location,
      locationDetail,
      latitude,
      longitude,
      amenities,
      openingTime,
      closingTime,
      images,
      packages,
      experienceYears,
      experienceMonths
    } = await req.json();


    const newService = {
      ownerId: objectId,
      serviceName,
      description,
      location,
      locationDetail,
      latitude: latitude || null,
      longitude: longitude || null,
      amenities: amenities || [],
      openingTime,
      closingTime,
      images,
      packages,
      experienceYears: Number.isFinite(Number(experienceYears)) ? Number(experienceYears) : 0,
      experienceMonths: Number.isFinite(Number(experienceMonths)) ? Number(experienceMonths) : 0,
      active: typeof req.body?.active !== 'undefined' ? req.body.active : true,
      created_at: new Date(),
      updated_at: new Date()
    };

    await servicesCollection.insertOne(newService);

    return NextResponse.json({ success: true, message: "Tạo dịch vụ makeup thành công", data: newService });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API PUT - Cập nhật thông tin dịch vụ makeup
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const servicesCollection = db.collection(COLLECTION_NAME);

    const {
      id,
      serviceName,
      description,
      location,
      locationDetail,
      latitude,
      longitude,
      amenities,
      openingTime,
      closingTime,
      images,
      packages,
      experienceYears,
      experienceMonths,
      active = true
    } = await req.json();

    const ObjectId = getObjectId(id);
    // const userId = await validateToken(req);

    const service = await servicesCollection.findOne({ _id: ObjectId });
    if (!service) {
      return NextResponse.json({ success: false, message: "Gói dịch vụ không tồn tại" }, { status: 404 });
    }

    await servicesCollection.updateOne(
      { _id: ObjectId },
      {
        $set: {
          serviceName,
          description,
          location,
          locationDetail,
          latitude: latitude || null,
          longitude: longitude || null,
          amenities: amenities || [],
          openingTime,
          closingTime,
          images,
          packages,
          experienceYears: Number.isFinite(Number(experienceYears)) ? Number(experienceYears) : 0,
          experienceMonths: Number.isFinite(Number(experienceMonths)) ? Number(experienceMonths) : 0,
          active: typeof active !== 'undefined' ? active : true,
          updated_at: new Date()
        }
      }
    );

    return NextResponse.json({ success: true, message: "Cập nhật dịch vụ makeup thành công" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API DELETE - Xóa dịch vụ makeup
export async function DELETE(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const servicesCollection = db.collection(COLLECTION_NAME);

    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

    const ObjectId = getObjectId(id);
    const userId = await validateToken(req);

    const service = await servicesCollection.findOne({ _id: ObjectId });
    if (!service) return NextResponse.json({ success: false, error: "Dịch vụ không tồn tại" }, { status: 404 });
    if (service.ownerId?.toString() !== userId.toString()) {
      return NextResponse.json({ success: false, error: "Không có quyền xóa dịch vụ này" }, { status: 403 });
    }

    await servicesCollection.deleteOne({ _id: ObjectId });
    return NextResponse.json({ success: true, message: "Xóa dịch vụ thành công" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
