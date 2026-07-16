"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useSession, signIn } from "next-auth/react";
import ShareButton from "@/components/ShareButton";
import { Camera } from "lucide-react"; 

export default function SpecialProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();
  const { data: session } = useSession();

  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [targetName, setTargetName] = useState(""); 
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [selectedOptIdx, setSelectedOptIdx] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [bankLast5, setBankLast5] = useState("");
  const [memo, setMemo] = useState(""); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("special_projects")
        .select("*")
        .eq("id", projectId)
        .single();
      
      if (data) setProject(data);
      setIsLoading(false);
    };
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (session?.user?.name && !name) setName(session.user.name);
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    const selectedOption = project.options[selectedOptIdx];
    const finalAmount = selectedOption.price > 0 ? selectedOption.price : Number(customAmount);

    if (finalAmount <= 0) return alert("請輸入有效的認捐金額。");
    if (!bankLast5 || bankLast5.length < 4) return alert("請輸入您的匯款帳號後五碼，以便財務對帳。");

    setIsSubmitting(true);
    
    const finalDetails = `認捐方案: ${selectedOption.title}${targetName ? `\n祈福對象: ${targetName}` : ""}${memo ? `\n祈福心願: ${memo}` : ""}`;

    const { error } = await supabase.from("special_project_orders").insert([{
      project_id: project.id,
      user_name: name,
      user_phone: phone,
      birth_date: birthDate,
      address: address,
      amount: finalAmount,
      bank_last_5: bankLast5,
      service_details: finalDetails
    }]);

    setIsSubmitting(false);
    if (error) {
      alert("送出失敗：" + error.message);
    } else {
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center font-bold tracking-widest text-stone-400">載入專案中...</div>;
  
  if (!project || !project.is_active) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
      <div className="bg-card p-12 rounded-3xl shadow-sm border border-border">
        <h1 className="text-2xl font-bold text-[#A61D24] mb-4">專案不存在或已結案</h1>
        <p className="text-muted-foreground tracking-widest mb-8">此專款專案目前未開放，或網址有誤。</p>
        <button onClick={() => router.push("/")} className="bg-[#1A432D] text-white px-8 py-3 rounded-xl font-bold tracking-widest">返回首頁</button>
      </div>
    </div>
  );

  if (isSuccess) return (
    <main className="min-h-screen bg-background pt-12 pb-16 px-4 flex items-center justify-center">
      
      <style>{`#global-cart-btn { display: none !important; }`}</style>

      <div className="w-full max-w-md relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        
        <div className="bg-[#1A432D]/90 text-[#D89F3C] border border-[#D89F3C]/50 text-xs font-bold py-2.5 px-4 rounded-xl mb-4 flex items-center justify-center gap-2 shadow-lg w-full max-w-[280px]">
           <Camera size={14} className="shrink-0" />
           <span className="tracking-widest">貼心小提示：可截圖保存此祈福印記</span>
        </div>

        {/* 💡 終極絕對鎖定防禦陣型 (套用您親自校準的 175x300 完美參數) */}
        <div className="relative w-full max-w-[360px] drop-shadow-2xl mx-auto overflow-hidden rounded-xl bg-background">
          
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

          {/* T1: Top Header */}
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

          {/* T2: Right Column */}
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

          {/* T3: Left Column */}
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

          {/* T4: Body Right - 大德 */}
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
            <span className="font-bold text-[11px] md:text-[12px] tracking-widest leading-snug">{targetName || name}</span>
          </div>

          {/* T6: Body Sub - 項目 */}
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
            <span className="font-bold text-[11px] md:text-[12px] tracking-widest leading-snug">{project.title}</span>
          </div>

          {/* T5-A: Body Left - 方案標題 */}
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

          {/* T5-B: Body Left - 方案黑字內容 */}
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
            <span className="font-bold text-[11px] md:text-[12px] leading-[2.5] tracking-widest whitespace-pre-wrap break-all">
              {project.options[selectedOptIdx].title}
            </span>
          </div>

          {/* T7: Footer */}
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

        <button onClick={() => router.push("/")} className="w-full max-w-[320px] mt-8 bg-[#1A432D] text-[#D89F3C] py-4 rounded-xl font-bold tracking-widest hover:bg-[#122F20] transition-colors shadow-md">
          返回首頁
        </button>

      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-background pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto bg-card rounded-[2.5rem] shadow-xl border-2 border-[#D89F3C]/20 overflow-hidden relative z-10">
        
        {project.image_url && (
          <div className="w-full h-64 md:h-96 relative bg-stone-100">
            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <span className="bg-[#D89F3C] text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-widest shadow-md">
                專款專用獨立專案
              </span>
            </div>
          </div>
        )}

        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A432D] tracking-wide leading-snug mb-6">
            {project.title}
          </h1>
          <p className="text-stone-600 leading-loose whitespace-pre-wrap text-lg mb-10 text-justify">
            {project.description}
          </p>

          <div className="w-full h-[1px] bg-stone-200 mb-10"></div>

          <form onSubmit={handleSubmit} className="space-y-10">
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1A432D] tracking-widest border-l-4 border-[#D89F3C] pl-3">第一步：選擇護持方案</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {project.options.map((opt: any, idx: number) => (
                  <label key={idx} className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedOptIdx === idx ? 'border-[#D89F3C] bg-amber-50/30 shadow-md' : 'border-stone-100 bg-muted hover:border-stone-300'}`}>
                    <input type="radio" name="project_option" className="sr-only" checked={selectedOptIdx === idx} onChange={() => setSelectedOptIdx(idx)} />
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold ${selectedOptIdx === idx ? 'text-[#1A432D]' : 'text-stone-600'}`}>{opt.title}</span>
                      {selectedOptIdx === idx && <div className="w-3 h-3 rounded-full bg-[#D89F3C]"></div>}
                    </div>
                    <span className="text-[#A61D24] font-bold font-mono">
                      {opt.price > 0 ? `$${opt.price}` : '自由隨喜填寫'}
                    </span>
                  </label>
                ))}
              </div>

              {project.options[selectedOptIdx].price === 0 && (
                <div className="animate-in fade-in slide-in-from-top-4 mt-4 bg-card border-2 border-[#D89F3C] shadow-sm p-5 rounded-2xl flex items-center gap-4 transition-all">
                  <span className="font-bold text-foreground tracking-widest whitespace-nowrap">護持金額 $</span>
                  <input type="number" required min="1" value={customAmount} onChange={e=>setCustomAmount(e.target.value)} placeholder="請輸入金額" className="w-full text-xl font-bold text-[#A61D24] outline-none bg-transparent placeholder:text-stone-400 placeholder:font-medium"/>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1A432D] tracking-widest border-l-4 border-[#D89F3C] pl-3">第二步：請匯款至專屬對帳戶</h3>
              <div className="bg-gradient-to-br from-[#D89F3C] to-[#c48d2e] text-white p-8 rounded-2xl shadow-lg tracking-wider relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-card opacity-10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
                <p className="text-sm text-white/90 mb-3 font-bold drop-shadow-sm relative z-10">本專案不與購物車合併，請獨立匯款至：</p>
                <p className="text-2xl md:text-3xl font-mono font-bold select-all drop-shadow-md relative z-10">{project.bank_info}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1A432D] tracking-widest border-l-4 border-[#D89F3C] pl-3">第三步：填寫登記資料</h3>
              
              {!session && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                  <p className="text-sm font-bold text-amber-800 tracking-widest">登入 LINE 可快速帶入資料</p>
                  <button type="button" onClick={() => signIn("line")} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest shadow-sm hover:bg-amber-700 transition-colors">立即登入</button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">聯絡人姓名</label>
                  <input required value={name} onChange={e=>setName(e.target.value)} placeholder="請填寫聯絡人" className="w-full bg-card border-2 border-border p-4 rounded-xl outline-none focus:border-[#D89F3C] focus:ring-4 focus:ring-[#D89F3C]/10 font-bold text-foreground placeholder:text-stone-400 placeholder:font-medium shadow-sm transition-all"/>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">祈福對象 <span className="text-stone-400 font-normal">(選填)</span></label>
                  <input value={targetName} onChange={e=>setTargetName(e.target.value)} placeholder="若同聯絡人請留白" className="w-full bg-card border-2 border-border p-4 rounded-xl outline-none focus:border-[#D89F3C] focus:ring-4 focus:ring-[#D89F3C]/10 font-bold text-foreground placeholder:text-stone-400 placeholder:font-medium shadow-sm transition-all"/>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">聯絡電話</label>
                  <input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="請輸入電話" className="w-full bg-card border-2 border-border p-4 rounded-xl outline-none focus:border-[#D89F3C] focus:ring-4 focus:ring-[#D89F3C]/10 font-bold text-foreground placeholder:text-stone-400 placeholder:font-medium shadow-sm transition-all"/>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">出生年月日</label>
                  <input required value={birthDate} onChange={e=>setBirthDate(e.target.value)} placeholder="例：1990/01/01" className="w-full bg-card border-2 border-border p-4 rounded-xl outline-none focus:border-[#D89F3C] focus:ring-4 focus:ring-[#D89F3C]/10 font-bold text-foreground placeholder:text-stone-400 placeholder:font-medium shadow-sm transition-all"/>
                </div>
                
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">居住地址</label>
                  <input required value={address} onChange={e=>setAddress(e.target.value)} placeholder="請輸入完整地址" className="w-full bg-card border-2 border-border p-4 rounded-xl outline-none focus:border-[#D89F3C] focus:ring-4 focus:ring-[#D89F3C]/10 font-bold text-foreground placeholder:text-stone-400 placeholder:font-medium shadow-sm transition-all"/>
                </div>
                
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground tracking-widest ml-1">祈福心願 / 備註留言 <span className="text-stone-400 font-normal">(選填)</span></label>
                  <textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder="例如：祈求玉帝保佑家人平安健康" rows={3} className="w-full bg-card border-2 border-border p-4 rounded-xl outline-none focus:border-[#D89F3C] focus:ring-4 focus:ring-[#D89F3C]/10 font-bold text-foreground placeholder:text-stone-400 placeholder:font-medium shadow-sm transition-all resize-none"></textarea>
                </div>

                <div className="md:col-span-2 relative mt-2">
                   <input required value={bankLast5} onChange={e=>setBankLast5(e.target.value)} placeholder="您剛剛匯款的帳號後五碼" maxLength={5} className="w-full bg-amber-50/50 border-2 border-amber-200 p-5 rounded-xl outline-none focus:border-[#D89F3C] focus:ring-4 focus:ring-[#D89F3C]/20 font-bold text-amber-900 placeholder:text-amber-400 placeholder:font-medium shadow-sm transition-all text-lg"/>
                   <span className="absolute right-5 top-5 text-sm font-bold text-amber-600/60 bg-amber-100/50 px-2 py-0.5 rounded">供財務對帳</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100 flex flex-col gap-4">
              <button disabled={isSubmitting} type="submit" className="w-full bg-[#1A432D] hover:bg-[#122F20] text-[#D89F3C] py-6 rounded-2xl font-bold text-lg tracking-widest shadow-lg transition-all disabled:opacity-50 hover:-translate-y-1">
                {isSubmitting ? "資料處理中..." : "確認資料無誤，立即送出登記"}
              </button>
            </div>
          </form>
          
          <div className="mt-10 flex justify-center">
             <ShareButton title={project.title} />
          </div>
        </div>
      </div>
    </main>
  );
}