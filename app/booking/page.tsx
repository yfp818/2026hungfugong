"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToCart, updateSharedInfo, sharedInfo } = useCart();
  
  const [name, setName] = useState(sharedInfo.userName || "");
  const [phone, setPhone] = useState(sharedInfo.userPhone || "");
  const [birthDate, setBirthDate] = useState(sharedInfo.birthDate || "");
  const [address, setAddress] = useState(sharedInfo.address || "");
  const [question, setQuestion] = useState("");
  
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!session) return alert("請先使用 LINE 登入！");
    
    updateSharedInfo({ userName: name, userPhone: phone, birthDate: birthDate, address: address });
    const safeId = Date.now().toString() + Math.random().toString(36).substring(2);

    addToCart({
      id: safeId, serviceType: "booking", userName: name, userPhone: phone,
      birthDate: birthDate, address: address, itemDetails: `濟事問事：${question}`, price: 0
    });

    setShowRedirectModal(true);
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0]"><div className="w-10 h-10 border-4 border-[#A61D24] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <main className="min-h-screen bg-[#FAF7F0] py-16 px-6 flex items-center justify-center selection:bg-[#A61D24] selection:text-white">
      <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-xl overflow-hidden border border-stone-100 relative">
        
        <div className="bg-[#1A432D] p-10 text-center relative border-b-[6px] border-[#D89F3C]">
          <h1 className="text-3xl font-bold tracking-[0.3em] text-white">預約濟事問事</h1>
          <p className="text-white/80 tracking-widest mt-3 text-sm font-medium">慈悲濟世，為信眾指引明路</p>
        </div>

        <div className="p-8 md:p-12">
          {!session ? (
            <div className="text-center space-y-8 py-8">
              <p className="text-stone-500 tracking-widest text-sm leading-relaxed">為了保護您的隱私與加快未來填寫速度，<br/>請使用 LINE 快速登入系統。</p>
              <Button onClick={() => signIn("line")} className="bg-[#06C755] hover:bg-[#05a546] text-white tracking-widest font-bold shadow-lg rounded-full px-10 py-7 text-lg w-full md:w-auto">
                 使用 LINE 一鍵登入
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-3">
                   <label className="text-xs font-bold text-stone-500 tracking-widest">信眾姓名 <span className="text-red-500">*</span></label>
                   <input required value={name} onChange={e=>setName(e.target.value)} className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
                 </div>
                 <div className="space-y-3">
                   <label className="text-xs font-bold text-stone-500 tracking-widest">聯絡電話 <span className="text-red-500">*</span></label>
                   <input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="09XX-XXX-XXX" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
                 </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-500 tracking-widest">生日生辰 <span className="text-red-500">*</span></label>
                <input required value={birthDate} onChange={e=>setBirthDate(e.target.value)} placeholder="例：國曆 75年 8月 15日 吉時" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-500 tracking-widest">居住地址 <span className="text-red-500">*</span></label>
                <input required value={address} onChange={e=>setAddress(e.target.value)} placeholder="祈福用完整地址" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
              </div>

              <div className="space-y-3 pb-2">
                <label className="text-xs font-bold text-stone-500 tracking-widest">問事內容概述 <span className="text-red-500">*</span></label>
                <textarea required value={question} onChange={e=>setQuestion(e.target.value)} placeholder="請簡述您想請教帝君的問題（如事業、健康、運勢等）" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl h-32 resize-none focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium leading-relaxed"/>
              </div>

              <Button type="submit" className="w-full bg-[#1A432D] hover:bg-[#122F20] text-white py-7 rounded-xl text-lg tracking-[0.2em] font-bold shadow-lg transition-transform active:scale-95">
                加入預約清單
              </Button>
            </form>
          )}
        </div>

        {/* 🌟 重新設計的高質感引導彈窗 */}
        {showRedirectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm transition-all">
            <div className="bg-[#FAF7F0] border-2 border-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl space-y-8 text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
              
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D89F3C] opacity-15 rounded-full blur-2xl pointer-events-none"></div>

              <div className="w-16 h-16 bg-white border border-[#D89F3C]/30 shadow-sm rounded-full flex items-center justify-center mx-auto text-[#D89F3C] relative z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>

              <div className="space-y-3 relative z-10">
                <h3 className="text-2xl font-bold text-[#1A432D] tracking-widest">已加入預約清單</h3>
                <p className="text-stone-500 text-sm tracking-widest leading-relaxed">
                  是否需要順道為自己或家人安排當月點燈祈福或代燒服務？<br/>(可合併結帳對帳)
                </p>
              </div>

              <div className="flex flex-col gap-3 relative z-10 pt-2">
                <button onClick={() => router.push("/lamps")} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#D89F3C] text-stone-600 hover:text-[#1A432D] py-4 rounded-xl font-bold tracking-widest shadow-sm transition-all">
                  <svg className="w-5 h-5 text-[#D89F3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  加購當月點燈
                </button>
                <button onClick={() => router.push("/burning")} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#D89F3C] text-stone-600 hover:text-[#1A432D] py-4 rounded-xl font-bold tracking-widest shadow-sm transition-all">
                  <svg className="w-5 h-5 text-[#D89F3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  加購代燒服務
                </button>
                <button onClick={() => router.push("/cart")} className="w-full bg-[#1A432D] hover:bg-[#122F20] text-white py-4 rounded-xl font-bold tracking-widest shadow-lg mt-2 transition-all">
                  前往結帳對帳 →
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}