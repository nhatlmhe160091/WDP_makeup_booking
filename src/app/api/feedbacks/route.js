import { ROLE_MANAGER } from "@quanlysanbong/constants/System";
import getObjectId from "@quanlysanbong/lib/getObjectId";
import clientPromise from "@quanlysanbong/lib/mongodb";
import { encrypt } from "@quanlysanbong/utils/Security";
import { NextResponse } from "next/server";

// API GET để lấy danh sách feedbacks
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const dbStadium = client.db("stadiums");

    const feedbacksCollection = db.collection("feedbacks");
    const accountsCollection = db.collection("users");
    const ordersCollection = dbStadium.collection("orders");
    const stadiumsCollection = dbStadium.collection("stadium");

    // Lấy query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let query = {};
    if (userId) {
      query.userId = getObjectId(userId);
    }

    const feedbacks = await feedbacksCollection.find(query).sort({ created_at: -1 }).toArray();

    // Nếu chỉ query theo userId, trả về danh sách đơn giản
    if (userId) {
      return NextResponse.json({
        success: true,
        payload: feedbacks
      });
    }

    const userIds = feedbacks.map((feedback) => feedback.userId);
    const orderIds = feedbacks.map((feedback) => feedback.orderId);
    const stadiumIds = feedbacks.map((feedback) => feedback.stadiumId);

    const users = await accountsCollection.find({ _id: { $in: userIds } }).toArray();
    const orders = await ordersCollection.find({ _id: { $in: orderIds } }).toArray();
    const stadiums = await stadiumsCollection.find({ _id: { $in: stadiumIds } }).toArray();

    const newFeedbacks = feedbacks.map((feedback) => {
      const user = users.find((user) => user._id.toString() === feedback.userId.toString());
      const order = orders.find((order) => order._id.toString() === feedback.orderId.toString());
      const stadium = stadiums.find((stadium) => stadium._id.toString() === feedback.stadiumId.toString());

      return {
        ...feedback,
        user: user ? { name: user.name, email: user.email, phone: user.phone } : {},
        order: order
          ? {
              date: order.date,
              time: order.time,
              field: order.field,
              deposit: order.deposit,
              remaining: order.remaining,
              status: order.status
            }
          : {},
        stadium: stadium
          ? { stadiumName: stadium.stadiumName, location: stadium.location, locationDetail: stadium.locationDetail }
          : {}
      };
    });

    return NextResponse.json({
      success: true,
      data: newFeedbacks
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API POST để tạo một feedback mới
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const feedbacksCollection = db.collection("feedbacks");

    const { userId, title, reason, orderId, stadiumId, rating } = await req.json();

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Kiểm tra xem user đã feedback cho order này chưa
    const existingFeedback = await feedbacksCollection.findOne({
      userId: getObjectId(userId),
      orderId: getObjectId(orderId)
    });

    if (existingFeedback) {
      return NextResponse.json(
        {
          success: false,
          error: "Bạn đã gửi phản ánh cho lần đặt dịch vụ makeup này rồi!"
        },
        { status: 400 }
      );
    }

    const newFeedback = {
      userId: getObjectId(userId),
      orderId: getObjectId(orderId),
      stadiumId: getObjectId(stadiumId),
      title,
      reason,
      rating: rating || 0,
      checked: false,
      created_at: new Date()
    };

    const result = await feedbacksCollection.insertOne(newFeedback);

    return NextResponse.json({
      success: true,
      message: "Feedback created",
      payload: { ...newFeedback, _id: result.insertedId }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API PUT để cập nhật thông tin của một feedback
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db("accounts");
    const feedbacksCollection = db.collection("feedbacks");

    const { id, checked } = await req.json();

    await feedbacksCollection.updateOne({ _id: getObjectId(id) }, { $set: { checked } });

    return NextResponse.json({ success: true, message: "Feedback updated", data: "ok" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
