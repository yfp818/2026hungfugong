"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SiteHeader({ fontClassName }: { fontClassName?: string }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white/40 backdrop-blur-md sticky top-0 z-40 border-b border-white/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className={`${fontClassName} font-bold text-2xl tracking-widest text-slate-800`}>
            皇府宮
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-600 hover:bg-white/60 hover:text-slate-900 hidden md:inline-flex tracking-wider">
              您的祈福袋
            </Button>
            <Button variant="ghost" className="text-slate-600 hover:bg-white/60 hover:text-slate-900 tracking-wider" onClick={() => setIsLoginOpen(true)}>
              登入
            </Button>
            <Button className="bg-white/60 text-slate-700 hover:bg-white/90 backdrop-blur-sm rounded-full px-4 text-lg font-bold border border-white/80 shadow-sm" onClick={() => setIsMenuOpen(true)}>
              三
            </Button>
          </div>
        </div>
      </header>

      {/* 側邊選單：玻璃白 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-slate-900/10 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="w-full max-w-md bg-white/80 backdrop-blur-xl text-slate-800 p-8 h-full overflow-y-auto animate-in slide-in-from-right border-l border-white/60 shadow-2xl">
            <div className="flex justify-between items-center mb-12 border-b border-slate-200/50 pb-6">
              <span className={`${fontClassName} text-3xl font-bold text-slate-800`}>皇府宮</span>
              <button onClick={() => setIsMenuOpen(false)} className="text-4xl text-slate-400 hover:text-slate-700">&times;</button>
            </div>
            <nav className="space-y-6 text-lg tracking-widest flex flex-col">
              <Link href="#" className="border-b border-slate-100 pb-4 hover:text-slate-500 transition-colors">最新消息</Link>
              <Link href="#" className="border-b border-slate-100 pb-4 hover:text-slate-500 transition-colors">關於本宮</Link>
              <Link href="/booking" className="border-b border-slate-100 pb-4 hover:text-slate-500 transition-colors" onClick={() => setIsMenuOpen(false)}>預約問事</Link>
              <Link href="/lamps" className="border-b border-slate-100 pb-4 hover:text-slate-500 transition-colors" onClick={() => setIsMenuOpen(false)}>報名祈福專區</Link>
              <Link href="#" className="border-b border-slate-100 pb-4 hover:text-slate-500 transition-colors">聯絡我們</Link>
            </nav>
          </div>
        </div>
      )}

      {/* 登入彈窗：純淨透光 */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl w-full max-w-md p-8 relative shadow-2xl text-slate-800">
            <button onClick={() => setIsLoginOpen(false)} className="absolute -top-3 -right-3 bg-white text-slate-400 border border-white w-8 h-8 rounded-full flex items-center justify-center hover:text-slate-700 hover:bg-slate-50 shadow-md">&times;</button>
            
            <div className="flex mb-6 bg-white/50 p-1 rounded-lg border border-white/60 shadow-inner">
              <button className="flex-1 bg-white/90 text-slate-800 py-2 rounded-md font-bold tracking-widest shadow-sm">登入</button>
              <button className="flex-1 text-slate-500 py-2 font-medium hover:text-slate-800 tracking-widest">註冊</button>
            </div>
            
            <div className="space-y-4">
              <input type="email" placeholder="請輸入電子郵件" className="w-full bg-white/60 border border-white/80 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-slate-800 placeholder:text-slate-400" />
              <input type="password" placeholder="請輸入密碼" className="w-full bg-white/60 border border-white/80 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-slate-800 placeholder:text-slate-400" />
              
              <div className="flex justify-between items-center text-sm text-slate-500">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-slate-400" /> 記住我
                </label>
                <a href="#" className="hover:text-slate-800 hover:underline">忘記密碼了嗎？</a>
              </div>
              
              <Button className="w-full bg-slate-800/90 backdrop-blur-md text-white hover:bg-slate-900 py-6 text-lg tracking-widest mt-4 rounded-xl shadow-lg border border-slate-700/50">
                登入
              </Button>
              <Button className="w-full bg-[#06C755]/95 backdrop-blur-md text-white hover:bg-[#05b04a] py-6 text-lg font-bold tracking-widest border-none rounded-xl shadow-lg">
                透過 LINE 登入
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}