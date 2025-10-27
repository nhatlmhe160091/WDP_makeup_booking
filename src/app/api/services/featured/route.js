import clientPromise from "@muahub/lib/mongodb";
import getObjectId from "@muahub/lib/getObjectId";
import { NextResponse } from "next/server";

const SERVICE_DB = "services";
const SERVICE_COLLECTION = "service";
const DB_NAME = "accounts";
const COLLECTION_NAME = "makeup_artist_profiles";

// API GET - Lấy danh sách thông tin makeup artists
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const servicesDb = client.db(SERVICE_DB);
    const accountsCollection = db.collection("users");
    const profilesCollection = db.collection(COLLECTION_NAME);
    const servicesCollection = servicesDb.collection(SERVICE_COLLECTION);

    // Lấy danh sách makeup artists đang hoạt động
    const artists = await accountsCollection
      .find({
        role: "makeup_artist",
        active: true,
        payment_type: { $in: ['yearly', 'monthly_6', 'monthly_3'] }
      })
      .toArray();

    // console.log("Artists before filter:", artists);
    
    // Lọc và sắp xếp artists theo độ ưu tiên của gói
    const filteredArtists = artists
      .filter(artist => {
        const expiryDate = new Date(artist.payment_expiry);
        return expiryDate > new Date(); // Chỉ lấy những gói còn hạn
      })
      .sort((a, b) => {
        // Tạo hệ số ưu tiên cho các loại gói
        const getPriorityScore = (type) => {
          switch(type) {
            case 'yearly': return 3;
            case 'monthly_6': return 2;
            case 'monthly_3': return 1;
            default: return 0;
          }
        };
        // So sánh ưu tiên
        return getPriorityScore(b.payment_type) - getPriorityScore(a.payment_type);
      });

    // console.log("Premium Artists after filter:", filteredArtists);
    // console.log("Current Date:", new Date());
    // console.log("Artists Details:", premiumArtists.map(artist => ({
    //   id: artist._id,
    //   name: artist.name,
    //   payment_type: artist.payment_type,
    //   payment_expiry: artist.payment_expiry,
    //   active: artist.active
    // })));
    
    // Lấy tất cả dịch vụ của các artist premium đã được lọc và sắp xếp
    const allPremiumServices = await servicesCollection
      .find({
        ownerId: { $in: filteredArtists.map(artist => artist._id) },
        active: true
      })
      .toArray();

    // Sắp xếp dịch vụ theo ưu tiên gói và thời gian tạo
    const sortedServices = allPremiumServices.sort((a, b) => {
      const artistA = filteredArtists.find(artist => artist._id.toString() === a.ownerId.toString());
      const artistB = filteredArtists.find(artist => artist._id.toString() === b.ownerId.toString());
      
      // Tạo hệ số ưu tiên cho các loại gói
      const getPriorityScore = (type) => {
        switch(type) {
          case 'yearly': return 3;
          case 'monthly_6': return 2;
          case 'monthly_3': return 1;
          default: return 0;
        }
      };

      const priorityA = getPriorityScore(artistA?.payment_type);
      const priorityB = getPriorityScore(artistB?.payment_type);

      if (priorityA !== priorityB) return priorityB - priorityA;
      
      // Nếu cùng cấp độ, sắp xếp theo thời gian tạo mới nhất
      return new Date(b.created_at) - new Date(a.created_at);
    });

    // Lấy thông tin profile của các makeup artists
    const artistProfiles = await profilesCollection
      .find({
        artistId: { 
          $in: filteredArtists.map(artist => getObjectId(artist._id.toString()))
        }
      })
      .toArray();

    // console.log("Query for profiles:", {
    //   artistIds: filteredArtists.map(artist => artist._id.toString()),
    //   foundProfiles: artistProfiles
    // });

    // console.log("Artist IDs being searched:", filteredArtists.map(artist => artist._id));
    // console.log("Found Artist Profiles:", artistProfiles);
    // console.log("Collection Name being used:", COLLECTION_NAME);

    // Tạo map cho profiles để dễ truy cập
    const profilesMap = new Map(artistProfiles.map(profile => [profile.artistId.toString(), profile]));
    // console.log("Profiles Map:", Object.fromEntries(profilesMap));

    // Tạo map các artist theo ID để dễ dàng truy cập thông tin
    const artistsMap = new Map(filteredArtists.map(artist => [artist._id.toString(), artist]));

    // Thêm thông tin của makeup artist vào mỗi dịch vụ
    const servicesWithArtists = sortedServices.map(service => {
      const artist = artistsMap.get(service.ownerId.toString());
      // console.log("Processing service for artist:", {
      //   serviceOwnerId: service.ownerId,
      //   artistFound: !!artist,
      //   artistId: artist?._id
      // });
      
      const profile = artist ? profilesMap.get(artist._id.toString()) : null;
      // console.log("Found profile:", {
      //   artistId: artist?._id,
      //   profileFound: !!profile,
      //   profileData: profile
      // });
      
      return {
        ...service,
        artist: artist ? {
          _id: artist._id,
          name: artist.name,
          email: artist.email,
          phone: artist.phone,
          address: artist.address,
          avatar: artist.avatar,
          bio: artist.bio,
          payment_type: artist.payment_type,
          payment_expiry: artist.payment_expiry,
          totalPrice: artist.totalPrice,
          rating: artist.rating,

          // Thông tin từ profile
          artistId: profile?.artistId,
          experienceYears: profile?.experienceYears,
          experienceMonths: profile?.experienceMonths,
          workingHours: profile?.workingHours,
          
          // Bank Information
          bankInfo: profile?.bankInfo ? {
            bankName: profile.bankInfo.bankName,
            bankAccount: profile.bankInfo.bankAccount,
            accountHolder: profile.bankInfo.accountHolder
          } : null,
          
          // Social Links
          socialLinks: profile?.socialLinks ? {
            facebook: profile.socialLinks.facebook,
            instagram: profile.socialLinks.instagram
          } : null,
          
          // Portfolio
          portfolio: profile?.portfolio?.map(item => ({
            image: item.image,
            desc: item.desc,
            category: item.category
          })) || [],
          
          // Certificates
          certificates: profile?.certificates?.map(cert => ({
            name: cert.name,
            image: cert.image,
            created_at: cert.created_at,
            updated_at: cert.updated_at
          })) || [],

          // Số lượng
          certificatesCount: profile?.certificates?.length || 0,
          portfolioCount: profile?.portfolio?.length || 0,
          experiencePeriod: profile?.experienceYears ? `${profile.experienceYears} năm ${profile.experienceMonths || 0} tháng` : null
        } : null
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: servicesWithArtists,
      featuredArtists: filteredArtists.map(artist => {
        const profile = profilesMap.get(artist._id.toString());
        return {
          _id: artist._id,
          name: artist.name,
          email: artist.email,
          phone: artist.phone,
          address: artist.address,
          avatar: artist.avatar,
          bio: artist.bio,
          payment_type: artist.payment_type,
          payment_expiry: artist.payment_expiry,
          totalPrice: artist.totalPrice,
          rating: artist.rating,

          // Thông tin từ profile
          artistId: profile?.artistId,
          experienceYears: profile?.experienceYears,
          experienceMonths: profile?.experienceMonths,
          workingHours: profile?.workingHours,
          
          // Bank Information
          bankInfo: profile?.bankInfo ? {
            bankName: profile.bankInfo.bankName,
            bankAccount: profile.bankInfo.bankAccount,
            accountHolder: profile.bankInfo.accountHolder
          } : null,
          
          // Social Links
          socialLinks: profile?.socialLinks ? {
            facebook: profile.socialLinks.facebook,
            instagram: profile.socialLinks.instagram
          } : null,
          
          // Portfolio
          portfolio: profile?.portfolio?.map(item => ({
            image: item.image,
            desc: item.desc,
            category: item.category
          })) || [],
          
          // Certificates
          certificates: profile?.certificates?.map(cert => ({
            name: cert.name,
            image: cert.image,
            created_at: cert.created_at,
            updated_at: cert.updated_at
          })) || [],

          // Số lượng
          certificatesCount: profile?.certificates?.length || 0,
          portfolioCount: profile?.portfolio?.length || 0,
          experiencePeriod: profile?.experienceYears ? `${profile.experienceYears} năm ${profile.experienceMonths || 0} tháng` : null
        };
      }),
      total: {
        services: servicesWithArtists.length,
        artists: filteredArtists.length
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}