"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Camera } from "lucide-react"; // ✨ 引入專業線條圖示取代 Emoji

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

  // ✨ 同步最新智慧過濾器 (結合「只留 3 個方案」的邏輯)
  const parseItemDetails = (item: any) => {
    const serviceName = item.serviceType === 'booking' ? '濟事問事' : item.serviceType === 'lamp' ? '當月點燈' : '代燒服務';

    // 1. 先把生硬的標題、數量、金額全部洗掉，並把換行轉成頓號
    let rawString = item.itemDetails
      .replace(/特辦活動:?\s*/g, '')
      .replace(/報名方案:?\s*/g, '')
      .replace(/\n/g, '、')
      .replace(/\s*x\d+/g, '')
      .replace(/\s*\(\$\d+\)/g, '')
      .trim();

    // 2. 切割成陣列，執行「最多只留三個方案」的規則
    let optionsArray = rawString.split('、').map((s: string) => s.trim()).filter(Boolean);
    const limitedOptions = optionsArray.slice(0, 3).join('、');
    const finalOptions = optionsArray.length > 3 ? limitedOptions + ' 等' : limitedOptions;

    return { serviceName, finalOptions };
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
                          {/* 購物車列表稍微清理生硬標題，但保留數量與金額供確認 */}
                          <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">
                            {item.itemDetails.replace(/特辦活動:?\s*/g, '').replace(/報名方案:?\s*/g, '')}
                          </p>
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

      {/* ✨ 購物車專屬：神尊圖騰祈福印記成功畫面 */}
      {step === 2 && (
        <div className="w-full max-w-md relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          
          <div className="bg-[#1A432D]/90 text-[#D89F3C] border border-[#D89F3C]/50 text-xs font-bold py-2.5 px-4 rounded-xl mb-4 flex items-center justify-center gap-2 shadow-lg w-full max-w-[280px]">
             <Camera size={14} className="shrink-0" />
             <span className="tracking-widest">貼心小提示：可截圖保存此祈福印記</span>
          </div>

          <div className="relative w-full max-w-[380px] drop-shadow-2xl mx-auto flex">
            <img 
              src="https://oyoopxulmfihblgaptva.supabase.co/storage/v1/object/public/images/IMG_5311.PNG" 
              alt="祈福印記" 
              className="absolute inset-0 w-full h-full object-fill rounded-xl" 
            />

            <div className="relative z-10 w-full pt-[45%] pb-[20%] px-[20%] flex flex-col items-center">
              
              {/* ✨ 補回大德護持副標題 */}
              <div className="text-center mb-5">
                 <h2 className="text-[17px] md:text-[19px] font-bold text-[#A61D24] font-serif tracking-[0.2em] mb-1">祈福印記</h2>
                 <p className="text-[#D89F3C] text-[10px] md:text-[11px] tracking-widest font-bold">- 大德護持 善神擁護 -</p>
              </div>

              {/* ✨ 購物車多筆明細：大德/項目/方案 */}
              <div className="w-full max-w-[190px] text-[11px] md:text-[12px] font-serif flex-1 overflow-y-auto pr-1 max-h-[180px] scrollbar-hide">
                {cartItems.map((item, idx) => {
                  const { serviceName, finalOptions } = parseItemDetails(item);
                  return (
                    <div key={idx} className="border-b border-[#D89F3C]/30 pb-3 mb-2 last:border-none">
                      <div className="flex gap-2 items-start">
                        <span className="font-bold text-[#A61D24]/80 tracking-widest shrink-0 w-8 text-right">大德</span>
                        <span className="font-bold text-stone-900 leading-snug">{item.userName}</span>
                      </div>
                      <div className="flex gap-2 items-start mt-1.5">
                        <span className="font-bold text-[#A61D24]/80 tracking-widest shrink-0 w-8 text-right">項目</span>
                        <span className="font-bold text-stone-900 leading-snug">{serviceName}</span>
                      </div>
                      <div className="flex gap-2 items-start mt-1.5">
                        <span className="font-bold text-[#A61D24]/80 tracking-widest shrink-0 w-8 text-right">方案</span>
                        <span className="font-bold text-stone-900 leading-snug break-words">{finalOptions}</span>
                      </div>
                    </div>
                  );
                })}

                {/* 底部疏文結尾區 */}
                <div className="text-center mt-6 mb-2 flex flex-col items-center justify-center gap-1.5 border-t border-[#D89F3C]/30 pt-4">
                  <span className="text-[10px] md:text-[11px] font-bold text-stone-700 tracking-widest">
                    天運歲次 登記吉日
                  </span>
                  <span className="text-[8px] md:text-[9px] font-bold text-stone-500 tracking-widest">祈求 平安順心 萬事如意</span>
                  <span className="text-[11px] md:text-[12px] font-bold text-[#D89F3C] tracking-[0.2em] mt-1">- 功德 圓滿 -</span>
                </div>
              </div>

            </div>
          </div>

          <Button onClick={handleCopyReceipt} className="w-full max-w-[320px] mt-8 bg-[#06C755] hover:bg-[#05a546] text-white py-6 rounded-xl font-bold text-lg tracking-widest shadow-xl transition-transform hover:scale-[1.02]">
            一鍵複製，並打開 LINE 對帳
          </Button>

        </div>
      )}

    </main>
  );
}