import { NextResponse } from "next/server";

// API GET để lấy danh sách users
export async function GET() {
  try {
    return NextResponse.json({ message: "Success" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
