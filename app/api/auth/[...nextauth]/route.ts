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
    async jwt({ token, profile, user }: any) {
      // 1. 如果有真實 email 就用真實的
      if (profile?.email) {
        token.email = profile.email;
      } 
      // 2. 🛡️ 防呆機制：如果沒信箱，強制把 LINE UID 變成虛擬信箱，確保資料庫絕對有值可綁定
      else if (token.sub || user?.id) {
        token.email = `${token.sub || user.id}@line.user`; 
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user && token.email) {
        session.user.email = token.email;
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