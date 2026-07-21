import NextAuth, { AuthOptions } from "next-auth";
import LineProvider from "next-auth/providers/line";

export const authOptions: AuthOptions = {
  providers: [
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID || "",
      clientSecret: process.env.LINE_CLIENT_SECRET || "",
      authorization: {
        params: { 
          scope: "profile openid email",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, profile }: any) {
      // 1. 只拿真實的 Email，沒有就不勉強，絕對不塞假資料
      if (profile?.email) {
        token.email = profile.email;
      } else {
        // 如果沒有拿到信箱，就把 email 欄位清空，不留垃圾資料
        token.email = null; 
      }
      
      // 2. 順便把 LINE 的真實內部 UID 存起來備用 (這不會顯示在畫面上)
      if (profile?.sub) {
        token.sub = profile.sub;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        // 把乾淨的 email 傳給前端
        session.user.email = token.email as string | null;
        // 把 LINE UID 隱含在 id 裡，做為未來的電話備援辨識使用
        session.user.id = token.sub as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };