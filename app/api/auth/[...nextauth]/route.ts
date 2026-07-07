import NextAuth, { AuthOptions } from "next-auth";
import LineProvider from "next-auth/providers/line";

// 自動判斷目前是否為 Vercel 正式環境
const useSecureCookies = process.env.NODE_ENV === "production";

export const authOptions: AuthOptions = {
  providers: [
    LineProvider({
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
  // ✨ 終極修復：強制讓 Cookie 在手機「跨 App 跳轉時」存活
  cookies: {
    state: {
      name: useSecureCookies ? "__Secure-next-auth.state" : "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "none", // 允許從 LINE App 跳回瀏覽器時帶著號碼牌
        path: "/",
        secure: useSecureCookies,
      },
    },
    nonce: {
      name: useSecureCookies ? "__Secure-next-auth.nonce" : "next-auth.nonce",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: useSecureCookies,
      },
    }
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