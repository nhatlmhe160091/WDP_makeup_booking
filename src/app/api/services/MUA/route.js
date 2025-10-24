import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";
// import { validateToken } from "@muahub/lib/auth";

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
    // if (typeof active !== 'undefined') {
    //   findQuery.active = active === 'true';
    // }

    const services = await servicesCollection
      .find(findQuery)
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}