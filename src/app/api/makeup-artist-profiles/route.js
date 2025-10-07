import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";

const DB_NAME = "accounts";
const COLLECTION_NAME = "makeup_artist_profiles";

// GET: Lấy profile makeup artist theo artistId
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const profilesCollection = db.collection(COLLECTION_NAME);

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const artistId = searchParams.get("artistId");
    if (!artistId) {
      return NextResponse.json({ success: false, message: "Missing artistId" }, { status: 400 });
    }
    const profile = await profilesCollection.findOne({ artistId: getObjectId(artistId) });
    if (!profile) {
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });
    }
  return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Tạo mới profile cho makeup artist
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const profilesCollection = db.collection(COLLECTION_NAME);
    const {
      artistId,
      bio,
      experienceYears,
      workingHours,
      socialLinks,
      portfolio,
      certificates
    } = await req.json();
    if (!artistId) {
      return NextResponse.json({ success: false, message: "Missing artistId" }, { status: 400 });
    }
    // Check if profile already exists
    const exists = await profilesCollection.findOne({ artistId: getObjectId(artistId) });
    if (exists) {
      return NextResponse.json({ success: false, message: "Profile already exists" }, { status: 400 });
    }
    const newProfile = {
      artistId: getObjectId(artistId),
      bio: bio || "",
      experienceYears: experienceYears || 0,
      workingHours: workingHours || "",
      socialLinks: socialLinks || {},
      portfolio: portfolio || [],
      certificates: certificates || [],
      created_at: new Date(),
      updated_at: new Date()
    };
    await profilesCollection.insertOne(newProfile);
  return NextResponse.json({ success: true, message: "Profile created", data: newProfile });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Cập nhật profile makeup artist
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const profilesCollection = db.collection(COLLECTION_NAME);
    const {
      artistId,
      bio,
      experienceYears,
      workingHours,
      socialLinks,
      portfolio,
      certificates
    } = await req.json();
    if (!artistId) {
      return NextResponse.json({ success: false, message: "Missing artistId" }, { status: 400 });
    }
    const updateFields = {};
    if (bio !== undefined) updateFields.bio = bio;
    if (experienceYears !== undefined) updateFields.experienceYears = experienceYears;
    if (workingHours !== undefined) updateFields.workingHours = workingHours;
    if (socialLinks !== undefined) updateFields.socialLinks = socialLinks;
    if (portfolio !== undefined) updateFields.portfolio = portfolio;
    if (certificates !== undefined) updateFields.certificates = certificates;
    updateFields.updated_at = new Date();
    const result = await profilesCollection.updateOne(
      { artistId: getObjectId(artistId) },
      { $set: updateFields }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });
    }
  return NextResponse.json({ success: true, message: "Profile updated" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Xóa profile makeup artist
export async function DELETE(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const profilesCollection = db.collection(COLLECTION_NAME);
    const { artistId } = await req.json();
    if (!artistId) {
      return NextResponse.json({ success: false, message: "Missing artistId" }, { status: 400 });
    }
    const result = await profilesCollection.deleteOne({ artistId: getObjectId(artistId) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });
    }
  return NextResponse.json({ success: true, message: "Profile deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
