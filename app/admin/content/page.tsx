"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ContentPage() {
  const [isLoading, setIsLoading] = useState(true);

  // --- 主視覺狀態 ---
  const [title, setTitle] = useState(""); 
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState(""); 
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [bgOpacity, setBgOpacity] = useState(40);
  const [isSavingHero, setIsSavingHero] = useState(false);

  // --- 公告狀態 ---
  const [newsList, setNewsList] = useState<any[]>([]); 
  const [editNewsId, setEditNewsId] = useState<string|null>(null);
  const [addNewsTitle, setAddNewsTitle] = useState(""); 
  const [addNewsContent, setAddNewsContent] = useState("");
  const [addNewsCategory, setAddNewsCategory] = useState("news");
  const [addNewsPreviewUrl, setAddNewsPreviewUrl] = useState(""); 
  const [addNewsImageFile, setAddNewsImageFile] = useState<File|null>(null);
  const [addNewsActionUrl, setAddNewsActionUrl] = useState(""); 
  const [isAddingNews, setIsAddingNews] = useState(false);

  // --- 頁尾狀態 ---
  const [address, setAddress] = useState(""); 
  const [phone, setPhone] = useState("");
  const [lineUrl, setLineUrl] = useState("https://lin.ee/uHaPx59"); 
  const [igUrl, setIgUrl] = useState("");
  const [bankName, setBankName] = useState(""); 
  const [bankAccount, setBankAccount] = useState("");
  const [showBankInfo, setShowBankInfo] = useState(false);
  const [isSavingFooter, setIsSavingFooter] = useState(false);

  async function fetchData() {
    setIsLoading(true);
    // 獲取主視覺
    const { data: intro } = await supabase.from("site_content").select("*").eq("id", "homepage_intro").single();
    if (intro) { setTitle(intro.title || ""); setContent(intro.content || ""); setPreviewUrl(intro.image_url || ""); setBgOpacity(intro.bg_opacity || 40); }
    
    // 獲取公告
    const { data: news } = await supabase.from("news_events").select("*").order("created_at", { ascending: false });
    if (news) setNewsList(news);

    // 獲取頁尾
    const { data: footerData } = await supabase.from("site_content").select("*").eq("id", "site_footer").single();
    if (footerData?.content) {
      try {
        const parsed = JSON.parse(footerData.content);
        if(parsed.address) setAddress(parsed.address); if(parsed.phone) setPhone(parsed.phone);
        if(parsed.lineUrl) setLineUrl(parsed.lineUrl); if(parsed.igUrl) setIgUrl(parsed.igUrl);
        if(parsed.bankName) setBankName(parsed.bankName); if(parsed.bankAccount) setBankAccount(parsed.bankAccount);
        if(parsed.showBankInfo !== undefined) setShowBankInfo(parsed.showBankInfo);
      } catch (e) {}
    }
    setIsLoading(false);
  }
  
  useEffect(() => { fetchData(); }, []);

  // ========== API 動作 ==========

  const handleSaveHero = async () => { 
    setIsSavingHero(true); 
    try {
      let url = previewUrl; 
      if (imageFile) { 
        const name = `hero_${Date.now()}`; 
        const { error: uploadError } = await supabase.storage.from('images').upload(name, imageFile); 
        if (uploadError) throw new Error("圖片上傳失敗：" + uploadError.message);
        url = supabase.storage.from('images').getPublicUrl(name).data.publicUrl; 
      } 
      const { error: dbError } = await supabase.from("site_content").upsert({ id: "homepage_intro", title, content, image_url: url, bg_opacity: bgOpacity }); 
      if (dbError) throw new Error("資料庫更新失敗：" + dbError.message);
      alert("主視覺更新成功。"); 
      fetchData(); 
    } catch (err: any) { alert("發生錯誤：" + err.message); } 
    finally { setIsSavingHero(false); }
  };
  
  const handleSaveNews = async () => { 
    setIsAddingNews(true); 
    try {
      let url = addNewsPreviewUrl; 
      if (addNewsImageFile) { 
        const name = `news_${Date.now()}`; 
        await supabase.storage.from('images').upload(name, addNewsImageFile); 
        url = supabase.storage.from('images').getPublicUrl(name).data.publicUrl; 
      } 
      if (editNewsId) { 
        await supabase.from("news_events").update({ title: addNewsTitle, content: addNewsContent, image_url: url, category: addNewsCategory, action_url: addNewsActionUrl }).eq("id", editNewsId); 
      } else { 
        await supabase.from("news_events").insert([{ title: addNewsTitle, content: addNewsContent, image_url: url, category: addNewsCategory, action_url: addNewsActionUrl }]); 
      } 
      alert("發布成功。"); 
      
      // 清空表單並重新抓取
      setEditNewsId(null); setAddNewsTitle(""); setAddNewsContent(""); setAddNewsPreviewUrl(""); setAddNewsImageFile(null); setAddNewsActionUrl("");
      fetchData(); 
    } catch (err: any) { alert("儲存發生錯誤: " + err.message); } 
    finally { setIsAddingNews(false); }
  };
  
  const handleSaveFooter = async () => { 
    setIsSavingFooter(true); 
    try {
      const footerJsonString = JSON.stringify({ address, phone, lineUrl, igUrl, bankName, bankAccount, showBankInfo }); 
      await supabase.from("site_content").upsert({ id: "site_footer", title: "頁尾聯絡資訊", content: footerJsonString }); 
      alert("頁尾更新成功."); 
    } catch (err: any) { alert("儲存發生錯誤: " + err.message); } 
    finally { setIsSavingFooter(false); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground font-bold tracking-widest">載入網站內容中...</div>;
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. 首頁主視覺 */}
      <section className="bg-card text-card-foreground p-6 md:p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-[#A61D24] dark:border-red-500 pl-3">1. 首頁主視覺</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <textarea value={title} onChange={e=>setTitle(e.target.value)} placeholder="大標題" className="w-full bg-background border border-border p-4 rounded-xl h-32 outline-none focus:border-[#A61D24] dark:focus:border-red-400 transition-colors"/>
            <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="次標題" className="w-full bg-background border border-border p-4 rounded-xl h-32 outline-none focus:border-[#A61D24] dark:focus:border-red-400 transition-colors"/>
          </div>
          
          <div className="space-y-4">
            {/* 💡 修正 1：主視覺照片上傳區塊 (隱藏輸入框、固定高度、加入 accept) */}
            <div className="relative w-full h-48 border-2 border-dashed border-border rounded-xl bg-muted overflow-hidden flex flex-col items-center justify-center hover:bg-muted/80 transition-colors">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-contain" alt="預覽圖" />
              ) : (
                <div className="text-center space-y-2 pointer-events-none">
                  <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <p className="text-sm font-bold text-muted-foreground tracking-widest">點擊選擇照片</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={e => {
                  if(e.target.files?.[0]){
                    setImageFile(e.target.files[0]); 
                    setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                  }
                }} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[16px]"
              />
            </div>
            
            <div>
              <label className="flex justify-between text-sm font-bold tracking-widest text-muted-foreground mb-2">
                <span>遮罩濃度</span>
                <span className="text-foreground">{bgOpacity}%</span>
              </label>
              <input type="range" value={bgOpacity} onChange={e=>setBgOpacity(Number(e.target.value))} className="w-full accent-[#A61D24]"/>
            </div>
          </div>
        </div>
        <button onClick={handleSaveHero} disabled={isSavingHero} className="w-full bg-[#A61D24] hover:bg-red-800 text-white py-5 font-bold tracking-widest rounded-xl transition-colors shadow-sm">{isSavingHero?"處理中...":"儲存主視覺"}</button>
      </section>

      {/* 2. 活動與公告管理 */}
      <section className="bg-card text-card-foreground p-6 md:p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-[#D89F3C] pl-3">2. 本宮活動與公告管理</h2>
        <div className="bg-muted text-muted-foreground p-6 rounded-2xl border border-border space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select value={addNewsCategory} onChange={e=>setAddNewsCategory(e.target.value)} className="border border-border p-3 rounded-xl bg-background text-foreground font-bold outline-none"><option value="news">一般公告 (純文字列表)</option><option value="event">重點活動 (附海報大圖)</option></select>
            <input value={addNewsTitle} onChange={e=>setAddNewsTitle(e.target.value)} placeholder="請輸入標題" className="flex-1 bg-background text-foreground border border-border p-3 rounded-xl outline-none focus:border-[#D89F3C] transition-colors"/>
          </div>
          <div><input value={addNewsActionUrl} onChange={e => setAddNewsActionUrl(e.target.value)} placeholder="專屬活動報名連結 (選填，例：/lamps)" className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none focus:border-[#D89F3C] transition-colors"/></div>
          <textarea value={addNewsContent} onChange={e=>setAddNewsContent(e.target.value)} placeholder="內文支援換行" className="w-full bg-background text-foreground border border-border p-4 rounded-xl h-32 outline-none focus:border-[#D89F3C] transition-colors"/>
          
          {/* 💡 修正 2：公告圖片上傳區塊 */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-2">上傳活動海報或配圖</label>
            <div className="relative w-full h-40 border-2 border-dashed border-border rounded-xl bg-background overflow-hidden flex flex-col items-center justify-center hover:bg-background/80 transition-colors">
              {addNewsPreviewUrl ? (
                <img src={addNewsPreviewUrl} className="w-full h-full object-contain" alt="預覽圖" />
              ) : (
                <div className="text-center space-y-2 pointer-events-none">
                  <p className="text-sm font-bold text-muted-foreground tracking-widest">+ 點擊選擇照片</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={e => {
                  if(e.target.files?.[0]){
                    setAddNewsImageFile(e.target.files[0]); 
                    setAddNewsPreviewUrl(URL.createObjectURL(e.target.files[0]));
                  }
                }} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[16px]"
              />
            </div>
          </div>
          
          <div className="flex gap-4 pt-2">
            <button onClick={handleSaveNews} disabled={isAddingNews} className="flex-1 bg-[#D89F3C] hover:bg-amber-600 text-white py-5 rounded-xl font-bold tracking-widest transition-colors shadow-sm">{editNewsId?"儲存公告更新":"正式發布公告"}</button>
            {editNewsId && (
              <button onClick={() => {setEditNewsId(null); setAddNewsTitle(""); setAddNewsContent(""); setAddNewsPreviewUrl(""); setAddNewsCategory("news"); setAddNewsActionUrl("");}} className="px-6 bg-background border border-border text-foreground rounded-xl font-bold tracking-widest hover:bg-muted transition-colors">取消編輯</button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {newsList.map((n: any) => (
            <div key={n.id} className="flex flex-col md:flex-row md:items-center justify-between border border-border p-4 rounded-xl gap-4 hover:shadow-sm bg-background transition-shadow">
              <div className="flex items-center">
                <span className={`text-[10px] md:text-xs px-3 py-1 rounded-full mr-4 text-white font-bold whitespace-nowrap ${n.category === 'event' ? 'bg-[#D89F3C]' : 'bg-stone-400'}`}>{n.category === 'event' ? '重點活動' : '一般公告'}</span>
                <span className="font-bold text-[#1A432D] dark:text-emerald-400 line-clamp-1">{n.title}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={()=>{ setEditNewsId(n.id); setAddNewsTitle(n.title); setAddNewsContent(n.content); setAddNewsPreviewUrl(n.image_url); setAddNewsCategory(n.category || 'news'); setAddNewsActionUrl(n.action_url || ""); window.scrollTo({ top: 400, behavior: 'smooth' });}} className="px-4 py-2 border border-border rounded-lg text-xs md:text-sm font-bold text-foreground hover:bg-muted transition-colors">編輯</button>
                <button onClick={async()=>{if(confirm("確定要刪除嗎？")){await supabase.from("news_events").delete().eq("id",n.id); fetchData();}}} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs md:text-sm font-bold hover:bg-red-600 hover:text-white transition-colors">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 頁尾聯絡資訊 */}
      <section className="bg-card text-card-foreground p-6 md:p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-slate-700 pl-3">3. 頁尾聯絡資訊管理</h2>
        <div className="bg-muted text-muted-foreground p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-border">
          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">宮廟實體地址</label><input value={address} onChange={e=>setAddress(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none focus:border-slate-500 transition-colors"/></div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">電話或自訂提示文案</label><input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none focus:border-slate-500 transition-colors"/></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">官方 LINE 連結網址</label><input value={lineUrl} onChange={e=>setLineUrl(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none focus:border-slate-500 transition-colors"/></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">官方 IG 連結網址</label><input value={igUrl} onChange={e=>setIgUrl(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none focus:border-slate-500 transition-colors"/></div>
          
          <div className="md:col-span-2 border-t border-border pt-6 mt-2">
            <div className="flex items-center justify-between mb-6 bg-background text-foreground p-5 rounded-xl border border-border">
                <p className="font-bold tracking-widest text-sm md:text-base">開放匯款與捐獻帳戶資訊</p>
                <input type="checkbox" checked={showBankInfo} onChange={e=>setShowBankInfo(e.target.checked)} className="w-5 h-5 accent-slate-700"/>
            </div>
            {showBankInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-muted-foreground mb-2">銀行名稱與代碼</label><input value={bankName} onChange={e=>setBankName(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none focus:border-slate-500 transition-colors"/></div>
                <div><label className="block text-xs font-bold text-muted-foreground mb-2">匯款帳號</label><input value={bankAccount} onChange={e=>setBankAccount(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none focus:border-slate-500 transition-colors"/></div>
              </div>
            )}
          </div>
          <button onClick={handleSaveFooter} disabled={isSavingFooter} className="bg-slate-800 hover:bg-slate-900 text-white md:col-span-2 py-5 rounded-xl font-bold tracking-widest transition-colors shadow-sm">儲存頁尾資訊</button>
        </div>
      </section>
    </div>
  );
}