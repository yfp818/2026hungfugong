"use client";

// 移除 SessionProvider，因為我們現在使用 Supabase 管理 Session
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}