import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '@muahub/lib/mongodb';
import { ROLE_MANAGER } from '@muahub/constants/System';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const client = await clientPromise;
        const db = client.db("accounts");
        const accountsCollection = db.collection("users");
        
        // Kiểm tra xem user đã tồn tại chưa
        const existingUser = await accountsCollection.findOne({ email: user.email });
        
        if (!existingUser) {
          // Tạo user mới nếu chưa tồn tại
          const newUser = {
            email: user.email,
            name: user.name,
            googleId: user.id,
            avatar: user.image,
            role: ROLE_MANAGER.USER,
            active: true,
            totalPrice: 0,
            withdrawn: 0,
            payment_package: null,
            created_at: new Date()
          };
          
          await accountsCollection.insertOne(newUser);
        } else {
          // Cập nhật thông tin Google ID nếu chưa có
          if (!existingUser.googleId) {
            await accountsCollection.updateOne(
              { email: user.email },
              { 
                $set: { 
                  googleId: user.id,
                  avatar: user.image,
                  updated_at: new Date()
                } 
              }
            );
          }
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Lấy toàn bộ thông tin user từ database vào session.user, đồng bộ format với backend
      if (session.user) {
        const client = await clientPromise;
        const db = client.db("accounts");
        const accountsCollection = db.collection("users");
        const dbUser = await accountsCollection.findOne({ email: session.user.email });
        if (dbUser) {
          // Chuyển _id sang string
          const id = dbUser._id?.toString() || dbUser.id || "";
          session.user = {
            _id: id,
            id: id,
            email: dbUser.email || session.user.email || "",
            name: dbUser.name || session.user.name || "",
            avatar: dbUser.avatar || session.user.image || "",
            role: dbUser.role || "user",
            active: dbUser.active ?? true,
            phone: dbUser.phone || "",
            address: dbUser.address || "",
            bank_info: dbUser.bank_info || "",
            bank_info_number: dbUser.bank_info_number || "",
            bio: dbUser.bio || "",
            payment_package: dbUser.payment_package || null,
            payment_type: dbUser.payment_type || null,
            withdrawn: dbUser.withdrawn || 0,
            created_at: dbUser.created_at || "",
            updated_at: dbUser.updated_at || "",
            cccd: dbUser.cccd || "",
            totalPrice: dbUser.totalPrice || 0,
            payment_amount: dbUser.payment_amount || 0,
            payment_expiry: dbUser.payment_expiry || "",
            payment_history: dbUser.payment_history || [],
            // Các trường Google
            googleId: dbUser.googleId || "",
            image: dbUser.avatar || session.user.image || "",
          };
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/dang-nhap',
    error: '/dang-nhap',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };