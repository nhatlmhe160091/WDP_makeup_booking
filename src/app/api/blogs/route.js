import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";
import { validateToken } from "@muahub/lib/auth";

const DB_NAME = "services";
const COLLECTION_NAME = "blogs";

// API GET - Lấy danh sách blog
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const blogsCollection = db.collection(COLLECTION_NAME);

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    const ownerId = searchParams.get("ownerId");
    const status = searchParams.get("status"); // draft, published
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const findQuery = {};
    
    if (ownerId) {
      findQuery.ownerId = getObjectId(ownerId);
    }
    if (status) {
      findQuery.status = status;
    }
    if (category) {
      findQuery.category = category;
    }

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      blogsCollection
        .find(findQuery)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      blogsCollection.countDocuments(findQuery)
    ]);

    return NextResponse.json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API POST - Tạo một blog mới
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const blogsCollection = db.collection(COLLECTION_NAME);

    const objectId = await validateToken(req);

    const {
      title,
      content,
      summary,
      category,
      tags,
      coverImage,
      status = 'draft', // draft hoặc published
      metaDescription,
      slug
    } = await req.json();

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ 
        success: false, 
        error: "Tiêu đề và nội dung là bắt buộc" 
      }, { status: 400 });
    }

    const newBlog = {
      ownerId: objectId,
      title,
      content,
      summary,
      category,
      tags: tags || [],
      coverImage,
      status,
      metaDescription,
      slug: slug || title.toLowerCase().replace(/ /g, '-'),
      views: 0,
      likes: 0,
      comments: [],
      created_at: new Date(),
      updated_at: new Date()
    };

    await blogsCollection.insertOne(newBlog);

    return NextResponse.json({
      success: true,
      message: "Tạo blog thành công",
      data: newBlog
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API PUT - Cập nhật thông tin blog
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const blogsCollection = db.collection(COLLECTION_NAME);

    const {
      id,
      title,
      content,
      summary,
      category,
      tags,
      coverImage,
      status,
      metaDescription,
      slug
    } = await req.json();

    const ObjectId = getObjectId(id);
    const userId = await validateToken(req);

    const blog = await blogsCollection.findOne({ _id: ObjectId });
    if (!blog) {
      return NextResponse.json({ 
        success: false, 
        message: "Blog không tồn tại" 
      }, { status: 404 });
    }

    // Kiểm tra quyền sở hữu
    if (blog.ownerId.toString() !== userId.toString()) {
      return NextResponse.json({ 
        success: false, 
        message: "Không có quyền chỉnh sửa blog này" 
      }, { status: 403 });
    }

    const updateData = {
      title,
      content,
      summary,
      category,
      tags: tags || blog.tags,
      coverImage,
      status,
      metaDescription,
      slug: slug || blog.slug,
      updated_at: new Date()
    };

    await blogsCollection.updateOne(
      { _id: ObjectId },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: "Cập nhật blog thành công"
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// API DELETE - Xóa blog
export async function DELETE(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const blogsCollection = db.collection(COLLECTION_NAME);

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing id" 
      }, { status: 400 });
    }

    const ObjectId = getObjectId(id);
    const userId = await validateToken(req);

    const blog = await blogsCollection.findOne({ _id: ObjectId });
    if (!blog) {
      return NextResponse.json({ 
        success: false, 
        error: "Blog không tồn tại" 
      }, { status: 404 });
    }

    // Kiểm tra quyền sở hữu
    if (blog.ownerId.toString() !== userId.toString()) {
      return NextResponse.json({ 
        success: false, 
        error: "Không có quyền xóa blog này" 
      }, { status: 403 });
    }

    await blogsCollection.deleteOne({ _id: ObjectId });
    return NextResponse.json({
      success: true,
      message: "Xóa blog thành công"
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}