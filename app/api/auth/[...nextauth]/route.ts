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
      // 當使用者登入且 LINE 回傳 profile 時
      if (profile) {
        // 1. 只拿真實的 Email，沒有就是 null，絕對不捏造假信箱
        token.email = profile.email || null;
        
        // 2. 存下 LINE 的真實內部 UID (sub)，這是永遠不變的身分證
        token.sub = profile.sub;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        // 將乾淨的 email 傳給前端 (可能是真實信箱，也可能是 null)
        session.user.email = token.email as string | null;
        
        // 將 LINE UID 綁定在 user.id 上，做為未來的絕對備援識別
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