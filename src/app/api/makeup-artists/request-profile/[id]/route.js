
import { NextResponse } from "next/server";
import clientPromise from "@muahub/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const id = params.id;

    // Lấy thông tin user cơ bản
    const artist = await db.collection("users").findOne(
      {
        _id: new ObjectId(id)
      },
      {
        projection: {
          password: 0,
          resetPasswordToken: 0,
          resetPasswordExpires: 0
        }
      }
    );
    if (!artist) {
      return NextResponse.json(
        { error: "Makeup artist not found" },
        { status: 404 }
      );
    }

    // Lấy profile chuyên biệt từ makeup_artist_profiles
    const profile = await db.collection("makeup_artist_profiles").findOne({ artistId: new ObjectId(id) });

    // Lấy reviews cho artist
    const reviews = await db.collection("feedbacks")
      .aggregate([
        {
          $match: { artistId: new ObjectId(id) }
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $project: {
            rating: 1,
            comment: "$reason",
            date: "$created_at",
            userName: "$user.name",
            userAvatar: "$user.avatar"
          }
        }
      ])
      .toArray();

    // Lấy portfolio và certificates từ profile (nếu có), fallback sang collection cũ nếu chưa chuyển đổi dữ liệu
    let portfolio = [];
    let certificates = [];
    if (profile) {
      portfolio = profile.portfolio || [];
      certificates = profile.certificates || [];
    } else {
      portfolio = await db.collection("portfolios").find({ artistId: new ObjectId(id) }).toArray();
      certificates = await db.collection("certificates").find({ artistId: new ObjectId(id) }).toArray();
    }

    // console.log("artist.name", artist.name);
    // console.log("artist.avatar", artist.avatar);
    // console.log("profile?.bio", profile?.bio);
    // console.log("artist.bio", artist.bio);
    // console.log("artist.phone", artist.phone);
    // console.log("artist.email", artist.email);

    const artistData = {
      ...profile,
      ...artist,
      reviews,
      portfolio,
      certificates,
      profileComplete: Boolean(
        artist.name &&
        artist.avatar &&
        (profile?.bio || artist.bio) &&
        artist.phone &&
        artist.email
      )
    };

  return NextResponse.json({ data: artistData });
  } catch (error) {
    console.error("Error fetching makeup artist:", error);
    return NextResponse.json(
      { error: "Failed to fetch makeup artist data" },
      { status: 500 }
    );
  }
}