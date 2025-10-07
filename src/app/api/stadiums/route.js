import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";
import { validateToken } from "@muahub/lib/auth";

const DB_NAME = "stadiums";
const COLLECTION_NAME = "stadium";

// API GET - Lấy danh sách dịch vụ makeup
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const stadiumsCollection = db.collection(COLLECTION_NAME);

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    const ownerId = searchParams.get("ownerId");

    const stadiums = await stadiumsCollection
      .find({
        ownerId: ownerId ? getObjectId(ownerId) : { $exists: true }
      })
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: stadiums });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API POST - Tạo một dịch vụ makeup mới
export async function POST(req) {
  try {
    const client = await clientPromise;

    const db = client.db(DB_NAME);
    const stadiumsCollection = db.collection(COLLECTION_NAME);

    const objectId = await validateToken(req);

    const {
      stadiumName,
      description,
      location,
      locationDetail,
      latitude,
      longitude,
      amenities,
      openingTime,
      closingTime,
      images,
      fields
    } = await req.json();

    const newStadium = {
      ownerId: objectId,
      stadiumName,
      description,
      location,
      locationDetail,
      latitude: latitude || null,
      longitude: longitude || null,
      amenities: amenities || [],
      openingTime,
      closingTime,
      images,
      fields,
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    await stadiumsCollection.insertOne(newStadium);

    return NextResponse.json({ success: true, message: "Tạo dịch vụ makeup thành công", data: newStadium });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API PUT - Cập nhật thông tin dịch vụ makeup
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const stadiumsCollection = db.collection(COLLECTION_NAME);

    const {
      id,
      stadiumName,
      description,
      location,
      locationDetail,
      latitude,
      longitude,
      amenities,
      openingTime,
      closingTime,
      images,
      fields,
      active = true
    } = await req.json();

    const ObjectId = getObjectId(id);
    const userId = await validateToken(req);

    const stadium = await stadiumsCollection.findOne({ _id: ObjectId });
    if (!stadium) {
      return NextResponse.json({ success: false, message: "Dịch vụ makeup không tồn tại" }, { status: 404 });
    }

    await stadiumsCollection.updateOne(
      { _id: ObjectId },
      {
        $set: {
          stadiumName,
          description,
          location,
          locationDetail,
          latitude: latitude || null,
          longitude: longitude || null,
          amenities: amenities || [],
          openingTime,
          closingTime,
          images,
          fields,
          active,
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
    const stadiumsCollection = db.collection(COLLECTION_NAME);

    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

    const ObjectId = getObjectId(id);
    const userId = await validateToken(req);

    const stadium = await stadiumsCollection.findOne({ _id: ObjectId });
    if (!stadium) return NextResponse.json({ success: false, error: "Dịch vụ không tồn tại" }, { status: 404 });
    if (stadium.ownerId?.toString() !== userId.toString()) {
      return NextResponse.json({ success: false, error: "Không có quyền xóa dịch vụ này" }, { status: 403 });
    }

    await stadiumsCollection.deleteOne({ _id: ObjectId });
    return NextResponse.json({ success: true, message: "Xóa dịch vụ thành công" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
