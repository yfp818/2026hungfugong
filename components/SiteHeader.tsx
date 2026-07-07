"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function SiteHeader({ fontClassName = "" }: { fontClassName?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const navLinks = [
    { title: "首頁", path: "/" },
    { title: "當月點燈", path: "/lamps" },
    { title: "代燒服務", path: "/burning" },
    { title: "濟事問事", path: "/booking" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
       <Link href="/" className="flex items-center gap-3 group">
  {/* 🌟 您的專屬小 LOGO */}
  <img 
    src="/logo.png" 
    alt="皇府宮 Logo" 
    className="w-10 h-10 object-contain rounded-full shadow-sm group-hover:scale-105 transition-transform"
  />
  
  {/* 原本的文字 */}
  <span className="text-xl md:text-2xl font-bold tracking-widest text-[#1A432D]">
    皇府宮
  </span>
</Link>

        {/* 電腦版選單 */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-sm font-bold tracking-widest transition-colors ${
                pathname === link.path ? "text-[#A61D24]" : "text-stone-600 hover:text-[#1A432D]"
              }`}
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* 電腦版登入與信眾中心按鈕 */}
        <div className="hidden md:flex items-center">
          {session ? (
            <Link href="/member" className="flex items-center gap-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-[#1A432D] px-5 py-2 rounded-full text-sm font-bold tracking-widest transition-all">
              <div className="w-2 h-2 bg-[#06C755] rounded-full"></div>
              信眾中心
            </Link>
          ) : (
            <button 
              // ✨ 這裡加上了 callbackUrl
              onClick={() => signIn("line", { callbackUrl: "/member" })} 
              className="bg-[#1A432D] hover:bg-[#122F20] text-white px-6 py-2 rounded-full text-sm font-bold tracking-widest transition-all"
            >
              登入 / 註冊
            </button>
          )}
        </div>

        {/* 手機版漢堡選單按鈕 */}
        <button className="md:hidden p-2 text-stone-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 手機版展開選單 */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-bold tracking-widest ${
                pathname === link.path ? "bg-stone-50 text-[#A61D24]" : "text-stone-600"
              }`}
            >
              {link.title}
            </Link>
          ))}
          <div className="pt-4 border-t border-stone-100">
            {session ? (
              <Link href="/member" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 w-full bg-stone-50 border border-stone-200 text-[#1A432D] px-4 py-3.5 rounded-xl text-sm font-bold tracking-widest">
                <div className="w-2 h-2 bg-[#06C755] rounded-full"></div>
                前往信眾中心
              </Link>
            ) : (
              <button 
                // ✨ 這裡也加上了 callbackUrl
                onClick={() => { signIn("line", { callbackUrl: "/member" }); setIsMenuOpen(false); }} 
                className="w-full bg-[#1A432D] text-white px-4 py-3.5 rounded-xl text-sm font-bold tracking-widest shadow-md"
              >
                LINE 快速登入
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}