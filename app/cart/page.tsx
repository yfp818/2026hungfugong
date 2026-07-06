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

    // 將購物車內的每一項，轉換為獨立的訂單紀錄，批次寫入 service_orders
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
    clearCart(); // 傳送後清空購物車
  };

  return (
    <main className="min-h-screen bg-[#FAF7F0] py-16 px-6 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-[2rem] shadow-xl border border-stone-200/60 overflow-hidden">
        <div className="bg-[#1A432D] p-10 text-center border-b-[6px] border-[#D89F3C]">
          <h1 className="text-3xl font-bold text-white tracking-[0.2em] drop-shadow-md">祈福清單合併結帳</h1>
          <p className="text-white/70 text-xs tracking-widest mt-2">集中對帳 單次完款</p>
        </div>

        <div className="p-6 md:p-12">
          {cartItems.length === 0 && step === 1 ? (
            <div className="text-center py-16 space-y-6">
              <p className="text-stone-400 tracking-widest font-medium">您的祈福清單目前空無一物</p>
              <Link href="/"><Button className="bg-[#1A432D] text-white rounded-full px-8 py-5 tracking-widest">返回首頁選購</Button></Link>
            </div>
          ) : step === 1 ? (
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
                        <p className="text-stone-600 text-sm">{item.itemDetails}</p>
                        <p className="text-stone-400 text-xs truncate max-w-md">{item.birthDate} | {item.address}</p>
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
          ) : (
            <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-md mx-auto">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-stone-800 tracking-widest">線上合併登記成功</h2>

              <div className="bg-[#FAF7F0] border-2 border-dashed border-stone-300 rounded-[2rem] p-8 text-left shadow-sm">
                <div className="text-center font-bold text-stone-500 text-xs tracking-[0.3em] border-b border-stone-200 pb-4 mb-6">皇 府 宮 祈 福 總 存 根 聯</div>
                <div className="space-y-4 text-sm text-stone-700 font-medium">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="border-b border-stone-200/40 pb-3 last:border-none">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-stone-900">{item.userName}</span>
                        <span className="text-[10px] bg-stone-200 px-1.5 py-0.5 rounded text-stone-600">{item.itemDetails}</span>
                      </div>
                      <p className="text-stone-400 text-xs truncate">{item.birthDate}</p>
                    </div>
                  ))}
                  <div className="bg-white p-3 rounded-xl border border-stone-200 mt-4 flex justify-between items-center">
                    <span className="text-stone-400 text-xs">轉帳核銷後五碼</span>
                    <span className="font-mono text-stone-800 font-bold tracking-widest text-base">{bankLast5}</span>
                  </div>
                </div>
                <div className="border-t-2 border-dashed border-stone-300 mt-6 pt-5 flex justify-between items-end">
                  <span className="text-xs text-stone-400 font-bold tracking-widest">護持功德總計</span>
                  <span className="text-3xl font-bold text-[#A61D24]">${totalCartPrice}</span>
                </div>
              </div>

              <Button onClick={handleCopyReceipt} className="w-full bg-[#06C755] hover:bg-[#05a546] text-white py-6 rounded-xl font-bold text-lg tracking-widest shadow-xl transition-transform hover:scale-[1.02]">
                一鍵複製，並打開 LINE 對帳
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}