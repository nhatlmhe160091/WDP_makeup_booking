import { NextResponse } from "next/server";
import clientPromise from "@muahub/lib/mongodb";
import { ObjectId } from "mongodb";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET - Lấy danh sách banners
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const bannersCollection = db.collection("banners");

    const url = new URL(req.url);

    const banners = await bannersCollection.find({}).sort({ order: 1, created_at: -1 }).toArray();

    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Thêm banner mới
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const bannersCollection = db.collection("banners");

    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const active = formData.get("active") === "true";
    const order = parseInt(formData.get("order")) || 1;
    const ownerId = formData.get("ownerId");
    const imageUrl = formData.get("imageUrl");

    // Lưu vào database
    const newBanner = {
      title,
      description,
      imageUrl,
      active,
      order,
      ownerId: new ObjectId(ownerId),
      created_at: new Date()
    };

    const result = await bannersCollection.insertOne(newBanner);

    return NextResponse.json({
      success: true,
      message: "Thêm banner thành công",
      data: { ...newBanner, _id: result.insertedId }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
