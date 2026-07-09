"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalCartPage() {
  const { data: session } = useSession();
  const { cartItems, removeFromCart, clearCart } = useCart();
  
  const [step, setStep] = useState(1);
  const [bankLast5, setBankLast5] = useState("");
  
  const [lineUrl, setLineUrl] = useState("https://lin.ee/uHaPx59");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    async function loadBankInfo() {
      const { data } = await supabase.from("site_content").select("content").eq("id", "site_footer").single();
      if (data?.content) {
        try {
          const parsed = JSON.parse(data.content);
          if (parsed.lineUrl) setLineUrl(parsed.lineUrl);
          if (parsed.bankName) setBankName(parsed.bankName);
          if (parsed.bankAccount) setBankAccount(parsed.bankAccount);
        } catch (e) {}
      }
    }
    loadBankInfo();
  }, []);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return alert("購物車目前無任何項目。");
    if (bankLast5.length !== 5) return alert("請正確填寫轉帳帳號後五碼。");

    const itemsToInsert = cartItems.map(item => ({
      user_line_id: session?.user?.email || session?.user?.name || "line_user",
      service_type: item.serviceType === "booking" ? "濟事問事" : item.serviceType === "lamp" ? "當月點燈" : "代燒服務",
      user_name: item.userName,
      user_phone: item.userPhone || "",
      birth_date: item.birthDate,
      address: item.address,
      service_details: item.itemDetails,
      total_price: item.price,
      bank_last_5: bankLast5,
      status: "pending"
    }));

    const { error } = await supabase.from("service_orders").insert(itemsToInsert);

    if (error) {
      alert("明細寫入失敗，請洽客服：" + error.message);
    } else {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const copyToClipboardFallback = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; textArea.style.left = "-999999px"; textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus(); textArea.select();
    try { document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(textArea);
  };

  const handleCopyReceipt = () => {
    const itemsDetailsString = cartItems.map(item => `-[${item.userName}] ${item.itemDetails}`).join("\n");
    const text = `【皇府宮 - 祈福合併對帳單】\n${itemsDetailsString}\n\n功德總計金額：$${totalCartPrice}\n核銷轉帳後五碼：${bankLast5}\n\n*已完成線上合併登記，請管理員核對*`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => window.open(lineUrl, "_blank")).catch(() => { copyToClipboardFallback(text); window.open(lineUrl, "_blank"); });
    } else {
      copyToClipboardFallback(text); window.open(lineUrl, "_blank");
    }
    clearCart(); 
  };

  return (
    <main className="min-h-screen bg-[#FAF7F0] py-16 px-4 md:px-6 flex flex-col items-center justify-center">
      
      {step === 1 && (
        <div className="max-w-3xl w-full bg-white rounded-[2rem] shadow-xl border border-stone-200/60 overflow-hidden">
          <div className="bg-[#1A432D] p-10 text-center border-b-[6px] border-[#D89F3C]">
            <h1 className="text-3xl font-bold text-white tracking-[0.2em] drop-shadow-md">祈福清單合併結帳</h1>
            <p className="text-white/70 text-xs tracking-widest mt-2">集中對帳 單次完款</p>
          </div>

          <div className="p-6 md:p-12">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-6">
                <p className="text-stone-400 tracking-widest font-medium">您的祈福清單目前空無一物</p>
                <Link href="/"><Button className="bg-[#1A432D] text-white rounded-full px-8 py-5 tracking-widest">返回首頁選購</Button></Link>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-stone-800 tracking-wider border-l-4 border-[#A61D24] pl-3">已加入登記項目</h3>
                  <div className="divide-y divide-stone-100 border border-stone-200/60 rounded-2xl bg-stone-50/40 overflow-hidden">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-5 flex justify-between items-start gap-4 hover:bg-white transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-stone-800 text-lg">{item.userName}</span>
                            <span className="text-xs font-bold bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                              {item.serviceType === 'booking' ? '問事' : item.serviceType === 'lamp' ? '點燈' : '代燒'}
                            </span>
                          </div>
                          <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">{item.itemDetails}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between h-full min-h-[60px]">
                          <span className="font-bold text-stone-800">${item.price}</span>
                          <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 font-bold hover:text-red-700 tracking-widest pt-2">移除</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-center space-y-3 shadow-inner max-w-md mx-auto">
                  <h4 className="font-bold text-stone-700 tracking-widest text-xs">指定功德護持帳戶</h4>
                  <p className="font-bold text-base text-stone-800">{bankName}</p>
                  <p className="font-bold text-xl text-[#D89F3C] tracking-widest">{bankAccount}</p>
                </div>

                <div className="max-w-md mx-auto space-y-3 text-center">
                  <label className="block text-sm font-bold text-stone-600 tracking-widest">請輸入轉帳帳號後 5 碼</label>
                  <input maxLength={5} value={bankLast5} onChange={e=>setBankLast5(e.target.value.replace(/\D/g,''))} placeholder="數字 5 碼" className="w-full text-center tracking-[0.5em] font-bold text-2xl border-2 border-stone-200 p-4 rounded-xl outline-none focus:border-[#A61D24] transition-colors bg-stone-50/50"/>
                </div>

                <div className="border-t border-stone-200/60 pt-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div>
                    <span className="text-xs text-stone-400 font-bold tracking-widest">合併功德總金額</span>
                    <p className="text-3xl font-bold text-[#A61D24] mt-1">${totalCartPrice}</p>
                  </div>
                  <Button onClick={handleCheckout} className="w-full sm:w-auto bg-[#A61D24] hover:bg-[#85161C] text-white font-bold px-12 py-6 rounded-xl text-lg tracking-widest shadow-lg">確認送出並生成對帳單</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✨ 購物車專屬：神尊圖騰法旨小票成功畫面 */}
      {step === 2 && (
        <div className="w-full max-w-md relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          
          <div className="bg-blue-50/80 border border-blue-100 text-blue-700 text-xs font-bold py-3 px-4 rounded-xl mb-4 flex items-center justify-center gap-2 shadow-sm animate-pulse w-full max-w-[320px]">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="tracking-widest">貼心小提示：請先截圖保存此合併憑證</span>
          </div>

          <div className="relative w-full max-w-[380px] drop-shadow-2xl mx-auto flex">
            {/* ✨ 讓背景圖片能夠填滿整個隨內容長高的區域 */}
            <img 
              src="https://oyoopxulmfihblgaptva.supabase.co/storage/v1/object/public/images/IMG_5311.PNG" 
              alt="皇府宮合併法旨" 
              className="absolute inset-0 w-full h-full object-fill rounded-xl" 
            />

            <div className="relative z-10 w-full pt-[45%] pb-[25%] px-[20%] flex flex-col items-center">
              
              <div className="text-center mb-4">
                 <h2 className="text-[15px] md:text-[17px] font-bold text-[#A61D24] font-serif tracking-widest mb-1">祈福合併存根</h2>
                 <p className="text-[#D89F3C] text-[10px] md:text-[11px] tracking-widest font-bold">大德護持 · 功德圓滿</p>
              </div>

              {/* ✨ 購物車多筆明細：加入自動捲動，避免項目太多把圖撐破 */}
              <div className="w-full max-w-[190px] text-[11px] md:text-[12px] font-serif flex-1 overflow-y-auto pr-1 max-h-[160px] scrollbar-hide">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="border-b border-stone-200/50 pb-2 mb-2 last:border-none">
                    <div className="flex gap-2 items-start">
                      <span className="font-bold text-[#A61D24]/80 tracking-widest shrink-0 w-9 text-right">大德</span>
                      <span className="font-bold text-stone-900 line-clamp-1 leading-snug">{item.userName}</span>
                    </div>
                    <div className="flex gap-2 items-start mt-1">
                      <span className="font-bold text-[#A61D24]/80 tracking-widest shrink-0 w-9 text-right">明細</span>
                      <span className="font-bold text-stone-900 line-clamp-2 leading-snug">{item.itemDetails}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full max-w-[190px] border-t border-stone-300 mt-2 pt-2 text-[11px] md:text-[12px] font-serif flex gap-2 items-start">
                  <span className="font-bold text-[#A61D24]/80 tracking-widest shrink-0 w-9 text-right">核銷</span>
                  <span className="font-bold text-stone-900 font-sans tracking-wider leading-snug">{bankLast5}</span>
              </div>

              <div className="text-center mt-5">
                 <span className="block text-[10px] md:text-[11px] font-bold text-[#A61D24]/80 tracking-widest font-serif mb-1">合併功德金</span>
                 <span className="text-2xl md:text-3xl font-bold text-[#A61D24] font-mono leading-none block drop-shadow-sm">
                   ${totalCartPrice}
                 </span>
              </div>

            </div>
          </div>

          {/* 綠色 LINE 回報按鈕 */}
          <Button onClick={handleCopyReceipt} className="w-full max-w-[320px] mt-8 bg-[#06C755] hover:bg-[#05a546] text-white py-6 rounded-xl font-bold text-lg tracking-widest shadow-xl transition-transform hover:scale-[1.02]">
            複製明細，並回報 LINE
          </Button>

        </div>
      )}

    </main>
  );
}