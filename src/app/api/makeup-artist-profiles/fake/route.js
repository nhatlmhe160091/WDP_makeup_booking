import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";
import { faker } from '@faker-js/faker';
// import getObjectId from "@muahub/lib/getObjectId";

const DB_NAME = "accounts";
const USERS_COLLECTION = "users";
const PROFILES_COLLECTION = "makeup_artist_profiles";


export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);
    const profilesCollection = db.collection(PROFILES_COLLECTION);


    const artists = await usersCollection.find({ role: "makeup_artist" }).toArray();
    if (!artists.length) {
      return NextResponse.json({ success: false, message: "No makeup_artist users found" }, { status: 404 });
    }

    let created = 0;
    for (const artist of artists) {
  
      const exists = await profilesCollection.findOne({ artistId: artist._id });
      if (exists) continue;
      // Tạo data fake
      const fakeProfile = {
        artistId: artist._id,
        bio: faker.person.bio(),
        experienceYears: faker.number.int({ min: 1, max: 10 }),
        workingHours: "08:00-18:00",
        socialLinks: {
          facebook: faker.internet.url(),
          instagram: faker.internet.url()
        },
        portfolio: Array.from({ length: 3 }, () => ({
          image: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
          desc: faker.lorem.sentence()
        })),
        certificates: Array.from({ length: 2 }, () => ({
          name: faker.lorem.words({ min: 2, max: 4 }),
          image: faker.image.urlPicsumPhotos({ width: 300, height: 200 })
        })),
        created_at: new Date(),
        updated_at: new Date()
      };
      await profilesCollection.insertOne(fakeProfile);
      created++;
    }
    return NextResponse.json({ success: true, message: `Đã tạo ${created} profile fake cho makeup_artist` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
