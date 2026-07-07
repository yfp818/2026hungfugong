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
          // 這是唯一新增的一行：強制在手機瀏覽器內登入，避免跳轉到 LINE App 導致 Cookie 遺失
          disable_ios_auto_login: "true" 
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, profile }: any) {
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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };