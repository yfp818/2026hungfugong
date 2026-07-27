"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
// 引入 Supabase Client 替代 next-auth
import { createClient } from "@/lib/supabase/client"; 

export default function SiteHeader({ fontClassName = "" }: { fontClassName?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  // 改為儲存 Supabase 的 user
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  // 初始化時取得使用者狀態
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // 監聽登入狀態改變
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { title: "首頁", path: "/" },
    { title: "當月點燈", path: "/lamps" },
    { title: "代燒服務", path: "/burning" },
    { title: "濟事問事", path: "/booking" },
  ];

  // 封裝新的登入處理函式
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "custom:line" as any,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/member`,
      },
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-300">
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

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-sm font-bold tracking-widest transition-colors ${
                pathname === link.path ? "text-[#A61D24] dark:text-[#D89F3C]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.title}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          
          {user ? (
            <Link href="/member" className="flex items-center gap-2 bg-muted hover:bg-muted/80 border border-border text-foreground px-5 py-2 rounded-full text-sm font-bold tracking-widest transition-all">
              <div className="w-2 h-2 bg-[#06C755] rounded-full"></div>
              信眾中心
            </Link>
          ) : (
            <button 
              onClick={handleLogin} 
              className="bg-[#1A432D] dark:bg-[#D89F3C] hover:bg-[#122F20] dark:hover:bg-[#C48C2B] text-white dark:text-background px-6 py-2 rounded-full text-sm font-bold tracking-widest transition-all"
            >
              登入 / 註冊
            </button>
          )}
        </div>

        <button className="md:hidden p-2 text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 transition-colors duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-bold tracking-widest transition-colors ${
                pathname === link.path ? "bg-muted text-[#A61D24] dark:text-[#D89F3C]" : "text-muted-foreground"
              }`}
            >
              {link.title}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-bold tracking-widest text-muted-foreground">深色模式</span>
              <ThemeToggle />
            </div>

            {user ? (
              <Link href="/member" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 w-full bg-muted border border-border text-foreground px-4 py-3.5 rounded-xl text-sm font-bold tracking-widest transition-colors">
                <div className="w-2 h-2 bg-[#06C755] rounded-full"></div>
                前往信眾中心
              </Link>
            ) : (
              <button 
                onClick={() => { handleLogin(); setIsMenuOpen(false); }} 
                className="w-full bg-[#1A432D] dark:bg-[#D89F3C] text-white dark:text-background px-4 py-3.5 rounded-xl text-sm font-bold tracking-widest shadow-md transition-colors"
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