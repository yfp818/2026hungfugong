"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, ClipboardList, Users, 
  Settings, Megaphone, LogOut, Menu, X 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: "總覽儀表板", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "訂單與財務報表", path: "/admin/orders", icon: <ClipboardList size={20} /> },
    { name: "信眾與餘額管理", path: "/admin/members", icon: <Users size={20} /> },
    { name: "網站內容與公告", path: "/admin/content", icon: <Megaphone size={20} /> },
    { name: "服務與專案設定", path: "/admin/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen w-full bg-[#FAF7F0] overflow-hidden">
      
      {/* 📱 行動版側邊欄遮罩 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 👈 左側邊欄 (Sidebar) */}
      <aside className={`fixed lg:static top-0 left-0 z-50 h-full w-64 bg-card border-r border-border shadow-sm transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 flex items-center justify-between border-b border-border">
          <h1 className="text-xl font-bold text-[#A61D24] tracking-widest">皇府宮後台</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-muted-foreground"><X size={24} /></button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} onClick={() => setIsSidebarOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold tracking-widest transition-colors ${isActive ? 'bg-[#1A432D] text-white shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button onClick={() => signOut()} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
            <LogOut size={18} /> 登出系統
          </button>
        </div>
      </aside>

      {/* 👉 右側主內容區 */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* 🔝 頂部導覽列 (Sticky Navbar) */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-foreground bg-muted p-2 rounded-lg"><Menu size={24} /></button>
            <h2 className="font-bold tracking-widest text-slate-800 hidden sm:block">
              {menuItems.find(m => m.path === pathname)?.name || "管理中心"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-foreground">{session?.user?.name || "管理員"}</p>
              <p className="text-xs text-muted-foreground font-mono">{session?.user?.email}</p>
            </div>
            {session?.user?.image ? (
              <img src={session.user.image} alt="avatar" className="w-10 h-10 rounded-full border border-border shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#1A432D] text-white flex items-center justify-center font-bold">管</div>
            )}
          </div>
        </header>

        {/* 📄 動態子頁面內容 (Fluid Main Content) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}