import { NextResponse } from "next/server";
import clientPromise from "@muahub/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const id = params.id;

    // Get the makeup artist data
    const artist = await db.collection("users").findOne(
      { 
        _id: new ObjectId(id),
        role: "makeup_artist"
      },
      {
        projection: {
          password: 0, // Exclude sensitive data
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

    // Get reviews for this artist
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
        {
          $unwind: "$user"
        },
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

    // Get portfolio items
    const portfolio = await db.collection("portfolios")
      .find({ artistId: new ObjectId(id) })
      .toArray();

    // Get certificates
    const certificates = await db.collection("certificates")
      .find({ artistId: new ObjectId(id) })
      .toArray();

    // Combine all data
    const artistData = {
      ...artist,
      reviews,
      portfolio,
      certificates,
      profileComplete: Boolean(
        artist.name &&
        artist.avatar &&
        artist.bio &&
        artist.phone &&
        artist.email
      )
    };

    return NextResponse.json({ payload: artistData });
  } catch (error) {
    console.error("Error fetching makeup artist:", error);
    return NextResponse.json(
      { error: "Failed to fetch makeup artist data" },
      { status: 500 }
    );
  }
}