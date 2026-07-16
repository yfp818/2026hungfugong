"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Camera } from "lucide-react"; 

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

  // 💡 嚴格遵守開發者規則：加上 try-catch 防止無聲失敗
  const handleCheckout = async () => {
    if (cartItems.length === 0) return alert("購物車目前無任何項目。");
    if (bankLast5.length !== 5) return alert("請正確填寫轉帳帳號後五碼。");

    try {
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

      if (error) throw new Error(error.message);

      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert("明細寫入失敗，請洽客服：" + err.message);
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

  const parseItemDetails = (item: any) => {
    const serviceName = item.serviceType === 'booking' ? '濟事問事' : item.serviceType === 'lamp' ? '當月點燈' : '代燒服務';

    let rawString = item.itemDetails
      .replace(/特辦活動:?\s*/g, '')
      .replace(/報名方案:?\s*/g, '')
      .replace(/\n/g, '、')
      .replace(/\s*x\d+/g, '')
      .replace(/\s*\(\$\d+\)/g, '')
      .trim();

    let optionsArray = rawString.split('、').map((s: string) => s.trim()).filter(Boolean);
    const limitedOptions = optionsArray.slice(0, 3).join('、');
    
    const finalOptions = optionsArray.length > 3 ? limitedOptions + '等' : limitedOptions;

    return { serviceName, finalOptions };
  };

  const combinedNames = Array.from(new Set(cartItems.map(item => item.userName))).join("、");
  const combinedServices = Array.from(new Set(cartItems.map(item => parseItemDetails(item).serviceName))).join("、");
  const combinedOptions = cartItems.map(item => parseItemDetails(item).finalOptions).join("、");

  return (
    // 深夜模式：最外層背景與文字變數化
    <main className="min-h-screen bg-background text-foreground py-16 px-4 md:px-6 flex flex-col items-center justify-center transition-colors duration-300">
      
      {step === 1 && (
        <div className="max-w-3xl w-full bg-card text-card-foreground rounded-[2rem] shadow-xl border border-border overflow-hidden">
          <div className="bg-[#1A432D] p-10 text-center border-b-[6px] border-[#D89F3C]">
            <h1 className="text-3xl font-bold text-white tracking-[0.2em] drop-shadow-md">祈福清單合併結帳</h1>
            <p className="text-white/70 text-xs tracking-widest mt-2">集中對帳 單次完款</p>
          </div>

          <div className="p-6 md:p-12">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-6">
                <p className="text-muted-foreground tracking-widest font-medium">您的祈福清單目前空無一物</p>
                <Link href="/"><Button className="bg-[#1A432D] hover:bg-[#122F20] text-white rounded-full px-8 py-5 tracking-widest transition-colors">返回首頁選購</Button></Link>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-foreground tracking-wider border-l-4 border-[#A61D24] dark:border-red-500 pl-3">已加入登記項目</h3>
                  <div className="divide-y divide-border border border-border rounded-2xl bg-muted/30 overflow-hidden">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-5 flex justify-between items-start gap-4 hover:bg-muted/50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-foreground text-lg">{item.userName}</span>
                            <span className="text-xs font-bold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                              {item.serviceType === 'booking' ? '問事' : item.serviceType === 'lamp' ? '點燈' : '代燒'}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                            {item.itemDetails.replace(/特辦活動:?\s*/g, '').replace(/報名方案:?\s*/g, '')}
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-between h-full min-h-[60px]">
                          <span className="font-bold text-foreground">${item.price}</span>
                          <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 font-bold hover:text-red-700 dark:hover:text-red-400 tracking-widest pt-2 transition-colors">移除</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted p-6 rounded-2xl border border-border text-center space-y-3 shadow-inner max-w-md mx-auto">
                  <h4 className="font-bold text-muted-foreground tracking-widest text-xs">指定功德護持帳戶</h4>
                  <p className="font-bold text-base text-foreground">{bankName}</p>
                  <p className="font-bold text-xl text-[#D89F3C] tracking-widest">{bankAccount}</p>
                </div>

                <div className="max-w-md mx-auto space-y-3 text-center">
                  <label className="block text-sm font-bold text-muted-foreground tracking-widest">請輸入轉帳帳號後 5 碼</label>
                  <input 
                    maxLength={5} 
                    value={bankLast5} 
                    onChange={e=>setBankLast5(e.target.value.replace(/\D/g,''))} 
                    placeholder="數字 5 碼" 
                    className="w-full text-center tracking-[0.5em] font-bold text-2xl border-2 border-input p-4 rounded-xl outline-none focus:border-[#A61D24] dark:focus:border-red-400 transition-colors bg-background text-foreground"
                  />
                </div>

                <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div>
                    <span className="text-xs text-muted-foreground font-bold tracking-widest">合併功德總金額</span>
                    <p className="text-3xl font-bold text-[#A61D24] dark:text-red-400 mt-1">${totalCartPrice}</p>
                  </div>
                  <Button onClick={handleCheckout} className="w-full sm:w-auto bg-[#A61D24] hover:bg-[#85161C] dark:bg-red-700 dark:hover:bg-red-600 text-white font-bold px-12 py-6 rounded-xl text-lg tracking-widest shadow-lg transition-colors">確認送出並生成對帳單</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 步驟二：✨ 神尊圖騰祈福印記成功畫面 */}
      {step === 2 && (
        <div className="w-full max-w-md relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          
          <style>{`#global-cart-btn { display: none !important; }`}</style>

          <div className="bg-[#1A432D]/90 text-[#D89F3C] border border-[#D89F3C]/50 text-xs font-bold py-2.5 px-4 rounded-xl mb-4 flex items-center justify-center gap-2 shadow-lg w-full max-w-[280px]">
             <Camera size={14} className="shrink-0" />
             <span className="tracking-widest">貼心小提示：可截圖保存此祈福印記</span>
          </div>

          {/* 💡 終極絕對鎖定防禦陣型 (依據陳世碼先生 175x300 座標規範圖，使用純粹的 left/top calc 公式) */}
          <div className="relative w-full max-w-[360px] drop-shadow-2xl mx-auto overflow-hidden rounded-xl bg-background">
              
            {/* 底圖，撐開整體高寬比例 */}
            <img 
              src="https://oyoopxulmfihblgaptva.supabase.co/storage/v1/object/public/images/IMG_5311.PNG" 
              alt="祈福印記" 
              className="w-full h-auto block pointer-events-none select-none relative z-0" 
            />

            {/* 確保直立中文字顯示正常 */}
            <style>{`
              .receipt-text {
                font-family: var(--font-noto-serif), "Noto Serif TC", serif !important;
              }
            `}</style>

            {/* T1: Top Header (X: 42.5, Y: 10, W: 90, H: 20) */}
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

            {/* T2: Right Column (X: 160, Y: 75, W: 12, H: 150) */}
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

            {/* T3: Left Column (X: 3, Y: 75, W: 12, H: 150) */}
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

            {/* T4: Body Right - 大德 (X: 105, Y: 110, W: 35) */}
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
              {/* 💡 使用購物車組合字串 */}
              <span className="font-bold text-[11px] md:text-[12px] tracking-widest leading-snug">{combinedNames}</span>
            </div>

            {/* T6: Body Sub - 項目 (X: 105, Y: 170, W: 35) */}
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
              {/* 💡 使用購物車組合字串 */}
              <span className="font-bold text-[11px] md:text-[12px] tracking-widest leading-snug">{combinedServices}</span>
            </div>

            {/* T5-A: Body Left - 方案標題 (獨立固定在上方) */}
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

            {/* T5-B: Body Left - 方案黑字內容 (獨立區塊，起始點往下壓) */}
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
              {/* 💡 使用購物車組合字串 */}
              <span className="font-bold text-[11px] md:text-[12px] leading-[2.5] tracking-widest whitespace-pre-wrap break-all">
                {combinedOptions}
              </span>
            </div>

            {/* T7: Footer (X: 62.5, Y: 240, W: 50, H: 10) */}
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

          <Button onClick={handleCopyReceipt} className="w-full max-w-[320px] mt-8 bg-[#06C755] hover:bg-[#05a546] text-white py-6 rounded-xl font-bold text-lg tracking-widest shadow-xl transition-transform hover:scale-[1.02]">
            一鍵複製，並打開 LINE 對帳
          </Button>

        </div>
      )}

    </main>
  );
}