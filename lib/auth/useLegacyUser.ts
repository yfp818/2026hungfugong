"use client";

import { useSession } from "next-auth/react";

export function useLegacyUser() {
  const { data: authSession, status } = useSession();

  const sessionUser = authSession?.user;

  const user = sessionUser?.id
    ? {
        id: sessionUser.id,
        email: sessionUser.id,
        name: sessionUser.name ?? "LINE信眾",
        user_metadata: {
          sub: sessionUser.id,
          name: sessionUser.name ?? "LINE信眾",
          picture: sessionUser.image ?? null,
        },
      }
    : null;

  return {
    user,
    session: user ? { user } : null,
    status,
    loading: status === "loading",
  };
}
