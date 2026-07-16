"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

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

  // ✨ 註解移到這裡就完全沒問題了
  return (
    <header className="sticky top-0 z-40 w-full bg-card/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-border dark:border-stone-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
       <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="/logo.png" 
            alt="皇府宮 Logo" 
            className="w-10 h-10 object-contain rounded-full shadow-sm group-hover:scale-105 transition-transform"
          />
          <span className={`text-xl md:text-2xl font-bold tracking-widest text-[#1A432D] dark:text-[#D89F3C] transition-colors ${fontClassName}`}>
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
                pathname === link.path ? "text-[#A61D24] dark:text-[#D89F3C]" : "text-stone-600 dark:text-stone-300 hover:text-[#1A432D] dark:hover:text-[#D89F3C]"
              }`}
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* 電腦版登入與信眾中心按鈕 */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          
          {session ? (
            <Link href="/member" className="flex items-center gap-2 bg-muted dark:bg-[#1A432D]/20 hover:bg-stone-100 dark:hover:bg-[#1A432D]/40 border border-border dark:border-[#1A432D]/30 text-[#1A432D] dark:text-[#D89F3C] px-5 py-2 rounded-full text-sm font-bold tracking-widest transition-all">
              <div className="w-2 h-2 bg-[#06C755] rounded-full"></div>
              信眾中心
            </Link>
          ) : (
            <button 
              onClick={() => signIn("line", { callbackUrl: "/member" })} 
              className="bg-[#1A432D] dark:bg-[#D89F3C] hover:bg-[#122F20] dark:hover:bg-[#C48C2B] text-white dark:text-[#121212] px-6 py-2 rounded-full text-sm font-bold tracking-widest transition-all"
            >
              登入 / 註冊
            </button>
          )}
        </div>

        {/* 手機版漢堡選單按鈕 */}
        <button className="md:hidden p-2 text-stone-600 dark:text-stone-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
        <div className="md:hidden bg-card dark:bg-[#121212] border-b border-border dark:border-stone-800 px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 transition-colors duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-bold tracking-widest transition-colors ${
                pathname === link.path ? "bg-muted dark:bg-stone-800/50 text-[#A61D24] dark:text-[#D89F3C]" : "text-stone-600 dark:text-stone-300"
              }`}
            >
              {link.title}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-border dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-bold tracking-widest text-muted-foreground dark:text-stone-400">深色模式</span>
              <ThemeToggle />
            </div>

            {session ? (
              <Link href="/member" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 w-full bg-muted dark:bg-[#1A432D]/20 border border-border dark:border-[#1A432D]/30 text-[#1A432D] dark:text-[#D89F3C] px-4 py-3.5 rounded-xl text-sm font-bold tracking-widest transition-colors">
                <div className="w-2 h-2 bg-[#06C755] rounded-full"></div>
                前往信眾中心
              </Link>
            ) : (
              <button 
                onClick={() => { signIn("line", { callbackUrl: "/member" }); setIsMenuOpen(false); }} 
                className="w-full bg-[#1A432D] dark:bg-[#D89F3C] text-white dark:text-[#121212] px-4 py-3.5 rounded-xl text-sm font-bold tracking-widest shadow-md transition-colors"
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