import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";

// GET /api/request-add-MUA/check-pending/[userId]
export async function GET(req, { params }) {
  const { userId } = params;
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const MUARequestsCollection = db.collection("MUA_requests");
    // Tìm các yêu cầu của userId có status là 'pending'
    const pendingRequest = await MUARequestsCollection.findOne({
      userId,
      status: "pending"
    });
    return NextResponse.json({
      success: true,
      isPending: !!pendingRequest,
      data: pendingRequest
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
