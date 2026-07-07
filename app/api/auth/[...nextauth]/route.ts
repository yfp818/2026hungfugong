import NextAuth, { AuthOptions } from "next-auth";
import LineProvider from "next-auth/providers/line";

export const authOptions: AuthOptions = {
  providers: [
    LineProvider({
      // 這裡必須跟 Vercel 上的名稱完全一樣
      clientId: process.env.LINE_CLIENT_ID || "",
      clientSecret: process.env.LINE_CLIENT_SECRET || "",
      authorization: {
        params: { scope: "profile openid email" },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, profile }: any) {
      // 確保將 LINE 傳回的 email 寫入
      if (profile?.email) {
        token.email = profile.email;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user && token.email) {
        session.user.email = token.email;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // 加上這行，萬一出錯，終端機會顯示詳細原因，不再只是一句 Try again
  debug: process.env.NODE_ENV !== "production", 
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };