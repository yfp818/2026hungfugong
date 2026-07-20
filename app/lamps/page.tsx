"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export default function LampsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // 🌟 從 CartContext 取得名冊與快取資料
  const { contacts, addToCart, updateSharedInfo, selfProfile } = useCart();
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✨ 核心修復：改回可複選的數量記錄器 (取代原本的單選 selectedProduct)
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({});

  // ✨ 進階表單狀態
  const [name, setName] = useState("");
  const [targetName, setTargetName] = useState(""); 
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [memo, setMemo] = useState(""); 
  
  const [selectedContactId, setSelectedContactId] = useState("self");
  const [saveToContacts, setSaveToContacts] = useState(true);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  // 💰 計算總金額
  const totalPrice = products.reduce((sum, p) => sum + (p.price * (itemQuantities[p.id] || 0)), 0);

  // 📝 組合已選項目字串
  const getSelectedItemsString = () => products
    .filter(p => (itemQuantities[p.id] || 0) > 0)
    .map(p => `${p.title} x${itemQuantities[p.id]} ($${p.price * itemQuantities[p.id]})`)
    .join("、");

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data } = await supabase
          .from("blessing_products")
          .select("*")
          .eq("category", "lamp")
          .order("created_at", { ascending: true });
        if (data) setProducts(data);
      } catch (err) {
        console.error("載入點燈項目失敗", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  // 🌟 預設帶入本人聯絡資訊 (僅執行一次)
  useEffect(() => {
    if (selfProfile && !hasAutoFilled) {
      setName(selfProfile.userName || ""); 
      setPhone(selfProfile.userPhone || "");
      if (selectedContactId === "self") {
        setBirthDate(selfProfile.birthDate || ""); 
        setAddress(selfProfile.address || "");
      }
      setHasAutoFilled(true);
    }
  }, [selfProfile, hasAutoFilled, selectedContactId]);

  // ✨ 智慧名冊切換邏輯
  const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedContactId(selectedId);

    if (selectedId === "new") {
      setTargetName(""); setBirthDate(""); setAddress(""); 
    } else if (selectedId === "self") {
      setTargetName("");
      if (selfProfile) {
        setBirthDate(selfProfile.birthDate || ""); 
        setAddress(selfProfile.address || "");
      }
    } else {
      const contact = safeContacts.find((c: any) => c.id.toString() === selectedId.toString());
      if (contact) {
        setTargetName(contact.contact_name || ""); 
        setBirthDate(contact.birth_date || ""); 
        setAddress(contact.address || "");
      }
    }
  };

  // ✨ 數量增減處理
  const handleQtyChange = (id: string, delta: number) => {
    setItemQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 防呆：確認是否有選購至少一項
    const hasSelected = Object.values(itemQuantities).some(qty => qty > 0);
    if (!hasSelected) return alert("請至少選購一盞點燈項目！");
    
    if (!name || !phone || !birthDate || !address) return alert("請填寫完整的祈福聯絡與生辰資料");

    if (typeof updateSharedInfo === "function") {
      updateSharedInfo({ userName: name, userPhone: phone, birthDate, address });
    }
    
    const safeId = Date.now().toString() + Math.random().toString(36).substring(2);
    const finalTargetName = targetName || name;
    
    // 組合最終明細
    const baseDetails = getSelectedItemsString();
    const finalDetails = memo ? `${baseDetails}、\n祈福心願: ${memo}` : baseDetails;

    if (typeof addToCart === "function") {
      await addToCart({
        id: safeId, 
        serviceType: "lamp", 
        userName: finalTargetName,
        userPhone: phone,
        birthDate: birthDate, 
        address: address, 
        itemDetails: finalDetails,
        price: totalPrice // 使用加總後的總額
      }, saveToContacts);
    }

    // 送出後清空數量與心願，方便幫下一位家人點燈
    setItemQuantities({});
    setMemo("");
    setShowRedirectModal(true);
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-10 h-10 border-4 border-[#A61D24] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4 md:px-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-[#A61D24] dark:text-red-400 tracking-widest">當月點燈祈福</h1>
          <p className="text-muted-foreground tracking-widest">祈求平安順心，照亮前程</p>
        </div>

        {!session ? (
          <div className="bg-card p-16 rounded-[2rem] text-center space-y-8 border border-border shadow-sm max-w-2xl mx-auto">
            <p className="text-muted-foreground tracking-widest font-medium leading-relaxed">為了確保您的點燈紀錄與常用名冊正確無誤，<br/>請先使用 LINE 進行驗證登入。</p>
            <Button onClick={() => signIn("line")} className="bg-[#06C755] hover:bg-[#05a546] text-white tracking-widest font-bold px-10 py-7 rounded-full shadow-xl text-lg">使用 LINE 快速登入</Button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12 text-muted-foreground font-bold tracking-widest">載入點燈項目中...</div>
        ) : (
          <form onSubmit={handleAddToCart} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 左側：燈種選擇 (佔 5 欄) ✨ 改回複選增減設計 */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-xl font-bold border-l-4 border-[#D89F3C] pl-3 text-foreground">選擇燈種</h3>
              <div className="grid grid-cols-1 gap-4">
                {products.map((p) => {
                  const qty = itemQuantities[p.id] || 0;
                  return (
                    <div 
                      key={p.id} 
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between bg-card ${qty > 0 ? 'border-[#A61D24] dark:border-red-400 bg-red-50 dark:bg-red-900/20 shadow-md' : 'border-border hover:border-[#D89F3C] shadow-sm'}`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-lg text-foreground">{p.title}</h4>
                        </div>
                        {p.description && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{p.description}</p>}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                        <span className="text-[#A61D24] dark:text-red-400 font-bold text-lg">${p.price}</span>
                        
                        {/* 數量增減控制器 */}
                        <div className="flex items-center gap-2 bg-muted rounded-full border border-border p-1 shadow-sm">
                          <button 
                            type="button" 
                            onClick={() => handleQtyChange(p.id, -1)}
                            disabled={qty === 0}
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-base transition-all ${qty > 0 ? 'bg-card text-stone-600 dark:text-stone-300 shadow-sm hover:text-[#A61D24] dark:hover:text-red-400' : 'text-stone-300 cursor-not-allowed'}`}
                          >
                            -
                          </button>
                          <span className="w-4 text-center font-bold text-foreground text-sm">{qty}</span>
                          <button 
                            type="button" 
                            onClick={() => handleQtyChange(p.id, 1)}
                            className="w-7 h-7 rounded-full bg-card shadow-sm flex items-center justify-center text-stone-600 dark:text-stone-300 font-bold text-base hover:text-[#A61D24] dark:hover:text-red-400 transition-all"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 右側：祈福人資料與名冊 (佔 7 欄) */}
            <div className="lg:col-span-7 bg-card p-6 md:p-8 rounded-[2rem] border border-border shadow-sm space-y-6 h-fit sticky top-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <h3 className="text-xl font-bold border-l-4 border-[#1A432D] dark:border-emerald-500 pl-3 text-[#1A432D] dark:text-emerald-400">點燈資料填寫</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground tracking-widest">載入名冊：</span>
                  <select value={selectedContactId} onChange={handleContactChange} className="border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-sm font-bold text-[#1A432D] dark:text-emerald-400 outline-none focus:border-[#A61D24] bg-muted">
                    <option value="self">👑 本人預設資料</option>
                    <option value="new">➕ 手動輸入新對象</option>
                    {safeContacts.length > 0 && (
                      <optgroup label="已儲存親友">
                        {safeContacts.map((c: any) => <option key={c.id} value={c.id}>{c.contact_name}</option>)}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">聯絡人姓名</label>
                  <input required value={name} onChange={e=>setName(e.target.value)} placeholder="請填寫聯絡人" className="w-full bg-background border-2 border-border p-3.5 rounded-xl outline-none focus:border-[#A61D24] focus:ring-4 focus:ring-[#A61D24]/10 font-bold text-foreground placeholder:text-stone-400 placeholder:font-medium transition-all"/>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">祈福對象 <span className="text-muted-foreground font-normal">(選填)</span></label>
                  <input value={targetName} onChange={e=>setTargetName(e.target.value)} placeholder="若同聯絡人請留白" className="w-full bg-background border-2 border-border p-3.5 rounded-xl outline-none focus:border-[#A61D24] focus:ring-4 focus:ring-[#A61D24]/10 font-bold text-foreground placeholder:text-stone-400 placeholder:font-medium transition-all"/>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">聯絡電話</label>
                  <input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="請輸入電話" className="w-full bg-background border-2 border-border p-3.5 rounded-xl outline-none focus:border-[#A61D24] focus:ring-4 focus:ring-[#A61D24]/10 font-bold text-foreground placeholder:text-stone-400 placeholder:font-medium transition-all"/>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">出生年月日</label>
                  <input required value={birthDate} onChange={e=>setBirthDate(e.target.value)} placeholder="例：1990/01/01" className="w-full bg-background border-2 border-border p-3.5 rounded-xl outline-none focus:border-[#A61D24] focus:ring-4 focus:ring-[#A61D24]/10 font-bold text-foreground placeholder:text-stone-400 placeholder:font-medium transition-all"/>
                </div>
                
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">居住地址</label>
                  <input required value={address} onChange={e=>setAddress(e.target.value)} placeholder="請輸入完整地址" className="w-full bg-background border-2 border-border p-3.5 rounded-xl outline-none focus:border-[#A61D24] focus:ring-4 focus:ring-[#A61D24]/10 font-bold text-foreground placeholder:text-stone-400 placeholder:font-medium transition-all"/>
                </div>
                
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">祈福心願 / 備註留言 <span className="text-muted-foreground font-normal">(選填)</span></label>
                  <textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder="例如：祈求玉帝保佑家人平安健康" rows={2} className="w-full bg-background border-2 border-border p-3.5 rounded-xl outline-none focus:border-[#A61D24] focus:ring-4 focus:ring-[#A61D24]/10 font-bold text-foreground placeholder:text-stone-400 placeholder:font-medium transition-all resize-none"></textarea>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer w-max">
                <input type="checkbox" checked={saveToContacts} onChange={e=>setSaveToContacts(e.target.checked)} className="w-4 h-4 accent-[#A61D24]"/>
                <span className="text-sm font-bold text-muted-foreground tracking-widest">同步儲存此對象至我的常用名冊</span>
              </label>

              {/* ✨ 動態顯示小計與送出按鈕 */}
              <div className="bg-muted border border-border p-5 md:p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-5 mt-4">
                <div>
                  <span className="text-sm text-muted-foreground font-bold tracking-widest">本次點燈小計</span>
                  <p className="text-3xl font-bold text-[#A61D24] mt-1">${totalPrice}</p>
                </div>
                <Button type="submit" className="w-full sm:w-auto bg-[#1A432D] hover:bg-[#122F20] dark:bg-emerald-800 dark:hover:bg-emerald-900 text-white py-7 px-8 rounded-xl font-bold tracking-widest shadow-lg text-lg transition-transform hover:scale-[1.01]">
                  加入點燈清單
                </Button>
              </div>
            </div>

          </form>
        )}

        {/* ✨ 成功導航彈窗 */}
        {showRedirectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm transition-all">
            <div className="bg-background border-2 border-white/20 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl space-y-8 text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D89F3C] opacity-15 rounded-full blur-2xl pointer-events-none"></div>
              <div className="w-16 h-16 bg-card border border-[#D89F3C]/30 shadow-sm rounded-full flex items-center justify-center mx-auto text-[#D89F3C] relative z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="space-y-3 relative z-10">
                <h3 className="text-2xl font-bold text-[#1A432D] dark:text-emerald-400 tracking-widest">已加入點燈清單</h3>
                <p className="text-muted-foreground text-sm tracking-widest leading-relaxed">您剛才為「<span className="text-foreground font-bold">{targetName || name}</span>」登記的點燈項目已暫存。<br/>請問接下來的動作？</p>
              </div>
              <div className="flex flex-col gap-3 relative z-10 pt-2">
                <button onClick={() => router.push("/burning")} className="w-full flex items-center justify-center gap-2 bg-card hover:bg-muted border border-border hover:border-[#D89F3C] text-foreground py-4 rounded-xl font-bold tracking-widest shadow-sm transition-all">
                  <svg className="w-5 h-5 text-[#D89F3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>加購代燒服務
                </button>
                <button onClick={() => { setShowRedirectModal(false); setSelectedContactId("new"); setTargetName(""); setBirthDate(""); setAddress(""); setMemo(""); setItemQuantities({}); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full flex items-center justify-center gap-2 bg-card hover:bg-muted border border-border hover:border-[#D89F3C] text-foreground py-4 rounded-xl font-bold tracking-widest shadow-sm transition-all">
                  <svg className="w-5 h-5 text-[#D89F3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>繼續為下一位點燈
                </button>
                <button onClick={() => router.push("/cart")} className="w-full bg-[#1A432D] hover:bg-[#122F20] dark:bg-emerald-800 dark:hover:bg-emerald-900 text-white py-4 rounded-xl font-bold tracking-widest shadow-lg mt-2 transition-all">
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