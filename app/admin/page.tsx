import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // 載入鑰匙
import AdminDashboard from "./AdminDashboard";
import LoginButton from "./LoginButton"; // 載入剛剛做的按鈕

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // 💡 修正 1：把 authOptions 交給伺服器，它才解得開您的登入狀態！
  const session = await getServerSession(authOptions);
  
  // 請確認這裡有您的 LINE 綁定信箱
  const adminEmails = [
    "yfp818@gmail.com", 
  ];

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
              <p className="text-red-500 text-xs font-bold tracking-widest bg-red-50 py-2 rounded-lg mt-2">
                ⚠️ 此帳號無管理權限：{session.user.email}
              </p>
            )}
          </div>
          
          {/* 💡 修正 2：使用剛剛做好的客戶端按鈕，取代原本會死結的 Link */}
          <LoginButton />
          
          <p className="text-xs text-stone-300 tracking-widest">© 2026 皇府宮 All Rights Reserved.</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}