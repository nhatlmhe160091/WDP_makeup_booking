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
    const searchQuery = {
      status: "confirmed",
      fieldSlot: { $exists: true }
    };
    if (userId) searchQuery.userId = getObjectId(userId);
    if (serviceId) searchQuery.serviceId = getObjectId(serviceId);
    if (ownerId) searchQuery.ownerId = getObjectId(ownerId);
    let projection = { serviceName: 1, location: 1, locationDetail: 1, openingTime: 1, closingTime: 1 };
    if (date) {
      searchQuery.date = date;
      projection = { ...projection, fields: 1 };
    }
    // fields

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

    // Map the orders to include the service details
    orders = orders.map((order) => {
      const service = services.find((service) => service._id.equals(order.serviceId));
      return { ...order, service };
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

    let { serviceId, ownerId, field, time, date, deposit, fieldSlot } = await req.json();

    deposit = parseInt(deposit);

    const total = deposit;

    deposit = (deposit * 30) / 100;

    // làm tròn số tiền cọc
    deposit = Math.ceil(deposit / 1000) * 1000;

    let newOrder = {
      userId: objectId,
      serviceId: getObjectId(serviceId),
      ownerId: getObjectId(ownerId),
      field,
      time,
      deposit,
      remaining: total - deposit,
      status: "confirmed",
      fieldSlot,
      date,
      created_at: new Date()
    };

    const dataOrder = await ordersCollection.insertOne(newOrder);

    const ownerData = await accountsCollection.findOne({
      _id: getObjectId(ownerId)
    });

    await accountsCollection.updateOne(
      { _id: getObjectId(ownerId) },
      {
        $set: {
          totalPrice: (ownerData.totalPrice || 0) + deposit
        }
      }
    );

    newOrder = { ...newOrder, _id: dataOrder.insertedId };

    return NextResponse.json({ success: true, message: "Tạo dịch vụ makeup thành công", data: newOrder });
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

    const service = await ordersCollection.findOne({ _id: ObjectId });
    if (!service) {
      return NextResponse.json({ success: false, message: "Dịch vụ makeup không tồn tại" }, { status: 404 });
    }

    const ownerId = service.ownerId;

    const ownerData = await accountsCollection.findOne({
      _id: ownerId
    });

    await accountsCollection.updateOne(
      { _id: ownerId },
      {
        $set: {
          totalPrice: (ownerData.totalPrice || 0) + service.deposit
        }
      }
    );

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
