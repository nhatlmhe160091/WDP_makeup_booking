import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";

// GET /api/request-add-MUA/check-rejected/[userId]
export async function GET(req, { params }) {
  const { userId } = params;
  try {
    const client = await clientPromise;
    const db = client.db();
    const MUARequestsCollection = db.collection("MUA_requests");
    // Tìm các yêu cầu của userId có status là 'rejected' hoặc 'reject'
    const rejectedRequest = await MUARequestsCollection.findOne({
      userId,
      status: { $in: ["rejected", "reject"] }
    });
    return NextResponse.json({
      success: true,
      isRejected: !!rejectedRequest,
      data: rejectedRequest
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
