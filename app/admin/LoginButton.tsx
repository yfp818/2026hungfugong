"use client";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      // 💡 這裡加上 callbackUrl，登入成功後就會乖乖回到後台，不會亂跑！
      onClick={() => signIn("line", { callbackUrl: "/admin" })}
      className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white py-4 rounded-xl font-bold tracking-widest transition-transform hover:scale-[1.02] shadow-md"
    >
      LINE / 信箱 安全登入
    </button>
  );
}