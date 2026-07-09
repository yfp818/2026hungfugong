"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, History, Wallet, UserCircle, MapPin, Phone, Edit3, X, FileText, Camera, Info } from "lucide-react"; 

export default function MemberCenter() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState({ phone: "", address: "" });

  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    async function fetchMemberData() {
      if (session?.user?.email) {
        const { data: userProfile } = await supabase
          .from("user_contacts")
          .select("*")
          .eq("line_id", session.user.email)
          .single();

        if (userProfile) {
          setProfile({ phone: userProfile.phone || "", address: userProfile.address || "" });
        }

        const { data: historyOrders } = await supabase
          .from("service_orders")
          .select("*")
          .eq("user_line_id", session.user.email)
          .order("created_at", { ascending: false });

        if (historyOrders) setOrders(historyOrders);
      }
      setLoadingOrders(false);
    }
    fetchMemberData();
  }, [session]);

  const handleSaveProfile = async () => {
    if (session?.user?.email) {
      await supabase.from("user_contacts").upsert({
        line_id: session.user.email,
        line_name: session.user.name,
        phone: profile.phone,
        address: profile.address,
      });
      alert("資料已更新！這將幫助您未來填寫表單時更加快速。");
      setIsEditingProfile(false);
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
    return <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center font-bold tracking-widest text-[#1A432D]">驗證信眾身分中...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center p-6 text-center">
        <UserCircle className="w-24 h-24 text-stone-300 mb-6" />
        <h1 className="text-3xl font-bold text-slate-800 tracking-widest mb-4">請先登入信眾帳號</h1>
        <p className="text-stone-500 mb-8 tracking-widest leading-relaxed max-w-md">登入後即可查看您的專屬祈福紀錄與本宮代辦進度，並管理您的聯絡資訊。</p>
        <Link href="/"><Button className="bg-[#1A432D] hover:bg-[#122F20] text-white px-8 py-6 rounded-full font-bold tracking-widest shadow-lg">返回首頁</Button></Link>
      </div>
    );
  }

  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const pendingOrders = orders.filter((o) => o.status !== "completed").length;

  return (
    <div className="min-h-screen bg-[#FAF7F0] pb-32">
      <div className="bg-[#1A432D] pt-24 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center text-white">
          <h1 className="text-4xl font-bold tracking-[0.3em] mb-4">信眾服務中心</h1>
          <p className="text-white/70 tracking-widest text-sm">慈悲喜捨，常保安康</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-20 space-y-8">
        
        <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-5">
            {session?.user?.image ? (
              <img src={session.user.image} alt="avatar" className="w-16 h-16 rounded-full border-2 border-stone-100 shadow-sm object-cover" />
            ) : (
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 border-2 border-stone-200 shadow-sm"><UserCircle size={32} /></div>
            )}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-stone-800 tracking-wider">{session?.user?.name}</h2>
              <p className="text-xs text-stone-400 tracking-widest">已完成 LINE 信眾身分認證</p>
            </div>
          </div>
          <button onClick={() => signOut()} className="text-sm font-bold text-stone-400 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50">登出</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2"><History size={20} /></div>
            <p className="text-3xl font-bold text-slate-800">{completedOrders}</p>
            <p className="text-xs font-bold tracking-widest text-stone-500">已圓滿服務</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2"><Wallet size={20} /></div>
            <p className="text-3xl font-bold text-slate-800">{pendingOrders}</p>
            <p className="text-xs font-bold tracking-widest text-stone-500">待對帳處理</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-stone-200/60 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-stone-100 pb-4">
             <h3 className="text-lg font-bold text-slate-800 tracking-widest flex items-center gap-2">
               <Edit3 className="text-[#D89F3C]" size={20}/> 快速填表聯絡資訊
             </h3>
             <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
               {isEditingProfile ? "取消編輯" : "編輯資料"}
             </button>
          </div>
          
          {isEditingProfile ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
               <div><label className="block text-xs font-bold text-stone-500 mb-2">聯絡電話</label><input value={profile.phone} onChange={e=>setProfile({...profile, phone: e.target.value})} className="w-full border border-stone-200 p-3 rounded-xl outline-none focus:border-[#1A432D]"/></div>
               <div><label className="block text-xs font-bold text-stone-500 mb-2">通訊地址</label><input value={profile.address} onChange={e=>setProfile({...profile, address: e.target.value})} className="w-full border border-stone-200 p-3 rounded-xl outline-none focus:border-[#1A432D]"/></div>
               <Button onClick={handleSaveProfile} className="w-full bg-[#1A432D] hover:bg-[#122F20] text-white py-6 rounded-xl font-bold tracking-widest mt-2">儲存變更</Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center shrink-0"><Phone size={16} className="text-stone-400"/></div>
                 <div><p className="text-xs font-bold text-stone-400 tracking-widest mb-1">聯絡電話</p><p className="font-medium text-stone-800">{profile.phone || "尚未設定"}</p></div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center shrink-0"><MapPin size={16} className="text-stone-400"/></div>
                 <div><p className="text-xs font-bold text-stone-400 tracking-widest mb-1">通訊地址</p><p className="font-medium text-stone-800 leading-relaxed">{profile.address || "尚未設定"}</p></div>
              </div>
              <p className="text-[10px] text-stone-400 tracking-widest pt-2 flex items-center gap-1.5">
                <Info size={12} className="shrink-0" />
                設定後，未來報名各項服務將會自動帶入，節省您的時間。
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-8 border border-stone-200/60 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 tracking-widest flex items-center gap-2 border-b border-stone-100 pb-4">
            <Calendar className="text-[#A61D24]" size={20}/> 祈福與服務紀錄
          </h3>
          
          {loadingOrders ? (
            <div className="text-center py-10 text-stone-400 font-bold tracking-widest">載入中...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400 font-bold tracking-widest">
              目前尚無紀錄
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-5 border border-stone-100 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition-shadow group">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-full tracking-widest bg-stone-100 text-stone-600">{order.service_type}</span>
                      <span className="text-xs font-medium text-stone-400">{new Date(order.created_at).toLocaleDateString('zh-TW')}</span>
                    </div>
                    <p className="font-bold text-stone-800 line-clamp-2 text-sm md:text-base">
                      {formatServiceDetails(order.service_details)}
                    </p>
                    {order.bank_last_5 && <p className="text-xs font-bold text-stone-500 tracking-widest">匯款末五碼：<span className="text-[#A61D24]">{order.bank_last_5}</span></p>}
                  </div>
                  <div className="flex justify-between md:flex-col items-center md:items-end gap-2 shrink-0 border-t md:border-t-0 border-stone-100 pt-3 md:pt-0">
                     <span className="font-bold text-lg text-slate-800">${order.total_price}</span>
                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => setSelectedOrder(order)}
                         className="text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors shadow-sm flex items-center gap-1.5 hover:scale-105"
                       >
                         <FileText size={12} /> 祈福印記
                       </button>
                       <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-stone-100 text-stone-500 border border-stone-200'}`}>
                         {order.status === 'completed' ? '已處理圓滿' : '等待對帳中'}
                       </span>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
              className="absolute -top-12 right-0 text-white hover:text-[#D89F3C] transition-colors bg-white/20 p-2 rounded-full backdrop-blur-md"
            >
              <X size={20} />
            </button>

            <style>{`#global-cart-btn { display: none !important; }`}</style>

            <div className="bg-[#1A432D]/90 text-[#D89F3C] border border-[#D89F3C]/50 text-xs font-bold py-2.5 px-4 rounded-xl mb-4 flex items-center justify-center gap-2 shadow-lg w-full max-w-[280px]">
               <Camera size={14} className="shrink-0" />
               <span className="tracking-widest">貼心小提示：可截圖保存此祈福印記</span>
            </div>

            {/* 💡 乾淨的單一排版區塊 */}
            <div className="relative w-full max-w-[360px] drop-shadow-2xl mx-auto overflow-hidden rounded-xl">
              
              <img 
                src="https://oyoopxulmfihblgaptva.supabase.co/storage/v1/object/public/images/IMG_5311.PNG" 
                alt="祈福印記" 
                className="w-full h-auto block pointer-events-none select-none" 
              />

              <style>{`
                .receipt-safe-zone, .receipt-safe-zone * {
                  font-family: var(--font-noto-serif), "Noto Serif TC", serif !important;
                }
              `}</style>

              <div 
                className="absolute flex flex-col receipt-safe-zone text-stone-900"
                style={{ top: '29%', bottom: '17%', left: '16%', right: '16%' }}
              >
                
                <div className="text-center shrink-0 mb-3">
                   <h2 className="text-[17px] md:text-[19px] font-bold text-[#A61D24] tracking-[0.2em] mb-0.5">祈福印記</h2>
                   <p className="text-[#D89F3C] text-[10px] md:text-[11px] tracking-widest font-bold">- 大德護持 善神擁護 -</p>
                </div>

                {/* ✨ 取消外層的 flex items-center */}
                <div className="w-full text-[11px] md:text-[12px] flex-1 overflow-y-auto scrollbar-hide">
                    
                    {/* 💡 終極對齊鐵框：用 w-[220px] mx-auto 取代 w-fit */}
                    <div className="pb-1 w-[220px] mx-auto">
                      
                      <div className="flex gap-3 items-start mb-2">
                        <span className="font-bold text-[#A61D24] tracking-widest shrink-0 w-[36px] text-justify" style={{ textAlignLast: 'justify' }}>大德</span>
                        {/* 💡 加上 flex-1 與 text-left，讓文字靠左對齊，撞到邊界自動完美換行 */}
                        <span className="font-bold leading-snug flex-1 text-left">{selectedOrder.user_name}</span>
                      </div>
                      
                      <div className="flex gap-3 items-start mb-2">
                        <span className="font-bold text-[#A61D24] tracking-widest shrink-0 w-[36px] text-justify" style={{ textAlignLast: 'justify' }}>項目</span>
                        <span className="font-bold leading-snug flex-1 text-left">{selectedOrder.service_type}</span>
                      </div>
                      
                      <div className="flex gap-3 items-start mb-2">
                        <span className="font-bold text-[#A61D24] tracking-widest shrink-0 w-[36px] text-justify" style={{ textAlignLast: 'justify' }}>方案</span>
                        <span className="font-bold leading-snug flex-1 text-left break-words whitespace-pre-wrap">
                          {formatServiceDetails(selectedOrder.service_details)}
                        </span>
                      </div>
                      
                    </div>
                </div>

                <div className="shrink-0 text-center flex flex-col items-center justify-center pt-2 mt-auto border-t border-stone-200/30">
                  <span className="text-[10px] md:text-[11px] font-bold text-stone-700 tracking-widest leading-none mb-1.5 mt-1.5">
                    登記吉日 {new Date(selectedOrder.created_at).toLocaleDateString('zh-TW')}
                  </span>
                  <span className="text-[8px] md:text-[9px] font-bold text-stone-500 tracking-widest leading-none mb-2">
                    祈求 平安順心 萬事如意
                  </span>
                  <span className="text-[11px] md:text-[12px] font-bold text-[#D89F3C] tracking-[0.2em] leading-none">
                    - 功德 圓滿 -
                  </span>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}