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
    // 💡 新增的 redirect 攔截器：強制 NextAuth 聽從按鈕的 callbackUrl 指示
    async redirect({ url, baseUrl }) {
      // 1. 如果有指定的相對路徑 (例如 "/admin")，就乖乖接上正式網址跳過去
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // 2. 如果是同一個網域的絕對路徑，也放行
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // 3. 其他不明狀況，才回首頁
      return baseUrl;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };