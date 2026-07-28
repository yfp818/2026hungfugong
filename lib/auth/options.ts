import type { NextAuthOptions } from "next-auth";
import LineProvider from "next-auth/providers/line";

export const authOptions: NextAuthOptions = {
  providers: [
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "profile openid",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, profile, account }) {
      if (account?.provider === "line" && profile) {
        const lineProfile = profile as {
          sub?: string;
          name?: string;
          picture?: string;
        };

        token.lineUserId = lineProfile.sub;
        token.lineName = lineProfile.name;
        token.linePicture = lineProfile.picture;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: typeof token.lineUserId === "string" ? token.lineUserId : "",
        name:
          typeof token.lineName === "string"
            ? token.lineName
            : session.user?.name,
        image:
          typeof token.linePicture === "string"
            ? token.linePicture
            : session.user?.image,
      };

      return session;
    },
  },

  pages: {
    error: "/?login_error=nextauth",
  },
};
