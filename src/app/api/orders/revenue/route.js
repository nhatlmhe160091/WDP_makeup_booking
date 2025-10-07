import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";

const DB_NAME = "stadiums";
const COLLECTION_NAME = "orders";

// API GET - Lấy danh sách dịch vụ makeup
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const ordersCollection = db.collection(COLLECTION_NAME);

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const ownerId = searchParams.get("ownerId");

    // Build the search query dynamically based on the provided parameters
    const searchQuery = {
      status: "confirmed"
    };
    if (ownerId) searchQuery.ownerId = getObjectId(ownerId);

    // Fetch the orders based on the search query, if any filters were provided
    let orders = await ordersCollection
      .find(searchQuery)
      .sort({ created_at: -1 }) // Sort by created_at in ascending order
      .toArray();

    let dataRevenue = {};

    orders.forEach((order) => {
      const date = order.date;
      const deposit = order.deposit;
      const remaining = order.remaining;
      if (!dataRevenue[date]) {
        dataRevenue[date] = { deposit: 0, remaining: 0, orderCount: 0 };
      }
      dataRevenue[date].deposit += deposit;
      dataRevenue[date].remaining += remaining;
      dataRevenue[date].orderCount++;
    });

    return NextResponse.json({ success: true, data: dataRevenue });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
