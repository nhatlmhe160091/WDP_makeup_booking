import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";
import { validateToken } from "@muahub/lib/auth";

const DB_NAME = "services";
const STADIUM_COLLECTION_NAME = "service";
const COLLECTION_NAME = "orders";

// API GET - Lấy danh sách dịch vụ makeup
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const ordersCollection = db.collection(COLLECTION_NAME);
    const serviceCollection = db.collection(STADIUM_COLLECTION_NAME);

    const dbUser = client.db("accounts");
    const accountsCollection = dbUser.collection("users");

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    const userId = searchParams.get("userId");
    const serviceId = searchParams.get("serviceId");
    const ownerId = searchParams.get("ownerId");
    const date = searchParams.get("date");

    // Build the search query dynamically based on the provided parameters
    // Mặc định chỉ lấy các order đã xác nhận hoàn toàn (confirmed)
    const searchQuery = {
      // status: "confirmed",
      fieldSlot: { $exists: true }
    };
    if (userId) searchQuery.userId = getObjectId(userId);
    if (serviceId) searchQuery.serviceId = getObjectId(serviceId);
    if (ownerId) searchQuery.ownerId = getObjectId(ownerId);
    // Luôn lấy cả packages để có thể tra cứu tên gói dịch vụ
    let projection = { serviceName: 1, location: 1, locationDetail: 1, openingTime: 1, closingTime: 1, packages: 1 };
    if (date) {
      searchQuery.date = date;
    }
    // packages

    // Fetch the orders based on the search query, if any filters were provided
    let orders = await ordersCollection
      .find(searchQuery)
      .sort({ created_at: -1 }) // Sort by created_at in ascending order
      .toArray();

    // get all serviceId from orders
    const serviceIds = orders.map((order) => order.serviceId);
    const userIds = orders.map((order) => order.userId);

    // Fetch all the services
    const services = await serviceCollection.find({ _id: { $in: serviceIds } }, { projection: projection }).toArray();

    // Fetch all the users
    const users = await accountsCollection
      .find({ _id: { $in: userIds } }, { projection: { name: 1, email: 1, phone: 1 } })
      .toArray();

    // Map the orders to include the service details và packageName
    orders = orders.map((order) => {
      const service = services.find((service) => service._id.equals(order.serviceId));
      let packageName = null;
      if (service && service.packages && order.field && service.packages[order.field]) {
        packageName = service.packages[order.field].name || null;
      }
      return { ...order, service, packageName };
    });

    // Map the orders to include the user details
    orders = orders.map((order) => {
      const user = users.find((user) => user._id.equals(order.userId));
      return { ...order, user };
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API POST
export async function POST(req) {
  try {
    const client = await clientPromise;

    const db = client.db(DB_NAME);
    const ordersCollection = db.collection(COLLECTION_NAME);
    const dbUser = client.db("accounts");
    const accountsCollection = dbUser.collection("users");

    const objectId = await validateToken(req);

    let { serviceId, ownerId, field, time, date, deposit, fieldSlot, serviceLocationType, serviceLocation } = await req.json();

    // Lấy dữ liệu vị trí từ object serviceLocation
    const {
      extraFee = 0,
      distanceKm = 0,
      customerLat = null,
      customerLng = null,
      studioLat = null,
      studioLng = null
    } = serviceLocation || {};

    deposit = parseInt(deposit);

  // Chuyển đổi kiểu dữ liệu nếu cần
  const parsedExtraFee = extraFee ? parseInt(extraFee) : 0;
  const parsedDistanceKm = distanceKm ? parseFloat(distanceKm) : 0;

    const total = deposit;

    deposit = (deposit * 30) / 100;

    // làm tròn số tiền cọc
    deposit = Math.ceil(deposit / 1000) * 1000;

    // Check if booking is for today
    const today = new Date();
    const bookingDate = new Date(date);
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);
    
    const isToday = bookingDate.getTime() === today.getTime();
    
    let newOrder = {
      userId: objectId,
      serviceId: getObjectId(serviceId),
      ownerId: getObjectId(ownerId),
      field,
      time,
      deposit,
      remaining: total - deposit,
      status: isToday ? "deposit_confirmed" : "pending", // Tự động xác nhận cọc nếu đặt trong ngày
      fieldSlot,
      date,
      serviceLocationType: serviceLocationType || null,
      serviceLocation: {
        extraFee: parsedExtraFee,
        distanceKm: parsedDistanceKm,
        customerLat,
        customerLng,
        studioLat,
        studioLng
      },
      created_at: new Date(),
      updated_at: new Date()
    };

    const dataOrder = await ordersCollection.insertOne(newOrder);

    newOrder = { ...newOrder, _id: dataOrder.insertedId };

    // Notification logic
    const notificationsCollection = db.collection("notifications");
    const now = new Date();

    // Lấy thông tin user để lấy email hoặc phone
    const userInfo = await accountsCollection.findOne({ _id: objectId }, { projection: { email: 1, phone: 1 } });
    const userIdentifier = userInfo?.email || userInfo?.phone || objectId;

    // Only notify admin for future bookings that need deposit confirmation
    if (!isToday) {
      await notificationsCollection.insertOne({
        userId: null, // or 'admin', adjust as needed
        type: "admin",
        orderId: newOrder._id,
        message: `Có đơn đặt dịch vụ mới từ user ${userIdentifier}`,
        isRead: false,
        created_at: now,
        updated_at: now
      });
    }

    // Notify owner
    await notificationsCollection.insertOne({
      userId: getObjectId(ownerId),
      type: "owner",
      orderId: newOrder._id,
      message: `Bạn có đơn đặt dịch vụ mới từ user ${userIdentifier}${isToday ? ' (đã xác nhận cọc tự động)' : ''}`,
      isRead: false,
      created_at: now,
      updated_at: now
    });
    
    // If same-day booking, notify user that deposit is automatically confirmed
    if (isToday) {
      await notificationsCollection.insertOne({
        userId: objectId,
        type: "user",
        orderId: newOrder._id,
        message: "Đặt lịch trong ngày đã được tự động xác nhận cọc",
        isRead: false,
        created_at: now,
        updated_at: now
      });
    }

    return NextResponse.json({ success: true, message: "Tạo dịch vụ makeup thành công, chờ xác nhận cọc", data: newOrder });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API PUT - Cập nhật thông tin dịch vụ makeup
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const ordersCollection = db.collection(COLLECTION_NAME);
    const dbUser = client.db("accounts");
    const accountsCollection = dbUser.collection("users");

    const { id, status } = await req.json();

    const ObjectId = getObjectId(id);
    await validateToken(req);

    const order = await ordersCollection.findOne({ _id: ObjectId });
    if (!order) {
      return NextResponse.json({ success: false, message: "Gói dịch vụ không tồn tại" }, { status: 404 });
    }

    // Quy trình xác nhận:
    // pending -> deposit_confirmed (admin xác nhận cọc) -> confirmed (MUA xác nhận dịch vụ)
    let updateOwnerTotal = false;
    let notificationForUser = null;
    let notificationForOwner = null;
    // Nếu admin xác nhận cọc
    if (order.status === "pending" && status === "deposit_confirmed") {
      notificationForUser = {
        userId: order.userId,
        type: "user",
        orderId: order._id,
        message: "Admin đã xác nhận cọc, vui lòng kiểm tra lịch sử đặt lịch.",
        isRead: false,
        created_at: new Date(),
        updated_at: new Date()
      };
      notificationForOwner = {
        userId: order.ownerId,
        type: "owner",
        orderId: order._id,
        message: "Admin đã xác nhận cọc cho đơn đặt dịch vụ của bạn.",
        isRead: false,
        created_at: new Date(),
        updated_at: new Date()
      };
    }
    // Nếu MUA xác nhận dịch vụ
    if (order.status === "deposit_confirmed" && status === "confirmed") {
      updateOwnerTotal = true;
    }

    if (updateOwnerTotal) {
      const ownerId = order.ownerId;
      const ownerData = await accountsCollection.findOne({ _id: ownerId });
      await accountsCollection.updateOne(
        { _id: ownerId },
        {
          $set: {
            totalPrice: (ownerData.totalPrice || 0) + order.deposit
          }
        }
      );
    }

    if (notificationForUser || notificationForOwner) {
      const notificationsCollection = db.collection("notifications");
      if (notificationForUser) await notificationsCollection.insertOne(notificationForUser);
      if (notificationForOwner) await notificationsCollection.insertOne(notificationForOwner);
    }

    await ordersCollection.updateOne(
      { _id: ObjectId },
      {
        $set: {
          status,
          updated_at: new Date()
        }
      }
    );

    return NextResponse.json({ success: true, message: "Cập nhật dịch vụ makeup thành công" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
