import NextAuth from "next-auth";
import LineProvider from "next-auth/providers/line";

const handler = NextAuth({
  providers: [
    LineProvider({
      // 💡 微調 1：對齊您 .env 裡面的變數名稱 (CLIENT)
      clientId: process.env.LINE_CLIENT_ID || "",
      clientSecret: process.env.LINE_CLIENT_SECRET || "",
      // 強制要求 LINE 提供 openid、個人檔案與 Email
      authorization: {
        params: { scope: "profile openid email" },
      },
    }),
  ],
  // 💡 微調 2：指定登入大門為我們做好的 /admin
  pages: {
    signIn: '/admin',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, profile }: any) {
      if (profile && profile.email) {
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
});

export { handler as GET, handler as POST };