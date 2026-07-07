"use client";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      // 這裡直接呼叫 next-auth 的 signIn 函式，精準跳轉 LINE 不會迷路！
      onClick={() => signIn("line", { callbackUrl: "/admin" })}
      className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white py-4 rounded-xl font-bold tracking-widest transition-transform hover:scale-[1.02] shadow-md"
    >
      LINE / 信箱 安全登入
    </button>
  );
}