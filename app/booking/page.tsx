"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // ✨ 引入 contacts 與 selfProfile 供名冊功能使用
  const { addToCart, updateSharedInfo, sharedInfo, contacts, selfProfile } = useCart();
  
  // ✨ 加入 targetName (問事對象)
  const [name, setName] = useState("");
  const [targetName, setTargetName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [question, setQuestion] = useState("");
  
  // ✨ 加入名冊選擇狀態
  const [selectedContactId, setSelectedContactId] = useState("self");
  const [saveToContacts, setSaveToContacts] = useState(true);
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  useEffect(() => {
    // 預設帶入本人聯絡資訊
    if (selfProfile && !name) {
      setName(selfProfile.userName); 
      setPhone(selfProfile.userPhone);
      if (selectedContactId === "self") {
        setBirthDate(selfProfile.birthDate); 
        setAddress(selfProfile.address);
      }
    }
  }, [selfProfile, name, selectedContactId]);

  // ✨ 智慧名冊切換邏輯
  const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedContactId(selectedId);

    if (selectedId === "new") {
      setTargetName(""); setBirthDate(""); setAddress(""); 
    } else if (selectedId === "self") {
      setTargetName(""); // 留白代表同聯絡人
      if (selfProfile) {
        setBirthDate(selfProfile.birthDate); setAddress(selfProfile.address);
      }
    } else {
      const contact = contacts.find(c => c.id === selectedId);
      if (contact) {
        setTargetName(contact.contact_name); // 將親友帶入問事對象
        setBirthDate(contact.birth_date); 
        setAddress(contact.address);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!session) return alert("請先使用 LINE 登入！");
    
    updateSharedInfo({ userName: name, userPhone: phone, birthDate: birthDate, address: address });
    const safeId = Date.now().toString() + Math.random().toString(36).substring(2);

    // ✨ 最終寫入購物車的大德名字：若有填問事對象就用對象，否則用聯絡人
    const finalTargetName = targetName || name;

    addToCart({
      id: safeId, 
      serviceType: "booking", 
      userName: finalTargetName, // 這會成為小票上的「大德」
      userPhone: phone,
      birthDate: birthDate, 
      address: address, 
      itemDetails: `濟事問事\n問事內容: ${question}`, // 這會成為小票上的「方案」
      price: 0
    }, saveToContacts);

    setQuestion(""); // 送出後清空問題
    setShowRedirectModal(true);
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0]"><div className="w-10 h-10 border-4 border-[#A61D24] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <main className="min-h-screen bg-[#FAF7F0] py-16 px-6 flex items-center justify-center selection:bg-[#A61D24] selection:text-white">
      <div className="max-w-3xl w-full bg-card rounded-[2rem] shadow-xl overflow-hidden border border-stone-100 relative">
        
        <div className="bg-[#1A432D] p-10 text-center relative border-b-[6px] border-[#D89F3C]">
          <h1 className="text-3xl font-bold tracking-[0.3em] text-white">預約濟事問事</h1>
          <p className="text-white/80 tracking-widest mt-3 text-sm font-medium">慈悲濟世，為信眾指引明路</p>
        </div>

        <div className="p-8 md:p-12">
          {!session ? (
            <div className="text-center space-y-8 py-8">
              <p className="text-muted-foreground tracking-widest text-sm leading-relaxed">為了保護您的隱私與加快未來填寫速度，<br/>請使用 LINE 快速登入系統。</p>
              <Button onClick={() => signIn("line")} className="bg-[#06C755] hover:bg-[#05a546] text-white tracking-widest font-bold shadow-lg rounded-full px-10 py-7 text-lg w-full md:w-auto">
                 使用 LINE 一鍵登入
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-700">
              
              {/* ✨ 升級的雙欄位與名冊選擇區 */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <h3 className="font-bold text-xl text-[#1A432D] tracking-widest border-l-4 border-[#A61D24] pl-3">問事資料填寫</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground tracking-widest">載入名冊：</span>
                    <select value={selectedContactId} onChange={handleContactChange} className="border border-stone-300 rounded-lg px-3 py-2 text-sm font-bold text-[#1A432D] outline-none focus:border-[#A61D24] bg-muted">
                      <option value="self">👑 本人預設資料</option>
                      <option value="new">➕ 手動輸入新對象</option>
                      {contacts.length > 0 && (
                        <optgroup label="已儲存親友">
                          {contacts.map(c => <option key={c.id} value={c.id}>{c.contact_name}</option>)}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">聯絡人姓名 <span className="text-red-500">*</span></label>
                    <input required value={name} onChange={e=>setName(e.target.value)} placeholder="請填寫聯絡人" className="w-full bg-muted border border-border p-4 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">問事對象 <span className="text-muted-foreground font-normal">(選填)</span></label>
                    <input value={targetName} onChange={e=>setTargetName(e.target.value)} placeholder="若同聯絡人請留白" className="w-full bg-muted border border-border p-4 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">聯絡電話 <span className="text-red-500">*</span></label>
                    <input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="09XX-XXX-XXX" className="w-full bg-muted border border-border p-4 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">生日生辰 <span className="text-red-500">*</span></label>
                    <input required value={birthDate} onChange={e=>setBirthDate(e.target.value)} placeholder="例：國曆 75年 8月 15日 吉時" className="w-full bg-muted border border-border p-4 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">居住地址 <span className="text-red-500">*</span></label>
                    <input required value={address} onChange={e=>setAddress(e.target.value)} placeholder="祈福用完整地址" className="w-full bg-muted border border-border p-4 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">問事內容概述 <span className="text-red-500">*</span></label>
                    <textarea required value={question} onChange={e=>setQuestion(e.target.value)} placeholder="請簡述您想請教帝君的問題（如事業、健康、運勢等）" className="w-full bg-muted border border-border p-4 rounded-xl h-32 resize-none focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium leading-relaxed"/>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer mt-2 w-max">
                  <input type="checkbox" checked={saveToContacts} onChange={e=>setSaveToContacts(e.target.checked)} className="w-4 h-4 accent-[#A61D24]"/>
                  <span className="text-sm font-bold text-stone-600 tracking-widest">同步儲存此對象至我的常用名冊</span>
                </label>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-[#1A432D] hover:bg-[#122F20] text-white py-7 rounded-xl text-lg tracking-[0.2em] font-bold shadow-lg transition-transform active:scale-95">
                  加入預約清單
                </Button>
              </div>
            </form>
          )}
        </div>

        {showRedirectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm transition-all">
            <div className="bg-[#FAF7F0] border-2 border-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl space-y-8 text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
              
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D89F3C] opacity-15 rounded-full blur-2xl pointer-events-none"></div>

              <div className="w-16 h-16 bg-card border border-[#D89F3C]/30 shadow-sm rounded-full flex items-center justify-center mx-auto text-[#D89F3C] relative z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>

              <div className="space-y-3 relative z-10">
                <h3 className="text-2xl font-bold text-[#1A432D] tracking-widest">已加入預約清單</h3>
                {/* ✨ 彈窗成功顯示問事對象 */}
                <p className="text-muted-foreground text-sm tracking-widest leading-relaxed">
                  您剛才為「<span className="text-[#1A432D] font-bold">{targetName || name}</span>」登記的項目已暫存。<br/>是否需要順道安排當月點燈或代燒服務？
                </p>
              </div>

              <div className="flex flex-col gap-3 relative z-10 pt-2">
                <button onClick={() => router.push("/lamps")} className="w-full flex items-center justify-center gap-2 bg-card hover:bg-muted border border-border hover:border-[#D89F3C] text-stone-600 hover:text-[#1A432D] py-4 rounded-xl font-bold tracking-widest shadow-sm transition-all">
                  <svg className="w-5 h-5 text-[#D89F3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  加購當月點燈
                </button>
                <button onClick={() => router.push("/burning")} className="w-full flex items-center justify-center gap-2 bg-card hover:bg-muted border border-border hover:border-[#D89F3C] text-stone-600 hover:text-[#1A432D] py-4 rounded-xl font-bold tracking-widest shadow-sm transition-all">
                  <svg className="w-5 h-5 text-[#D89F3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  加購代燒服務
                </button>
                <button onClick={() => router.push("/cart")} className="w-full bg-[#1A432D] hover:bg-[#122F20] text-white py-4 rounded-xl font-bold tracking-widest shadow-lg mt-2 transition-all">
                  前往預約清單送出 →
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}