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
      // Thêm thông tin user từ database vào session
      if (session.user) {
        const client = await clientPromise;
        const db = client.db("accounts");
        const accountsCollection = db.collection("users");
        
        const dbUser = await accountsCollection.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.role = dbUser.role;
          session.user.active = dbUser.active;
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