// import { NextResponse } from "next/server";
// import clientPromise from "@muahub/lib/mongodb";
// import { ObjectId } from "mongodb";

//   try {
//     const { ids } = await req.json();
//     if (!Array.isArray(ids) || ids.length === 0) {
//       return NextResponse.json({ fields: [] });
//     }
//     const client = await clientPromise;
//     const db = client.db("accounts");
//     // Chuyển ids sang ObjectId nếu cần
//     const objectIds = ids.map((id) => {
//       try {
//         return new ObjectId(id);
//       } catch {
//         return null;
//       }
//     }).filter(Boolean);
//     // Lấy danh sách artist theo id và role
//     const fields = await db.collection("users").find({
//       _id: { $in: objectIds },
//       role: "makeup_artist"
//     }).toArray();
//     return NextResponse.json({ fields });
//   } catch (error) {
//     return NextResponse.json({ fields: [], error: error.message }, { status: 500 });
//   }
