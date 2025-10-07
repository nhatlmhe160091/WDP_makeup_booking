import { NextResponse } from "next/server";
import clientPromise from "@muahub/lib/mongodb";
import { ObjectId } from "mongodb";
import { writeFile, unlink } from "fs/promises";
import path from "path";

// PUT - Cập nhật banner
export async function PUT(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const bannersCollection = db.collection("banners");

    const { id } = params;
    const formData = await req.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const active = formData.get("active") === "true";
    const order = parseInt(formData.get("order")) || 1;
    const imageUrl = formData.get("imageUrl");

    const updateData = {
      title,
      description,
      active,
      order,
      imageUrl: imageUrl,
      updated_at: new Date()
    };

    await bannersCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    return NextResponse.json({ success: true, message: "Cập nhật banner thành công" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Xóa banner
export async function DELETE(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const bannersCollection = db.collection("banners");

    const { id } = params;

    // Lấy thông tin banner để xóa file
    const banner = await bannersCollection.findOne({ _id: new ObjectId(id) });

    if (banner?.imageUrl) {
      const filePath = path.join(process.cwd(), "public", banner.imageUrl);
      try {
        await unlink(filePath);
      } catch (error) {
        console.log("Không thể xóa file:", error);
      }
    }

    await bannersCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, message: "Xóa banner thành công" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
