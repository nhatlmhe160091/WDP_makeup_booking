import { NextResponse } from "next/server";
import clientPromise from "@muahub/lib/mongodb";
const DB_NAME = "services";
const COLLECTION_NAME = "service";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const servicesCollection = db.collection(COLLECTION_NAME);
    const services = await servicesCollection
      .find({})
      .sort({ created_at: -1 })
      .limit(3)
      .toArray();

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
