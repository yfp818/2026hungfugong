"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, History, Wallet, UserCircle, MapPin, Phone, Edit3, X, FileText, Camera, Info, Coins, ArrowRightLeft } from "lucide-react"; 

export default function MemberCenter() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState({ phone: "", address: "" });

  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // 抓取信眾資料
  async function fetchMemberData() {
    if (session?.user?.email) {
      // 1. 取得聯絡資訊
      const { data: userProfile } = await supabase
        .from("user_contacts")
        .select("*")
        .eq("line_id", session.user.email)
        .single();

      if (userProfile) {
        setProfile({ phone: userProfile.phone || "", address: userProfile.address || "" });
      }

      // 2. 取得會員錢包餘額
      const { data: memberData } = await supabase
        .from("member_profiles")
        .select("wallet_balance")
        .eq("user_line_id", session.user.email)
        .single();
        
      if (memberData) {
        setWalletBalance(memberData.wallet_balance || 0);
      }

      // 3. 取得祈福金異動紀錄
      const { data: txData } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_line_id", session.user.email)
        .order("created_at", { ascending: false });

      if (txData) setTransactions(txData);

      // 4. 取得歷史祈福訂單紀錄 (以 LINE ID 為主，若無則用電話抓取)
      let historyOrders: any[] = [];
      const { data: ordersByLine } = await supabase
        .from("service_orders")
        .select("*")
        .eq("user_line_id", session.user.email)
        .order("created_at", { ascending: false });
      
      if (ordersByLine && ordersByLine.length > 0) {
        historyOrders = ordersByLine;
      } else if (userProfile?.phone) {
        const { data: ordersByPhone } = await supabase
          .from("service_orders")
          .select("*")
          .eq("user_phone", userProfile.phone)
          .order("created_at", { ascending: false });
        if (ordersByPhone) historyOrders = ordersByPhone;
      }
      setOrders(historyOrders);
    }
    setLoadingOrders(false);
  }

  useEffect(() => {
    fetchMemberData();
  }, [session]);

  // 🌟 核心升級：儲存並自動融合舊帳號
  const handleSaveProfile = async () => {
    if (session?.user?.email) {
      // 1. 儲存基礎聯絡資訊
      await supabase.from("user_contacts").upsert({
        line_id: session.user.email,
        line_name: session.user.name,
        phone: profile.phone,
        address: profile.address,
      });

      // 2. 檢查並融合舊的電話錢包帳戶
      if (profile.phone) {
        const oldPhoneId = `phone_${profile.phone}`;
        const { data: oldProfile } = await supabase.from("member_profiles").select("*").eq("user_line_id", oldPhoneId).single();
        
        if (oldProfile) {
           // 找到舊帳號，進行餘額轉移
           const { data: currentProfile } = await supabase.from("member_profiles").select("*").eq("user_line_id", session.user.email).single();
           const currentBalance = currentProfile?.wallet_balance || 0;
           const newTotalBalance = currentBalance + (oldProfile.wallet_balance || 0);

           // 創建或更新正式 LINE 帳號的錢包
           await supabase.from("member_profiles").upsert({
              user_line_id: session.user.email,
              name: session.user.name,
              phone: profile.phone,
              wallet_balance: newTotalBalance
           });

           // 轉移舊帳號的所有交易紀錄給 LINE 帳號
           await supabase.from("wallet_transactions").update({ user_line_id: session.user.email }).eq("user_line_id", oldPhoneId);
           
           // 轉移舊訂單
           await supabase.from("service_orders").update({ user_line_id: session.user.email }).eq("user_phone", profile.phone);

           // 刪除舊的臨時電話帳號
           await supabase.from("member_profiles").delete().eq("user_line_id", oldPhoneId);
           
           alert(`🎉 系統已自動為您找回舊有的祈福金餘額 $${oldProfile.wallet_balance}！`);
        } else {
           // 若無舊帳號，確保當前 LINE 帳號在 member_profiles 中有建檔
           await supabase.from("member_profiles").upsert({
              user_line_id: session.user.email,
              name: session.user.name,
              phone: profile.phone
           }, { onConflict: 'user_line_id' });
        }
      }
      
      alert("資料已更新！");
      setIsEditingProfile(false);
      fetchMemberData(); // 重新拉取最新餘額與狀態
    }
  };

  const formatServiceDetails = (details: string) => {
    if (!details) return "";
    let rawString = details
      .replace(/特辦活動:?\s*/g, '')
      .replace(/報名方案:?\s*/g, '')
      .replace(/認捐方案:?\s*/g, '')
      .replace(/\s*x\d+/g, '')
      .replace(/\s*\(\$\d+\)/g, '')
      .trim();

    let optionsArray = rawString.split('、').map((s: string) => s.trim()).filter(Boolean);
    const limitedOptions = optionsArray.slice(0, 3).join('、');
    return optionsArray.length > 3 ? limitedOptions + '等' : limitedOptions;
  };

  if (status === "loading") {
    return <div className="min-h-screen bg-background flex items-center justify-center font-bold tracking-widest text-[#1A432D]">驗證信眾身分中...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <UserCircle className="w-24 h-24 text-stone-300 mb-6" />
        <h1 className="text-3xl font-bold text-slate-800 tracking-widest mb-4">請先登入信眾帳號</h1>
        <p className="text-muted-foreground mb-8 tracking-widest leading-relaxed max-w-md">登入後即可查看您的專屬祈福紀錄與本宮代辦進度，並管理您的聯絡資訊。</p>
        <Link href="/"><Button className="bg-[#1A432D] hover:bg-[#122F20] text-white px-8 py-6 rounded-full font-bold tracking-widest shadow-lg">返回首頁</Button></Link>
      </div>
    );
  }

  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const pendingOrders = orders.filter((o) => o.status !== "completed" && o.status !== "refunded").length;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="bg-[#1A432D] pt-24 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center text-white">
          <h1 className="text-4xl font-bold tracking-[0.3em] mb-4">信眾服務中心</h1>
          <p className="text-white/70 tracking-widest text-sm">慈悲喜捨，常保安康</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-20 space-y-6">
        
        {/* 帳戶基礎資訊 */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-5">
            {session?.user?.image ? (
              <img src={session.user.image} alt="avatar" className="w-16 h-16 rounded-full border-2 border-stone-100 shadow-sm object-cover" />
            ) : (
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 border-2 border-border shadow-sm"><UserCircle size={32} /></div>
            )}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground tracking-wider">{session?.user?.name}</h2>
              <p className="text-xs text-stone-400 tracking-widest">已完成 LINE 信眾身分認證</p>
            </div>
          </div>
          <button onClick={() => signOut()} className="text-sm font-bold text-stone-400 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50">登出</button>
        </div>

        {/* 💳 專屬祈福金餘額卡片 */}
        <div className="bg-gradient-to-br from-[#1A432D] to-[#0F291B] text-white p-6 md:p-8 rounded-[2rem] shadow-lg relative overflow-hidden border border-emerald-800/40">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold tracking-widest text-emerald-300 bg-emerald-900/60 px-3 py-1.5 rounded-full border border-emerald-700/50 flex items-center gap-1.5 w-fit">
                <Coins size={14} /> 數位祈福金帳戶
              </span>
              <p className="text-sm text-emerald-200/80 tracking-widest mt-4">目前可用餘額</p>
              <p className="text-4xl md:text-5xl font-extrabold text-[#D89F3C] tracking-tight mt-1">
                ${walletBalance.toLocaleString()}
              </p>
              {/* 💡 溫馨提示：引導信眾綁定電話 */}
              {walletBalance === 0 && !profile.phone && (
                 <p className="text-xs text-amber-300/90 tracking-widest mt-3 bg-amber-900/30 p-2 rounded-lg inline-block border border-amber-700/30">
                   💡 提示：請於下方完善聯絡電話，系統將自動找回舊有紀錄與餘額。
                 </p>
              )}
            </div>
          </div>
          <div className="pt-5 mt-5 border-t border-emerald-800/60 flex justify-between items-center text-xs text-emerald-200/80 tracking-widest">
            <span>餘額可用於結帳時全額或部分扣抵</span>
            <span>系統自動對帳</span>
          </div>
        </div>

        {/* 狀態統計區塊 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2"><History size={20} /></div>
            <p className="text-3xl font-bold text-foreground">{completedOrders}</p>
            <p className="text-xs font-bold tracking-widest text-muted-foreground">已圓滿服務</p>
          </div>
          <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2"><Wallet size={20} /></div>
            <p className="text-3xl font-bold text-slate-800">{pendingOrders}</p>
            <p className="text-xs font-bold tracking-widest text-muted-foreground">待對帳處理</p>
          </div>
        </div>

        {/* 聯絡資訊區塊 */}
        <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
             <h3 className="text-lg font-bold text-slate-800 tracking-widest flex items-center gap-2">
               <Edit3 className="text-[#D89F3C]" size={20}/> 快速填表聯絡資訊
             </h3>
             <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
               {isEditingProfile ? "取消編輯" : "編輯資料"}
             </button>
          </div>
          
          {isEditingProfile ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
               <div><label className="block text-xs font-bold text-muted-foreground mb-2">聯絡電話</label><input value={profile.phone} onChange={e=>setProfile({...profile, phone: e.target.value})} className="w-full border border-border p-3 rounded-xl outline-none focus:border-[#1A432D]"/></div>
               <div><label className="block text-xs font-bold text-muted-foreground mb-2">通訊地址</label><input value={profile.address} onChange={e=>setProfile({...profile, address: e.target.value})} className="w-full border border-border p-3 rounded-xl outline-none focus:border-[#1A432D]"/></div>
               <Button onClick={handleSaveProfile} className="w-full bg-[#1A432D] hover:bg-[#122F20] text-white py-6 rounded-xl font-bold tracking-widest mt-2">儲存變更</Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"><Phone size={16} className="text-stone-400"/></div>
                 <div><p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">聯絡電話</p><p className="font-medium text-foreground">{profile.phone || "尚未設定"}</p></div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"><MapPin size={16} className="text-stone-400"/></div>
                 <div><p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">通訊地址</p><p className="font-medium text-foreground leading-relaxed">{profile.address || "尚未設定"}</p></div>
              </div>
              <p className="text-[10px] text-stone-400 tracking-widest pt-2 flex items-center gap-1.5">
                <Info size={12} className="shrink-0" />
                設定後，未來報名各項服務將會自動帶入，節省您的時間。
              </p>
            </div>
          )}
        </div>

        {/* 雙欄區塊：祈福金明細 & 祈福服務紀錄 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 左側：祈福金異動明細 */}
          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-widest flex items-center gap-2 border-b border-border pb-4">
              <ArrowRightLeft className="text-purple-700" size={20}/> 祈福金異動明細
            </h3>
            
            {loadingOrders ? (
              <div className="text-center py-10 text-stone-400 font-bold tracking-widest">載入中...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-2xl border border-dashed border-border text-stone-400 font-bold tracking-widest">
                尚無資金異動紀錄
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div>
                      <p className="font-bold text-sm text-foreground tracking-wide">{tx.description}</p>
                      <p className="text-xs font-medium text-stone-400 mt-1">
                        {new Date(tx.created_at).toLocaleDateString("zh-TW")}
                      </p>
                    </div>
                    <span className={`font-bold tracking-wider ${tx.amount >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右側：祈福與服務紀錄 */}
          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-widest flex items-center gap-2 border-b border-border pb-4">
              <Calendar className="text-[#A61D24]" size={20}/> 祈福與服務紀錄
            </h3>
            
            {loadingOrders ? (
              <div className="text-center py-10 text-stone-400 font-bold tracking-widest">載入中...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-2xl border border-dashed border-border text-stone-400 font-bold tracking-widest">
                目前尚無紀錄
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {orders.map((order) => (
                  <div key={order.id} className={`p-5 border border-stone-100 rounded-2xl flex flex-col justify-between gap-4 transition-shadow group bg-white ${order.status === 'refunded' ? 'opacity-50' : 'hover:shadow-md'}`}>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full tracking-widest ${order.status === 'refunded' ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-600'}`}>
                          {order.status === 'refunded' ? '已作廢退款' : order.service_type}
                        </span>
                        <span className="text-xs font-medium text-stone-400">{new Date(order.created_at).toLocaleDateString('zh-TW')}</span>
                      </div>
                      <p className={`font-bold line-clamp-2 text-sm md:text-base pt-1 ${order.status === 'refunded' ? 'text-stone-400 line-through' : 'text-foreground'}`}>
                        {formatServiceDetails(order.service_details)}
                      </p>
                      {order.bank_last_5 && <p className="text-xs font-bold text-muted-foreground tracking-widest pt-1">匯款末五碼：<span className="text-[#A61D24]">{order.bank_last_5}</span></p>}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                       <span className={`font-bold text-lg ${order.status === 'refunded' ? 'text-stone-400' : 'text-foreground'}`}>${order.total_price || order.amount || 0}</span>
                       <div className="flex items-center gap-2">
                         {order.status !== 'refunded' && (
                           <button
                             onClick={() => setSelectedOrder(order)}
                             className="text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors shadow-sm flex items-center gap-1.5 hover:scale-105"
                           >
                             <FileText size={12} /> 祈福印記
                           </button>
                         )}
                         <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : order.status === 'refunded' ? 'bg-stone-100 text-stone-500 border border-border' : 'bg-stone-100 text-stone-500 border border-border'}`}>
                           {order.status === 'completed' ? '已處理' : order.status === 'refunded' ? '已作廢退款' : '待對帳'}
                         </span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 祈福印記彈窗模組 (完全保留原版絕對定位設定) */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedOrder(null)} 
        >
          <div 
            className="relative w-full max-w-[360px] flex flex-col items-center" 
            onClick={(e) => e.stopPropagation()} 
          >
            
            <button 
              onClick={() => setSelectedOrder(null)} 
              className="absolute -top-12 right-0 text-white hover:text-[#D89F3C] transition-colors bg-card/20 p-2 rounded-full backdrop-blur-md z-[60]"
            >
              <X size={20} />
            </button>

            <style>{`#global-cart-btn { display: none !important; }`}</style>

            <div className="bg-[#1A432D]/90 text-[#D89F3C] border border-[#D89F3C]/50 text-xs font-bold py-2.5 px-4 rounded-xl mb-4 flex items-center justify-center gap-2 shadow-lg w-full max-w-[280px]">
               <Camera size={14} className="shrink-0" />
               <span className="tracking-widest">貼心小提示：可截圖保存此祈福印記</span>
            </div>

            <div className="relative w-full max-w-[360px] drop-shadow-2xl mx-auto overflow-hidden rounded-xl bg-background">
              
              <img 
                src="https://oyoopxulmfihblgaptva.supabase.co/storage/v1/object/public/images/20260716jpg.png" 
                alt="祈福印記" 
                className="w-full h-auto block pointer-events-none select-none relative z-0" 
              />

              <style>{`
                .receipt-text {
                  font-family: var(--font-noto-serif), "Noto Serif TC", serif !important;
                }
              `}</style>

              <div 
                className="absolute z-10 receipt-text flex flex-col items-center justify-center text-center"
                style={{ 
                  left: 'calc(44.5 / 175 * 100%)', 
                  top: 'calc(85 / 300 * 100%)', 
                  width: 'calc(90 / 175 * 100%)', 
                  height: 'calc(20 / 300 * 100%)' 
                }}
              >
                <h2 className="text-[17px] md:text-[19px] font-bold text-[#A61D24] tracking-[0.3em] leading-none mb-1">祈福印記</h2>
                <p className="text-[#D89F3C] text-[10px] md:text-[11px] tracking-widest font-bold leading-none">- 大德護持 善神擁護 -</p>
              </div>

              <div 
                className="absolute z-10 receipt-text text-[#A61D24] flex items-center justify-center"
                style={{ 
                  left: 'calc(160 / 175 * 100%)', 
                  top: 'calc(75 / 300 * 100%)', 
                  width: 'calc(12 / 175 * 100%)', 
                  height: 'calc(150 / 300 * 100%)',
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright'
                }}
              >
                <span className="font-bold text-[14px] md:text-[11px] tracking-[0.2em]">天運歲次登記吉日</span>
              </div>

              <div 
                className="absolute z-10 receipt-text text-[#A61D24] flex items-center justify-center"
                style={{ 
                  left: 'calc(3 / 175 * 100%)', 
                  top: 'calc(70 / 300 * 100%)', 
                  width: 'calc(12 / 175 * 100%)', 
                  height: 'calc(180 / 300 * 100%)',
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright'
                }}
              >
                <span className="font-bold text-[14px] md:text-[11px] tracking-[0.2em]">祈求平安順心萬事如意</span>
              </div>

              <div 
                className="absolute z-10 receipt-text text-stone-900"
                style={{ 
                  left: 'calc(90 / 175 * 100%)', 
                  top: 'calc(110 / 300 * 100%)', 
                  width: 'calc(35 / 175 * 100%)', 
                  height: 'auto',
                  maxHeight: 'calc(120 / 300 * 100%)', 
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright'
                }}
              >
                <span className="font-bold text-[#A61D24] text-[12px] md:text-[13px] tracking-[0.4em] inline-block" style={{ marginBottom: '16px' }}>大德</span>
                <span className="font-bold text-[11px] md:text-[12px] tracking-widest leading-snug">{selectedOrder.user_name}</span>
              </div>

              <div 
                className="absolute z-10 receipt-text text-stone-900"
                style={{ 
                  left: 'calc(90 / 175 * 100%)', 
                  top: 'calc(170 / 300 * 100%)', 
                  width: 'calc(35 / 175 * 100%)', 
                  height: 'auto',
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright'
                }}
              >
                <span className="font-bold text-[#A61D24] text-[12px] md:text-[13px] tracking-[0.4em] inline-block" style={{ marginBottom: '16px' }}>項目</span>
                <span className="font-bold text-[11px] md:text-[12px] tracking-widest leading-snug">{selectedOrder.service_type}</span>
              </div>

              <div 
                className="absolute z-10 receipt-text text-[#A61D24]"
                style={{ 
                  left: 'calc(75 / 175 * 100%)', 
                  top: 'calc(110 / 300 * 100%)', 
                  width: 'calc(35 / 175 * 100%)', 
                  height: 'auto',
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright'
                }}
              >
                <span className="font-bold text-[12px] md:text-[13px] tracking-[0.4em]">方案</span>
              </div>

              <div 
                className="absolute z-10 receipt-text text-stone-900"
                style={{ 
                  left: 'calc(40 / 175 * 100%)',
                  top: 'calc(128 / 300 * 100%)',
                  width: 'calc(70 / 175 * 100%)', 
                  height: 'auto',                               
                  maxHeight: 'calc(102 / 300 * 100%)',
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright'
                }}
              >
                <span className="font-bold text-[11px] md:text-[12px] leading-[2.5] tracking-widest whitespace-pre-wrap break-all">
                  {formatServiceDetails(selectedOrder.service_details)}
                </span>
              </div>

              <div 
                className="absolute z-10 receipt-text flex flex-col items-center justify-center text-center"
                style={{ 
                  left: 'calc(62.5 / 175 * 100%)', 
                  top: 'calc(240 / 300 * 100%)', 
                  width: 'calc(50 / 175 * 100%)', 
                  height: 'calc(10 / 300 * 100%)' 
                }}
              >
                <span className="text-[12px] md:text-[12px] font-bold text-[#D89F3C] tracking-[0.2em]">- 功德 圓滿 -</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
