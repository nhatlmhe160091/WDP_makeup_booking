import { NextResponse } from "next/server";
import clientPromise from "@muahub/lib/mongodb";
import { validateToken } from "@muahub/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("accounts");

    // Kiểm tra xem id có trong makeup_artist_profiles không
    const profile = await db.collection("makeup_artist_profiles").findOne(
      { artistId: new ObjectId(id) }
    );

    return NextResponse.json({
      success: true,
      exists: !!profile, // Chuyển đổi kết quả thành boolean
      profile: profile // Trả về thông tin profile nếu có
    });

  } catch (error) {
    console.error("Error checking makeup artist profile:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
