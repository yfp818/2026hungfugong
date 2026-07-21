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
    async jwt({ token, profile, account }: any) {
      // 只有在登入的那一瞬間，profile 會有值
      if (profile) {
        // 🚨 偵錯雷達：把 LINE 傳來的所有原始資料，印在 Vercel 後台
        console.log("=== [NextAuth] LINE 原始 Profile 回傳 ===");
        console.log(JSON.stringify(profile, null, 2));
        
        if (account) {
          console.log("=== [NextAuth] OIDC Account Token 回傳 ===");
          console.log(JSON.stringify(account, null, 2));
        }

        // 嚴格寫入真實 Email，沒有就是 null
        token.email = profile.email || null;
        token.sub = profile.sub;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
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