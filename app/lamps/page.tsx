"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export default function LampsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const { contacts, addToCart, updateSharedInfo, sharedInfo, selfProfile } = useCart();
  
  const [products, setProducts] = useState<any[]>([]);
  
  // 🌟 核心升級：將選取狀態改為「紀錄數量」的物件
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({});
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  
  const [selectedContactId, setSelectedContactId] = useState("self");
  const [saveToContacts, setSaveToContacts] = useState(true);
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  // 🌟 核心升級：總金額動態乘上數量
  const totalPrice = products.reduce((sum, p) => sum + (p.price * (itemQuantities[p.id] || 0)), 0);
  
  // 🌟 核心升級：明細字串自動加上「x數量」與小計
  const getSelectedItemsString = () => products
    .filter(p => (itemQuantities[p.id] || 0) > 0)
    .map(p => `${p.title} x${itemQuantities[p.id]} ($${p.price * itemQuantities[p.id]})`)
    .join("、");

  useEffect(() => {
    async function loadData() {
      const { data: prods } = await supabase.from("blessing_products").select("*").eq("category", "lamp");
      if (prods) setProducts(prods);
    }
    loadData();
  }, [session]);

  useEffect(() => {
    if (selfProfile && !name && selectedContactId === "self") {
      setName(selfProfile.userName); setPhone(selfProfile.userPhone);
      setBirthDate(selfProfile.birthDate); setAddress(selfProfile.address);
    }
  }, [selfProfile]);

  // 🌟 處理數量增減的邏輯
  const handleQtyChange = (id: string, delta: number) => {
    setItemQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta); // 防止數量變成負數
      return { ...prev, [id]: next };
    });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedContactId(selectedId);

    if (selectedId === "new") {
      setName(""); setBirthDate(""); setAddress(""); setPhone(selfProfile?.userPhone || "");
    } else if (selectedId === "self") {
      if (selfProfile) {
        setName(selfProfile.userName); setPhone(selfProfile.userPhone);
        setBirthDate(selfProfile.birthDate); setAddress(selfProfile.address);
      }
    } else {
      const contact = contacts.find(c => c.id === selectedId);
      if (contact) {
        setName(contact.contact_name); setPhone(contact.contact_phone || selfProfile?.userPhone || "");
        setBirthDate(contact.birth_date); setAddress(contact.address);
      }
    }
  };

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPrice === 0) return alert("請至少選購一盞祈福燈。");

    updateSharedInfo({ userName: name, userPhone: phone, birthDate, address });
    const safeId = Date.now().toString() + Math.random().toString(36).substring(2);

    await addToCart({
      id: safeId, serviceType: "lamp", userName: name, userPhone: phone,
      birthDate: birthDate, address: address, itemDetails: getSelectedItemsString(), price: totalPrice
    }, saveToContacts);

    setItemQuantities({}); // 加入清單後清空數量
    setShowRedirectModal(true);
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0]"><div className="w-10 h-10 border-4 border-[#A61D24] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <main className="min-h-screen bg-[#FAF7F0] py-12 px-6 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-xl border border-stone-100 overflow-hidden relative">
        <div className="bg-[#1A432D] p-10 text-center border-b-[6px] border-[#D89F3C]">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-widest drop-shadow-md">皇府宮線上祈福</h1>
          <p className="text-white/80 text-sm font-medium tracking-widest mt-3">當月點燈 照慧平安</p>
        </div>

        {!session ? (
          <div className="p-16 text-center space-y-6">
            <p className="text-stone-500 tracking-widest font-medium leading-relaxed">為確保報名資料正確無誤，<br/>請先使用 LINE 進行驗證登入。</p>
            <Button onClick={() => signIn("line")} className="bg-[#06C755] hover:bg-[#05a546] text-white tracking-widest font-bold px-10 py-7 rounded-full shadow-lg text-lg">使用 LINE 快速登入</Button>
          </div>
        ) : (
          <div className="p-8 md:p-12">
            <form onSubmit={handleAddToCart} className="space-y-12 animate-in fade-in duration-500">
              <div className="space-y-6">
                <h3 className="font-bold text-xl text-[#1A432D] tracking-widest border-l-4 border-[#D89F3C] pl-3">選擇祈福燈種</h3>
                {products.length === 0 ? (
                   <p className="text-stone-400 tracking-widest text-sm p-4 bg-stone-50 rounded-xl">目前尚無點燈品項。</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {products.map(p => {
                      const qty = itemQuantities[p.id] || 0;
                      return (
                        <div key={p.id} className={`border-2 rounded-2xl p-6 transition-all flex flex-col justify-between relative group ${qty > 0 ? 'border-[#A61D24] shadow-md bg-white' : 'border-stone-100 bg-white hover:border-stone-300'}`}>
                          {p.image_url && (
                            <div className="w-full h-40 rounded-xl overflow-hidden mb-5 bg-stone-50">
                              <img src={p.image_url} alt={p.title} className={`w-full h-full object-cover transition-transform duration-700 ${qty > 0 ? 'scale-110' : 'group-hover:scale-105'}`}/>
                            </div>
                          )}
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-xl text-stone-800 tracking-wider">{p.title}</h3>
                            </div>
                            <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">{p.description}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-5 pt-4 border-t border-stone-100">
                            <p className="text-[#A61D24] font-bold tracking-wider text-xl">${p.price}</p>
                            
                            {/* 🌟 膠囊型數量控制器 */}
                            <div className="flex items-center gap-3 bg-stone-50 rounded-full border border-stone-200 p-1 shadow-sm">
                              <button 
                                type="button" 
                                onClick={() => handleQtyChange(p.id, -1)}
                                disabled={qty === 0}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-all ${qty > 0 ? 'bg-white text-stone-600 shadow-sm hover:text-[#A61D24]' : 'text-stone-300 cursor-not-allowed'}`}
                              >
                                -
                              </button>
                              <span className="w-4 text-center font-bold text-stone-700">{qty}</span>
                              <button 
                                type="button" 
                                onClick={() => handleQtyChange(p.id, 1)}
                                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-600 font-bold text-lg hover:text-[#A61D24] transition-all"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-6 border-t border-stone-200/60 pt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="font-bold text-stone-800 tracking-widest border-l-4 border-[#A61D24] pl-3 text-xl">祈福對象資料</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-stone-500 tracking-widest">載入名冊：</span>
                    <select value={selectedContactId} onChange={handleContactChange} className="border border-stone-300 rounded-lg px-3 py-2 text-sm font-bold text-[#1A432D] outline-none focus:border-[#A61D24] bg-stone-50">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input required value={name} onChange={e=>setName(e.target.value)} placeholder="信眾姓名" className="bg-stone-50 border border-stone-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#A61D24] transition-all font-medium"/>
                  <input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="聯絡電話" className="bg-stone-50 border border-stone-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#A61D24] transition-all font-medium"/>
                </div>
                <input required value={birthDate} onChange={e=>setBirthDate(e.target.value)} placeholder="農曆出生年月日 (例: 農曆 78 年 5 月 20 日 吉時)" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#A61D24] transition-all font-medium"/>
                <input required value={address} onChange={e=>setAddress(e.target.value)} placeholder="居住完整地址" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#A61D24] transition-all font-medium"/>
                
                <label className="flex items-center gap-3 cursor-pointer mt-2 w-max">
                  <input type="checkbox" checked={saveToContacts} onChange={e=>setSaveToContacts(e.target.checked)} className="w-4 h-4 accent-[#A61D24]"/>
                  <span className="text-sm font-bold text-stone-600 tracking-widest">同步儲存此對象至我的常用名冊</span>
                </label>
              </div>

              <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                  <span className="text-sm text-stone-500 font-bold tracking-widest">本次選購小計</span>
                  <p className="text-3xl font-bold text-[#A61D24] mt-1">${totalPrice}</p>
                </div>
                <Button type="submit" className="w-full sm:w-auto bg-[#1A432D] hover:bg-[#122F20] text-white font-bold px-10 py-7 rounded-xl shadow-lg text-lg tracking-widest transition-transform active:scale-95">
                  加入祈福清單
                </Button>
              </div>
            </form>
          </div>
        )}

        {showRedirectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm transition-all">
            <div className="bg-[#FAF7F0] border-2 border-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl space-y-8 text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D89F3C] opacity-15 rounded-full blur-2xl pointer-events-none"></div>
              <div className="w-16 h-16 bg-white border border-[#D89F3C]/30 shadow-sm rounded-full flex items-center justify-center mx-auto text-[#D89F3C] relative z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="space-y-3 relative z-10">
                <h3 className="text-2xl font-bold text-[#1A432D] tracking-widest">已加入祈福清單</h3>
                <p className="text-stone-500 text-sm tracking-widest leading-relaxed">您剛才為「<span className="text-[#1A432D] font-bold">{name}</span>」登記的項目已暫存。<br/>請問接下來的動作？</p>
              </div>
              <div className="flex flex-col gap-3 relative z-10 pt-2">
                <button onClick={() => router.push("/burning")} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#D89F3C] text-stone-600 hover:text-[#1A432D] py-4 rounded-xl font-bold tracking-widest shadow-sm transition-all">
                  <svg className="w-5 h-5 text-[#D89F3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>加購代燒服務
                </button>
                <button onClick={() => { setShowRedirectModal(false); setSelectedContactId("new"); setName(""); setBirthDate(""); setAddress(""); setPhone(selfProfile?.userPhone || ""); }} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#D89F3C] text-stone-600 hover:text-[#1A432D] py-4 rounded-xl font-bold tracking-widest shadow-sm transition-all">
                  <svg className="w-5 h-5 text-[#D89F3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>繼續為下一位點燈
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