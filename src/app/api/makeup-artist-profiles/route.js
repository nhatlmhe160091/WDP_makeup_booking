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
      name,
      avatar,
      bio,
      experienceYears,
      experienceMonths,
      workingHours,
      phone,
      email,
      address,
      bankInfo, // { bankName, bankAccount, accountHolder }
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
      name: name || "",
      avatar: avatar || "",
      bio: bio || "",
      experienceYears: experienceYears || 0,
      experienceMonths: experienceMonths || 0,
      workingHours: workingHours || "",
      phone: phone || "",
      email: email || "",
      address: address || "",
      bankInfo: bankInfo || {},
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
    const usersCollection = db.collection("users");
    const MUARequestsCollection = db.collection("MUA_requests");
    const {
      artistId,
      name,
      avatar,
      bio,
      experienceYears,
      experienceMonths,
      workingHours,
      phone,
      email,
      address,
      bankInfo, // { bankName, bankAccount, accountHolder }
      socialLinks,
      portfolio, // [{ image, desc, category }]
      certificates // [{ name, fileUrl }]
    } = await req.json();
    if (!artistId) {
      return NextResponse.json({ success: false, message: "Missing artistId" }, { status: 400 });
    }
    // Validate cơ bản
    if (name && (typeof name !== "string" || name.length < 1 || name.length > 100)) {
      return NextResponse.json({ success: false, message: "Tên không hợp lệ" }, { status: 400 });
    }
    if (bio && (typeof bio !== "string" || bio.length > 1000)) {
      return NextResponse.json({ success: false, message: "Bio quá dài" }, { status: 400 });
    }
    if (experienceYears && (isNaN(experienceYears) || experienceYears < 0)) {
      return NextResponse.json({ success: false, message: "Kinh nghiệm năm không hợp lệ" }, { status: 400 });
    }
    if (experienceMonths && (isNaN(experienceMonths) || experienceMonths < 0 || experienceMonths > 11)) {
      return NextResponse.json({ success: false, message: "Kinh nghiệm tháng không hợp lệ" }, { status: 400 });
    }
    if (phone && !/^0\d{9,10}$/.test(phone)) {
      return NextResponse.json({ success: false, message: "Số điện thoại không hợp lệ" }, { status: 400 });
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Email không hợp lệ" }, { status: 400 });
    }
    if (bankInfo) {
      if (!bankInfo.bankName || !bankInfo.accountHolder || !/^[0-9]{6,20}$/.test(bankInfo.bankAccount)) {
        return NextResponse.json({ success: false, message: "Thông tin ngân hàng không hợp lệ" }, { status: 400 });
      }
    }
    // Nếu artistId là user thường thì kiểm tra MUA_requests
    const user = await usersCollection.findOne({ _id: getObjectId(artistId) });
    //console.log("[DEBUG] PUT profile - artistId:", artistId, "user:", user);
    if (user && user.role === "user") {
      // Nếu có request bị từ chối thì update lại thành pending
      const updateResult = await MUARequestsCollection.updateMany(
        { userId: artistId, status: { $in: ["rejected", "reject"] } },
        { $set: { status: "pending", reason: "" } }
      );
     // console.log("[DEBUG] Update MUA_requests result:", updateResult);
    }
    // Chuẩn bị dữ liệu cập nhật
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (bio !== undefined) updateFields.bio = bio;
    if (experienceYears !== undefined) updateFields.experienceYears = experienceYears;
    if (experienceMonths !== undefined) updateFields.experienceMonths = experienceMonths;
    if (workingHours !== undefined) updateFields.workingHours = workingHours;
    if (phone !== undefined) updateFields.phone = phone;
    if (email !== undefined) updateFields.email = email;
    if (address !== undefined) updateFields.address = address;
    if (bankInfo !== undefined) updateFields.bankInfo = bankInfo;
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
