import { getServerSession } from "next-auth";
import Link from "next/link";
import AdminDashboard from "./AdminDashboard"; // 載入我們剛剛改名的控制面板

// 強制伺服器每次都即時驗證，絕不快取
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // 1. 在安全的伺服器端抓取使用者的登入資訊
  const session = await getServerSession();
  
  // 2. 設定您的後台白名單信箱
  const adminEmails = [
    "yfp818@gmail.com", 
    "vip_818@me.com" 
  ];

  // 3. 防護機制：如果沒登入，或是登入的信箱不在白名單內，就擋在門外
  if (!session || !session.user?.email || !adminEmails.includes(session.user.email)) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-[#1A432D]"></div>
        
        <div className="bg-white p-10 md:p-12 rounded-[2rem] shadow-2xl border border-stone-100 max-w-md w-full text-center space-y-8 relative z-10">
          <div className="w-20 h-20 bg-[#FAF7F0] text-[#D89F3C] rounded-full flex items-center justify-center mx-auto shadow-inner border border-stone-200">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-[#1A432D] tracking-widest mb-2">皇府宮管理系統</h1>
            <p className="text-stone-500 font-medium tracking-widest text-sm mb-2">
              {session?.user?.name ? `目前登入：${session.user.name}` : "請使用授權帳號登入"}
            </p>
            {session?.user?.email && !adminEmails.includes(session.user.email) && (
              <p className="text-red-500 text-xs font-bold tracking-widest">⚠️ 此帳號無管理權限</p>
            )}
          </div>
          
          {/* 這裡會自動串接您之前寫好的 NextAuth LINE/Google 登入機制 */}
          <Link href="/api/auth/signin" className="block">
            <button className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white py-4 rounded-xl font-bold tracking-widest transition-transform hover:scale-[1.02] shadow-md">
              LINE / 信箱 安全登入
            </button>
          </Link>
          
          <p className="text-xs text-stone-300 tracking-widest">© 2026 皇府宮 All Rights Reserved.</p>
        </div>
      </div>
    );
  }

  // 4. 只有驗證通過的超級管理員，才能看見這個畫面
  return <AdminDashboard />;
}