import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import LoginButton from "./LoginButton"; 
import Link from "next/link";
import { LayoutDashboard, ClipboardList, Users, Settings, Megaphone } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  // 請確認這裡有您的 LINE 綁定信箱
  const adminEmails = [
    "yfp818@gmail.com", 
  ];

  if (!session || !session.user?.email || !adminEmails.includes(session.user.email)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-[#1A432D]"></div>
        
        <div className="bg-card p-10 md:p-12 rounded-[2rem] shadow-2xl border border-stone-100 max-w-md w-full text-center space-y-8 relative z-10">
          <div className="w-20 h-20 bg-background text-[#D89F3C] rounded-full flex items-center justify-center mx-auto shadow-inner border border-border">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-[#1A432D] tracking-widest mb-2">皇府宮管理系統</h1>
            <p className="text-muted-foreground font-medium tracking-widest text-sm mb-2">
              {session?.user?.name ? `目前登入：${session.user.name}` : "請使用授權帳號登入"}
            </p>
            {session?.user?.email && !adminEmails.includes(session.user.email) && (
              <p className="text-red-500 text-xs font-bold tracking-widest bg-red-50 py-2 rounded-lg mt-2">
                ⚠️ 此帳號無管理權限：{session.user.email}
              </p>
            )}
          </div>
          
          <LoginButton />
          
          <p className="text-xs text-stone-300 tracking-widest">© 2026 皇府宮 All Rights Reserved.</p>
        </div>
      </div>
    );
  }

  // 💡 如果是白名單管理員，就會看到以下這個「全新總覽儀表板」的畫面
  // 並且這個畫面會自動被我們稍早建立的 layout.tsx (左側欄) 包覆住！
  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-widest">歡迎回來，{session.user.name}</h1>
        <p className="text-muted-foreground mt-2 tracking-widest">請從左側選單選擇您要管理的項目，或點擊下方快速捷徑。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/orders" className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><ClipboardList size={24} /></div>
          <div><h3 className="font-bold text-lg text-foreground">訂單與報表</h3><p className="text-xs text-muted-foreground mt-1 tracking-widest">處理信眾祈福與代辦服務</p></div>
        </Link>
        <Link href="/admin/members" className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Users size={24} /></div>
          <div><h3 className="font-bold text-lg text-foreground">信眾與餘額</h3><p className="text-xs text-muted-foreground mt-1 tracking-widest">管理名冊與核發祈福金</p></div>
        </Link>
        <Link href="/admin/content" className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Megaphone size={24} /></div>
          <div><h3 className="font-bold text-lg text-foreground">網站與公告</h3><p className="text-xs text-muted-foreground mt-1 tracking-widest">更新首頁視覺與最新消息</p></div>
        </Link>
        <Link href="/admin/settings" className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Settings size={24} /></div>
          <div><h3 className="font-bold text-lg text-foreground">服務與專案</h3><p className="text-xs text-muted-foreground mt-1 tracking-widest">設定祈福項目與快閃活動</p></div>
        </Link>
      </div>
    </div>
  );
}