import NextAuth from "next-auth";
import LineProvider from "next-auth/providers/line";

const handler = NextAuth({
  providers: [
    LineProvider({
      clientId: process.env.LINE_CHANNEL_ID || "",
      clientSecret: process.env.LINE_CHANNEL_SECRET || "",
      // 🌟 核心變更：強制要求 LINE 提供 openid、個人檔案與 Email
      authorization: {
        params: { scope: "profile openid email" },
      },
    }),
  ],
  // 🌟 核心變更：強制指定 session 採用 JWT 機制，這與 Middleware 完美連動
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // 當 JWT 建立時，確保將 LINE 傳回的 email 寫入加密憑證中
    async jwt({ token, profile }: any) {
      if (profile && profile.email) {
        token.email = profile.email;
      }
      return token;
    },
    // 當前台或 Middleware 讀取 session 時，放行 email 帶入
    async session({ session, token }: any) {
      if (session.user && token.email) {
        session.user.email = token.email;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };