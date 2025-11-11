import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";

const DB_NAME = "services";
const COLLECTION_NAME = "blogs";

// API GET - Lấy chi tiết blog theo ID hoặc slug
export async function GET(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const blogsCollection = db.collection(COLLECTION_NAME);
    const usersCollection = db.collection("users");

    const { id } = params;

    // Tìm blog theo ID hoặc slug
    let findQuery;
    try {
      // Thử tìm theo ObjectId trước
      findQuery = { _id: getObjectId(id) };
    } catch {
      // Nếu không phải ObjectId, tìm theo slug
      findQuery = { slug: id };
    }

    // Chỉ lấy blog có status published
    findQuery.status = "published";

    const blog = await blogsCollection.findOne(findQuery);

    if (!blog) {
      return NextResponse.json({ 
        success: false, 
        error: "Blog không tồn tại hoặc chưa được xuất bản" 
      }, { status: 404 });
    }

    // Lấy thông tin tác giả (MUA)
    let author = null;
    if (blog.ownerId) {
      author = await usersCollection.findOne(
        { _id: blog.ownerId },
        { projection: { fullname: 1, name: 1, email: 1, avatar: 1, role: 1 } }
      );
    }

    // Tăng lượt xem
    await blogsCollection.updateOne(
      { _id: blog._id },
      { $inc: { views: 1 } }
    );

    // Lấy các blog liên quan (cùng category, khác ID)
    const relatedBlogs = await blogsCollection
      .find({
        _id: { $ne: blog._id },
        category: blog.category,
        status: "published"
      })
      .limit(4)
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: {
        ...blog,
        author,
        relatedBlogs
      }
    });
  } catch (error) {
    console.error("Error fetching blog detail:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// API PUT - Cập nhật lượt thích blog
export async function PUT(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const blogsCollection = db.collection(COLLECTION_NAME);

    const { id } = params;
    const { action } = await req.json(); // "like" hoặc "unlike"

    let findQuery;
    try {
      findQuery = { _id: getObjectId(id) };
    } catch {
      findQuery = { slug: id };
    }

    const blog = await blogsCollection.findOne(findQuery);
    if (!blog) {
      return NextResponse.json({ 
        success: false, 
        error: "Blog không tồn tại" 
      }, { status: 404 });
    }

    let updateQuery;
    if (action === "like") {
      updateQuery = { $inc: { likes: 1 } };
    } else if (action === "unlike") {
      updateQuery = { $inc: { likes: -1 } };
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Action không hợp lệ" 
      }, { status: 400 });
    }

    await blogsCollection.updateOne({ _id: blog._id }, updateQuery);

    return NextResponse.json({
      success: true,
      message: "Cập nhật thành công"
    });
  } catch (error) {
    console.error("Error updating blog like:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}