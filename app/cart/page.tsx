"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Camera, Coins } from "lucide-react"; 

export default function GlobalCartPage() {
  const { data: session } = useSession();
  const { cartItems, removeFromCart, clearCart } = useCart();
  
  const [step, setStep] = useState(1);
  const [bankLast5, setBankLast5] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [receiptData, setReceiptData] = useState<any>(null);
  
  const [lineUrl, setLineUrl] = useState("https://lin.ee/uHaPx59");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [useWallet, setUseWallet] = useState<boolean>(false);

  // 安全計算總價，確保 cartItems 是有效陣列
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const totalCartPrice = safeCartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const deductedAmount = useWallet ? Math.min(totalCartPrice, walletBalance) : 0;
  const finalPrice = totalCartPrice - deductedAmount;

  useEffect(() => {
    async function loadInitialData() {
      const { data: siteData } = await supabase.from("site_content").select("content").eq("id", "site_footer").single();
      if (siteData?.content) {
        try {
          const parsed = JSON.parse(siteData.content);
          if (parsed.lineUrl) setLineUrl(parsed.lineUrl);
          if (parsed.bankName) setBankName(parsed.bankName);
          if (parsed.bankAccount) setBankAccount(parsed.bankAccount);
        } catch (e) {}
      }

      if (session?.user?.email) {
        const { data: memberData } = await supabase
          .from("member_profiles")
          .select("wallet_balance")
          .eq("user_line_id", session.user.email)
          .single();
        if (memberData) {
          setWalletBalance(memberData.wallet_balance || 0);
        }
      }
    }
    loadInitialData();
  }, [session]);

  const handleCheckout = async () => {
    if (safeCartItems.length === 0) return alert("購物車目前無任何項目。");
    if (finalPrice > 0 && bankLast5.length !== 5) return alert("請正確填寫轉帳帳號後五碼。");

    setIsProcessing(true);

    try {
      const itemsToInsert = safeCartItems.map((item: any) => ({
        user_line_id: session?.user?.email || session?.user?.name || "line_user",
        service_type: item.serviceType === "booking" ? "濟事問事" : item.serviceType === "lamp" ? "當月點燈" : "代燒服務",
        user_name: item.userName || "未提供姓名",
        user_phone: item.userPhone || "",
        birth_date: item.birthDate || "",
        address: item.address || "",
        service_details: item.itemDetails || "",
        total_price: Number(item.price) || 0,
        bank_last_5: finalPrice === 0 ? "餘額扣抵" : bankLast5,
        status: finalPrice === 0 ? "completed" : "pending"
      }));

      const { error: orderError } = await supabase.from("service_orders").insert(itemsToInsert);
      if (orderError) throw orderError;

      if (useWallet && deductedAmount > 0 && session?.user?.email) {
        const newBalance = walletBalance - deductedAmount;
        const { error: balanceError } = await supabase
          .from("member_profiles")
          .update({ wallet_balance: newBalance })
          .eq("user_line_id", session.user.email);
        if (balanceError) throw balanceError;

        const { error: txError } = await supabase
          .from("wallet_transactions")
          .insert([{
            user_line_id: session.user.email,
            amount: -deductedAmount,
            transaction_type: "consume",
            description: `[結帳扣抵] 祈福服務 (總額 $${totalCartPrice}，扣抵 $${deductedAmount})`
          }]);
        if (txError) throw txError;
      }

      // 備份印記資料並清空購物車
      setReceiptData({
        items: [...safeCartItems],
        total: totalCartPrice,
        deducted: deductedAmount,
        final: finalPrice,
        b5: finalPrice === 0 ? "餘額扣抵" : bankLast5
      });
      
      clearCart();
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      alert("結帳發生錯誤，請洽客服：" + error.message);
    } finally {
      setIsProcessing(false);
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
    if (!receiptData) return;
    
    const itemsDetailsString = receiptData.items.map((item: any) => `-[${item.userName}] ${item.itemDetails}`).join("\n");
    
    let text = `【皇府宮 - 祈福合併對帳單】\n${itemsDetailsString}\n\n`;
    text += `功德總計金額：$${receiptData.total}\n`;
    if (receiptData.deducted > 0) text += `祈福金扣抵：-$${receiptData.deducted}\n`;
    text += `應付匯款金額：$${receiptData.final}\n\n`;
    
    if (receiptData.final > 0) {
      text += `核銷轉帳後五碼：${receiptData.b5}\n*已完成線上合併登記，請管理員核對*`;
    } else {
      text += `*已全額由數位祈福金扣抵完畢*\n*系統已自動對帳完成*`;
    }
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => window.open(lineUrl, "_blank")).catch(() => { copyToClipboardFallback(text); window.open(lineUrl, "_blank"); });
    } else {
      copyToClipboardFallback(text); window.open(lineUrl, "_blank");
    }
  };

  const parseItemDetails = (item: any) => {
    const serviceName = item?.serviceType === 'booking' ? '濟事問事' : item?.serviceType === 'lamp' ? '當月點燈' : '代燒服務';

    // 🛡️ 防呆處理：確保字串存在，防止 replace 崩潰
    let rawString = (item?.itemDetails || "")
      .replace(/特辦活動:?\s*/g, '')
      .replace(/報名方案:?\s*/g, '')
      .replace(/\n/g, '、')
      .replace(/\s*x\d+/g, '')
      .replace(/\s*\(\$\d+\)/g, '')
      .trim();

    let optionsArray = rawString.split('、').map((s: string) => s.trim()).filter(Boolean);
    const limitedOptions = optionsArray.slice(0, 3).join('、');
    return { serviceName, finalOptions: optionsArray.length > 3 ? limitedOptions + '等' : limitedOptions };
  };

  const combinedNames = receiptData ? Array.from(new Set(receiptData.items.map((i:any) => i.userName))).join("、") : "";
  const combinedServices = receiptData ? Array.from(new Set(receiptData.items.map((i:any) => parseItemDetails(i).serviceName))).join("、") : "";
  const combinedOptions = receiptData ? receiptData.items.map((i:any) => parseItemDetails(i).finalOptions).join("、") : "";

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4 md:px-6 flex flex-col items-center justify-center transition-colors duration-300">
      
      {step === 1 && (
        <div className="max-w-3xl w-full bg-card text-card-foreground rounded-[2rem] shadow-xl border border-border overflow-hidden">
          <div className="bg-[#1A432D] p-8 md:p-10 text-center border-b-[6px] border-[#D89F3C]">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-[0.2em] drop-shadow-md">祈福清單合併結帳</h1>
            <p className="text-white/70 text-xs tracking-widest mt-2">集中對帳 單次完款</p>
          </div>

          <div className="p-6 md:p-12">
            {safeCartItems.length === 0 ? (
              <div className="text-center py-16 space-y-6">
                <p className="text-muted-foreground tracking-widest font-medium">您的祈福清單目前空無一物</p>
                <Link href="/" className="inline-block bg-[#1A432D] hover:bg-[#122F20] dark:bg-emerald-800 dark:hover:bg-emerald-900 text-white rounded-full px-8 py-4 font-bold tracking-widest shadow-md transition-colors">
                  返回首頁選購
                </Link>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-foreground tracking-wider border-l-4 border-[#A61D24] dark:border-red-500 pl-3">已加入登記項目</h3>
                  
                  <div className="divide-y divide-border border border-border rounded-2xl bg-muted/30 overflow-hidden">
                    {safeCartItems.map((item: any) => (
                      <div key={item.id} className="p-5 flex justify-between items-start gap-4 hover:bg-muted/50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-foreground text-lg">{item.userName}</span>
                            <span className="text-xs font-bold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                              {item.serviceType === 'booking' ? '問事' : item.serviceType === 'lamp' ? '點燈' : '代燒'}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                            {(item.itemDetails || "").replace(/特辦活動:?\s*/g, '').replace(/報名方案:?\s*/g, '')}
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

                {walletBalance > 0 && (
                  <div className={`p-5 md:p-6 rounded-2xl border transition-all duration-300 shadow-sm ${useWallet ? 'bg-purple-50/50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800' : 'bg-muted/50 border-border'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${useWallet ? 'bg-purple-100 text-purple-700' : 'bg-stone-200 text-stone-500'}`}>
                          <Coins size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-foreground tracking-widest">數位祈福金餘額</p>
                          <p className={`font-bold text-lg mt-0.5 ${useWallet ? 'text-purple-700' : 'text-muted-foreground'}`}>${walletBalance.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={useWallet} onChange={() => setUseWallet(!useWallet)} />
                        <div className="w-14 h-7 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                )}

                <div className="border border-border bg-card p-6 rounded-2xl shadow-sm space-y-3">
                   <div className="flex justify-between items-center text-sm font-bold text-muted-foreground tracking-widest">
                     <span>小計</span>
                     <span>${totalCartPrice}</span>
                   </div>
                   {useWallet && deductedAmount > 0 && (
                     <div className="flex justify-between items-center text-sm font-bold text-purple-600 tracking-widest animate-in slide-in-from-top-2">
                       <span>祈福金自動扣抵</span>
                       <span>-${deductedAmount}</span>
                     </div>
                   )}
                   <div className="pt-4 border-t border-border flex justify-between items-end">
                     <span className="text-xs text-muted-foreground font-bold tracking-widest mb-1">應付結帳總額</span>
                     <p className="text-4xl font-black text-[#A61D24] dark:text-red-400">${finalPrice}</p>
                   </div>
                </div>

                {finalPrice > 0 ? (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-muted p-6 rounded-2xl border border-border text-center space-y-3 shadow-inner max-w-md mx-auto">
                      <h4 className="font-bold text-muted-foreground tracking-widest text-xs">指定功德護持帳戶</h4>
                      <p className="font-bold text-base text-foreground">{bankName}</p>
                      <p className="font-bold text-xl text-[#D89F3C] tracking-widest">{bankAccount}</p>
                    </div>

                    <div className="max-w-md mx-auto space-y-3 text-center">
                      <label className="block text-sm font-bold text-muted-foreground tracking-widest">請匯款後輸入轉帳後 5 碼</label>
                      <input 
                        maxLength={5} 
                        value={bankLast5} 
                        onChange={e=>setBankLast5(e.target.value.replace(/\D/g,''))} 
                        placeholder="數字 5 碼" 
                        className="w-full text-center tracking-[0.5em] font-bold text-2xl border-2 border-input p-4 rounded-xl outline-none focus:border-[#A61D24] dark:focus:border-red-400 transition-colors bg-background text-foreground shadow-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center space-y-2 shadow-sm animate-in zoom-in-95 duration-500">
                    <p className="font-bold text-lg tracking-widest">✅ 款項已全額扣抵</p>
                    <p className="text-xs font-bold opacity-80 tracking-widest">系統將為您自動核對帳目，無須填寫轉帳資料</p>
                  </div>
                )}

                <div className="pt-4">
                  <Button disabled={isProcessing} onClick={handleCheckout} className="w-full bg-[#A61D24] hover:bg-[#85161C] dark:bg-red-700 dark:hover:bg-red-600 text-white font-bold py-7 rounded-xl text-lg tracking-widest shadow-lg transition-transform hover:scale-[1.01]">
                    {isProcessing ? "處理中..." : finalPrice === 0 ? "一鍵完成祈福登記" : "確認送出並生成對帳單"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && receiptData && (
        <div className="w-full max-w-md relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          
          <style>{`#global-cart-btn { display: none !important; }`}</style>

          <div className="bg-[#1A432D]/90 text-[#D89F3C] border border-[#D89F3C]/50 text-xs font-bold py-2.5 px-4 rounded-xl mb-4 flex items-center justify-center gap-2 shadow-lg w-full max-w-[280px]">
             <Camera size={14} className="shrink-0" />
             <span className="tracking-widest">貼心小提示：可截圖保存此祈福印記</span>
          </div>

          <div className="relative w-full max-w-[360px] drop-shadow-2xl mx-auto overflow-hidden rounded-xl bg-[#FAF7F0]">
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

            <div className="absolute z-10 receipt-text flex flex-col items-center justify-center text-center" style={{ left: 'calc(44.5 / 175 * 100%)', top: 'calc(85 / 300 * 100%)', width: 'calc(90 / 175 * 100%)', height: 'calc(20 / 300 * 100%)' }}>
              <h2 className="text-[17px] md:text-[19px] font-bold text-[#A61D24] tracking-[0.3em] leading-none mb-1">祈福印記</h2>
              <p className="text-[#D89F3C] text-[10px] md:text-[11px] tracking-widest font-bold leading-none">- 大德護持 善神擁護 -</p>
            </div>

            <div className="absolute z-10 receipt-text text-[#A61D24] flex items-center justify-center" style={{ left: 'calc(160 / 175 * 100%)', top: 'calc(75 / 300 * 100%)', width: 'calc(12 / 175 * 100%)', height: 'calc(150 / 300 * 100%)', writingMode: 'vertical-rl', textOrientation: 'upright' }}>
              <span className="font-bold text-[14px] md:text-[11px] tracking-[0.2em]">天運歲次登記吉日</span>
            </div>

            <div className="absolute z-10 receipt-text text-[#A61D24] flex items-center justify-center" style={{ left: 'calc(3 / 175 * 100%)', top: 'calc(70 / 300 * 100%)', width: 'calc(12 / 175 * 100%)', height: 'calc(180 / 300 * 100%)', writingMode: 'vertical-rl', textOrientation: 'upright' }}>
              <span className="font-bold text-[14px] md:text-[11px] tracking-[0.2em]">祈求平安順心萬事如意</span>
            </div>

            <div className="absolute z-10 receipt-text text-stone-900" style={{ left: 'calc(90 / 175 * 100%)', top: 'calc(110 / 300 * 100%)', width: 'calc(35 / 175 * 100%)', height: 'auto', maxHeight: 'calc(120 / 300 * 100%)', writingMode: 'vertical-rl', textOrientation: 'upright' }}>
              <span className="font-bold text-[#A61D24] text-[12px] md:text-[13px] tracking-[0.4em] inline-block" style={{ marginBottom: '16px' }}>大德</span>
              <span className="font-bold text-[11px] md:text-[12px] tracking-widest leading-snug">{combinedNames}</span>
            </div>

            <div className="absolute z-10 receipt-text text-stone-900" style={{ left: 'calc(90 / 175 * 100%)', top: 'calc(170 / 300 * 100%)', width: 'calc(35 / 175 * 100%)', height: 'auto', writingMode: 'vertical-rl', textOrientation: 'upright' }}>
              <span className="font-bold text-[#A61D24] text-[12px] md:text-[13px] tracking-[0.4em] inline-block" style={{ marginBottom: '16px' }}>項目</span>
              <span className="font-bold text-[11px] md:text-[12px] tracking-widest leading-snug">{combinedServices}</span>
            </div>

            <div className="absolute z-10 receipt-text text-[#A61D24]" style={{ left: 'calc(75 / 175 * 100%)', top: 'calc(110 / 300 * 100%)', width: 'calc(35 / 175 * 100%)', height: 'auto', writingMode: 'vertical-rl', textOrientation: 'upright' }}>
              <span className="font-bold text-[12px] md:text-[13px] tracking-[0.4em]">方案</span>
            </div>

            <div className="absolute z-10 receipt-text text-stone-900" style={{ left: 'calc(40 / 175 * 100%)', top: 'calc(128 / 300 * 100%)', width: 'calc(70 / 175 * 100%)', height: 'auto', maxHeight: 'calc(102 / 300 * 100%)', writingMode: 'vertical-rl', textOrientation: 'upright' }}>
              <span className="font-bold text-[11px] md:text-[12px] leading-[2.5] tracking-widest whitespace-pre-wrap break-all">
                {combinedOptions}
              </span>
            </div>

            <div className="absolute z-10 receipt-text flex flex-col items-center justify-center text-center" style={{ left: 'calc(62.5 / 175 * 100%)', top: 'calc(240 / 300 * 100%)', width: 'calc(50 / 175 * 100%)', height: 'calc(10 / 300 * 100%)' }}>
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