"use client";
import { createClient } from "@/lib/supabase/client";

export default function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "custom:line" as any,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white py-4 rounded-xl font-bold tracking-widest transition-transform hover:scale-[1.02] shadow-md"
    >
      LINE / 信箱 安全登入
    </button>
  );
}