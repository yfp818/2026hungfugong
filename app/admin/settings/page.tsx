"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. 首頁按鈕設定 ---
  const [servicesList, setServicesList] = useState<any[]>([]); 
  const [editSrvId, setEditSrvId] = useState<string|null>(null);
  const [srvTitle, setSrvTitle] = useState(""); 
  const [srvDesc, setSrvDesc] = useState("");
  const [srvAction, setSrvAction] = useState(""); 
  const [srvLink, setSrvLink] = useState("/");
  const [isAddingSrv, setIsAddingSrv] = useState(false);

  // --- 2. 點燈與代燒品項 ---
  const [productsList, setProductsList] = useState<any[]>([]);
  const [pCategory, setPCategory] = useState("lamp"); 
  const [pTitle, setPTitle] = useState("");
  const [pPrice, setPPrice] = useState(0); 
  const [pDesc, setPDesc] = useState("");
  const [pPreviewUrl, setPPreviewUrl] = useState(""); 
  const [pImageFile, setPImageFile] = useState<File|null>(null);
  const [editPId, setEditPId] = useState<string|null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // --- 3. 活動專用帳戶 ---
  const [campaignBanks, setCampaignBankAccounts] = useState<any[]>([]);
  const [cbName, setCbName] = useState(""); 
  const [cbNum, setCbNumber] = useState(""); 
  const [cbAlias, setCbAlias] = useState("");

  // --- 4. 限時快閃活動 ---
  const [flashCampaignsList, setFlashCampaignsList] = useState<any[]>([]);
  const [fcTitle, setFcTitle] = useState(""); 
  const [fcDesc, setFcDesc] = useState(""); 
  const [fcBankId, setFcBankId] = useState(""); 
  const [fcPreviewUrl, setFcPreviewUrl] = useState(""); 
  const [fcImageFile, setFcImageFile] = useState<File|null>(null);
  const [fcOptions, setFcOptions] = useState<any[]>([{ title: "", price: 0 }]);
  const [editFcId, setEditFcId] = useState<string|null>(null);
  const [fcSplash, setFcSplash] = useState(false); 

  // --- 5. 獨立專款專案 ---
  const [spList, setSpList] = useState<any[]>([]);
  const [spTitle, setSpTitle] = useState("");
  const [spDesc, setSpDesc] = useState("");
  const [spBankInfo, setSpBankInfo] = useState("");
  const [spPreviewUrl, setSpPreviewUrl] = useState("");
  const [spImageFile, setSpImageFile] = useState<File|null>(null);
  const [spOptions, setSpOptions] = useState<any[]>([{ title: "隨喜", price: 0 }]);
  const [editSpId, setEditSpId] = useState<string|null>(null);

  async function fetchData() {
    setIsLoading(true);
    const [srv, prods, cbData, fcData, spData] = await Promise.all([
      supabase.from("blessing_services").select("*").order("created_at", { ascending: true }),
      supabase.from("blessing_products").select("*").order("category", { ascending: true }),
      supabase.from("campaign_bank_accounts").select("*").order("created_at", { ascending: false }),
      supabase.from("flash_campaigns").select("*, campaign_bank_accounts(*)").order("created_at", { ascending: false }),
      supabase.from("special_projects").select("*").order("created_at", { ascending: false })
    ]);

    if (srv.data) setServicesList(srv.data);
    if (prods.data) setProductsList(prods.data);
    if (cbData.data) { 
      setCampaignBankAccounts(cbData.data); 
      if(cbData.data.length > 0 && !fcBankId) setFcBankId(cbData.data[0].id); 
    }
    if (fcData.data) setFlashCampaignsList(fcData.data);
    if (spData.data) setSpList(spData.data);
    
    setIsLoading(false);
  }
  
  useEffect(() => { fetchData(); }, []);

  // ========== API 動作 ==========

  const handleSaveService = async () => { 
    setIsAddingSrv(true); 
    try {
      if (editSrvId) await supabase.from("blessing_services").update({ title: srvTitle, description: srvDesc, action_text: srvAction, link_url: srvLink }).eq("id", editSrvId); 
      else await supabase.from("blessing_services").insert([{ title: srvTitle, description: srvDesc, action_text: srvAction, link_url: srvLink }]); 
      alert("祈福項目已儲存。"); 
      setEditSrvId(null); setSrvTitle(""); setSrvLink("");
      fetchData(); 
    } catch (err: any) { alert("儲存發生錯誤: " + err.message); } 
    finally { setIsAddingSrv(false); }
  };

  const handleSaveProduct = async () => {
    if (!pTitle) return alert("請輸入商品名稱");
    setIsAddingProduct(true);
    try {
      let url = pPreviewUrl;
      if (pImageFile) { 
        const name = `prod_${Date.now()}`; 
        const { error: uploadError } = await supabase.storage.from('images').upload(name, pImageFile); 
        if (uploadError) throw new Error("圖片上傳失敗：" + uploadError.message); 
        url = supabase.storage.from('images').getPublicUrl(name).data.publicUrl; 
      }
      if (editPId) { await supabase.from("blessing_products").update({ category: pCategory, title: pTitle, price: pPrice, description: pDesc, image_url: url }).eq("id", editPId); } 
      else { await supabase.from("blessing_products").insert([{ category: pCategory, title: pTitle, price: pPrice, description: pDesc, image_url: url }]); }
      alert("商品項目儲存成功。"); 
      setEditPId(null); setPTitle(""); setPPrice(0); setPDesc(""); setPPreviewUrl(""); setPImageFile(null);
      fetchData(); 
    } catch (err: any) { alert("儲存發生錯誤: " + err.message); } 
    finally { setIsAddingProduct(false); }
  };

  const handleAddCampaignBank = async () => {
    if(!cbName || !cbNum) return alert("請填寫完整的銀行與帳號名稱");
    await supabase.from("campaign_bank_accounts").insert([{ bank_name: cbName, account_number: cbNum, account_alias: cbAlias || cbName }]);
    setCbName(""); setCbNumber(""); setCbAlias(""); 
    alert("活動指定帳戶已成功增設。"); 
    fetchData();
  };

  // 快閃活動選項管理
  const updateFcOption = (index: number, field: string, value: any) => { const newOptions = [...fcOptions]; newOptions[index] = { ...newOptions[index], [field]: value }; setFcOptions(newOptions); };
  const addFcOption = () => { if (fcOptions.length >= 4) return alert("最多設定 4 種方案"); setFcOptions([...fcOptions, { title: "", price: 0 }]); };
  const removeFcOption = (index: number) => { setFcOptions(fcOptions.filter((_, i) => i !== index)); };

  const handleAddFlashCampaign = async () => {
    if(!fcTitle || !fcBankId) return alert("請輸入活動標題與綁定指定帳戶");
    const validOptions = fcOptions.filter((o: any) => o.title.trim() !== "");
    if(validOptions.length === 0) return alert("請至少填寫一個完整的活動方案名稱");

    try {
      let url = fcPreviewUrl;
      if (fcImageFile) {
        const name = `fc_${Date.now()}`;
        await supabase.storage.from('images').upload(name, fcImageFile);
        url = supabase.storage.from('images').getPublicUrl(name).data.publicUrl;
      }
      if (editFcId) {
        await supabase.from("flash_campaigns").update({ title: fcTitle, description: fcDesc, price: validOptions[0]?.price || 0, options: validOptions, image_url: url, bank_account_id: fcBankId, show_splash: fcSplash }).eq("id", editFcId);
        alert("活動更新成功！");
      } else {
        await supabase.from("flash_campaigns").update({ is_active: false }).neq("title", "completely_empty_target");
        await supabase.from("flash_campaigns").insert([{ title: fcTitle, description: fcDesc, price: validOptions[0]?.price || 0, options: validOptions, image_url: url, bank_account_id: fcBankId, is_active: true, show_splash: fcSplash }]);
        alert("限時快閃活動已成功發布！");
      }
      setEditFcId(null); setFcTitle(""); setFcDesc(""); setFcPreviewUrl(""); setFcOptions([{ title: "", price: 0 }]); setFcImageFile(null); setFcSplash(false);
      fetchData(); 
    } catch (err: any) { alert("儲存發生錯誤: " + err.message); }
  };

  // 獨立專案選項管理
  const updateSpOption = (index: number, field: string, value: any) => { const newOptions = [...spOptions]; newOptions[index] = { ...newOptions[index], [field]: value }; setSpOptions(newOptions); };
  const addSpOption = () => { setSpOptions([...spOptions, { title: "", price: 0 }]); };
  const removeSpOption = (index: number) => { setSpOptions(spOptions.filter((_, i) => i !== index)); };

  const handleSaveSpecialProject = async () => {
    if (!spTitle || !spBankInfo) return alert("請輸入專案標題與專屬匯款帳戶資訊");
    const validOptions = spOptions.filter((o: any) => o.title.trim() !== "");
    if(validOptions.length === 0) return alert("請至少填寫一個認捐方案名稱");

    try {
      let url = spPreviewUrl;
      if (spImageFile) {
        const name = `sp_${Date.now()}`;
        await supabase.storage.from('images').upload(name, spImageFile);
        url = supabase.storage.from('images').getPublicUrl(name).data.publicUrl;
      }
      if (editSpId) {
        await supabase.from("special_projects").update({ title: spTitle, description: spDesc, bank_info: spBankInfo, image_url: url, options: validOptions }).eq("id", editSpId);
        alert("專案更新成功！");
      } else {
        await supabase.from("special_projects").insert([{ title: spTitle, description: spDesc, bank_info: spBankInfo, image_url: url, options: validOptions }]);
        alert("獨立專案發布成功！");
      }
      setEditSpId(null); setSpTitle(""); setSpDesc(""); setSpBankInfo(""); setSpPreviewUrl(""); setSpOptions([{ title: "隨喜", price: 0 }]); setSpImageFile(null);
      fetchData();
    } catch (err: any) { alert("儲存發生錯誤: " + err.message); }
  };

  const handleCopyUrl = (id: string, title: string, isSp: boolean = false) => {
    const url = isSp ? `${window.location.origin}/project/${id}` : `https://liff.line.me/2010604926-zQQVEwEM/campaign/${id}`;
    const shareText = `【${title}】熱烈報名中！\n點此前往專屬報名網址：\n${url}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareText).then(() => alert("已複製專屬連結。"));
    } else {
      prompt("請手動複製以下文案：", shareText);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground font-bold tracking-widest">載入設定資料中...</div>;

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. 祈福專區按鈕設定 */}
      <section className="bg-card text-card-foreground p-6 md:p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-[#1A432D] pl-3">1. 祈福專區按鈕設定 (首頁連結)</h2>
        <div className="bg-muted p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 border border-border">
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">按鈕標題文字</label><input value={srvTitle} onChange={e=>setSrvTitle(e.target.value)} placeholder="例：代燒專區" className="w-full bg-background border border-input p-3 rounded-xl outline-none"/></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">對應連結網址</label><input value={srvLink} onChange={e=>setSrvLink(e.target.value)} placeholder="例：/burning" className="w-full bg-background border border-input p-3 rounded-xl outline-none"/></div>
          <div className="md:col-span-2 flex gap-4">
            <button onClick={handleSaveService} disabled={isAddingSrv} className="flex-1 bg-[#1A432D] text-white py-4 rounded-xl font-bold tracking-widest">{editSrvId ? "儲存更新" : "新增按鈕"}</button>
            {editSrvId && <button onClick={()=>{setEditSrvId(null); setSrvTitle(""); setSrvLink("");}} className="px-6 bg-background border border-border rounded-xl font-bold">取消</button>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicesList.map((s: any) => (
            <div key={s.id} className="flex justify-between items-center border border-border p-4 rounded-xl bg-background shadow-sm">
              <div className="flex flex-col"><span className="font-bold text-[#1A432D]">{s.title}</span><span className="text-xs text-muted-foreground mt-1">{s.link_url}</span></div>
              <div className="flex gap-2">
                <button onClick={()=>{setEditSrvId(s.id); setSrvTitle(s.title); setSrvLink(s.link_url)}} className="px-3 py-1.5 border border-border rounded-lg text-xs font-bold hover:bg-muted">編輯</button>
                <button onClick={async()=>{if(confirm("確定刪除嗎？")){await supabase.from("blessing_services").delete().eq("id",s.id); fetchData();}}} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. 點燈與代燒品項管理 */}
      <section className="bg-card text-card-foreground p-6 md:p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-amber-700 pl-3 text-amber-950">2. 點燈與代燒品項管理</h2>
        <div className="bg-muted p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 border border-border">
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">類別項目</label><select value={pCategory} onChange={e=>setPCategory(e.target.value)} className="w-full border border-border p-3 rounded-xl bg-background font-bold"><option value="lamp">當月點燈祈福</option><option value="burning">代燒服務項目</option></select></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">品項名稱</label><input value={pTitle} onChange={e=>setPTitle(e.target.value)} className="w-full bg-background border border-border p-3 rounded-xl outline-none"/></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">金額 (新台幣)</label><input type="number" value={pPrice} onChange={e=>setPPrice(Number(e.target.value))} className="w-full bg-background border border-border p-3 rounded-xl outline-none"/></div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">簡介說明</label><input value={pDesc} onChange={e=>setPDesc(e.target.value)} className="w-full bg-background border border-border p-3 rounded-xl outline-none"/></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">照片</label><input type="file" onChange={e => {if(e.target.files?.[0]){setPImageFile(e.target.files[0]); setPPreviewUrl(URL.createObjectURL(e.target.files[0]))}}} className="text-sm"/></div>
          <div className="md:col-span-3 flex gap-4">
             <button onClick={handleSaveProduct} disabled={isAddingProduct} className="flex-1 bg-amber-700 text-white py-4 rounded-xl font-bold">{editPId ? "儲存修改" : "新增品項"}</button>
             {editPId && <button onClick={()=>{setEditPId(null); setPTitle(""); setPPrice(0); setPDesc(""); setPPreviewUrl("");}} className="px-6 bg-background border border-border rounded-xl font-bold">取消</button>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {productsList.map((p: any) => (
            <div key={p.id} className="bg-background border border-border p-4 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-start mb-3"><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.category === 'lamp' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{p.category === 'lamp' ? '點燈' : '代燒'}</span><span className="text-[#A61D24] font-bold">${p.price}</span></div>
                {p.image_url && <img src={p.image_url} className="w-full h-32 object-cover rounded-xl mb-3" />}
                <h4 className="font-bold text-foreground mb-1">{p.title}</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border">
                <button onClick={()=>{setEditPId(p.id); setPTitle(p.title); setPPrice(p.price); setPDesc(p.description || ""); setPCategory(p.category); setPPreviewUrl(p.image_url || ""); window.scrollTo({top:0, behavior:'smooth'});}} className="py-2 bg-muted font-bold text-xs rounded-lg">編輯</button>
                <button onClick={async()=>{if(confirm("確定刪除嗎？")){await supabase.from("blessing_products").delete().eq("id", p.id); fetchData();}}} className="py-2 bg-red-50 text-red-600 font-bold text-xs rounded-lg">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 帳戶庫管理 */}
      <section className="bg-card text-card-foreground p-6 md:p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-slate-800 pl-3">3. 活動專用指定帳戶庫管理</h2>
        <div className="bg-muted p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 border border-border">
          <input value={cbAlias} onChange={e=>setCbAlias(e.target.value)} placeholder="簡稱 (例: 法會專戶)" className="bg-background border border-border p-3 rounded-xl outline-none"/>
          <input value={cbName} onChange={e=>setCbName(e.target.value)} placeholder="銀行名稱代碼" className="bg-background border border-border p-3 rounded-xl outline-none"/>
          <input value={cbNum} onChange={e=>setCbNumber(e.target.value)} placeholder="匯款帳號" className="bg-background border border-border p-3 rounded-xl outline-none"/>
          <button onClick={handleAddCampaignBank} className="md:col-span-3 bg-slate-800 text-white py-3 rounded-xl font-bold text-sm">儲存增設為指定快閃帳戶</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {campaignBanks.map((b: any) => (
            <div key={b.id} className="p-4 bg-background border border-border rounded-xl flex justify-between items-center shadow-sm">
              <div><p className="font-bold text-sm">{b.account_alias}</p><p className="text-xs text-muted-foreground font-mono mt-1">{b.bank_name} | {b.account_number}</p></div>
              <button onClick={async()=>{if(confirm("確定刪除？")){await supabase.from("campaign_bank_accounts").delete().eq("id", b.id); fetchData();}}} className="text-xs text-red-500 font-bold px-2 py-1">刪除</button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 限時快閃活動 */}
      <section className="bg-card text-card-foreground p-6 md:p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-purple-900 pl-3">4. 限時快閃活動發布 (合併結帳)</h2>
        <div className="bg-muted p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-border">
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">指定匯款對帳帳戶</label><select value={fcBankId} onChange={e=>setFcBankId(e.target.value)} className="w-full border border-border p-3 rounded-xl bg-background font-bold outline-none">{campaignBanks.map((b: any) => <option key={b.id} value={b.id}>{b.account_alias}</option>)}</select></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">活動標題</label><input value={fcTitle} onChange={e=>setFcTitle(e.target.value)} className="w-full bg-background border border-border p-3 rounded-xl outline-none"/></div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">活動詳細概述</label><input value={fcDesc} onChange={e=>setFcDesc(e.target.value)} className="w-full bg-background border border-border p-3 rounded-xl outline-none"/></div>
          
          <div className="md:col-span-2 border-t border-border pt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold">方案與價格</label>
              <button onClick={addFcOption} className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-lg">新增方案</button>
            </div>
            <div className="space-y-3">
              {fcOptions.map((opt: any, idx: number) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input value={opt.title} onChange={e=>updateFcOption(idx, "title", e.target.value)} placeholder="方案名稱" className="flex-1 bg-background border border-border p-3 rounded-xl outline-none text-sm"/>
                  <input type="number" value={opt.price} onChange={e=>updateFcOption(idx, "price", Number(e.target.value))} placeholder="金額" className="w-24 md:w-32 bg-background border border-border p-3 rounded-xl outline-none text-sm"/>
                  {fcOptions.length > 1 && <button onClick={() => removeFcOption(idx)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl font-bold">×</button>}
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">海報圖片</label><input type="file" onChange={e=>{if(e.target.files?.[0]){setFcImageFile(e.target.files[0]); setFcPreviewUrl(URL.createObjectURL(e.target.files[0]))}}} className="text-xs"/></div>
          <div className="md:col-span-2 flex items-center gap-3 bg-background p-4 rounded-xl border border-border"><input type="checkbox" id="splashToggle" checked={fcSplash} onChange={e => setFcSplash(e.target.checked)} className="w-5 h-5 accent-purple-700" /><label htmlFor="splashToggle" className="text-sm font-bold select-none">啟用「首頁全螢幕前導畫面」</label></div>
          <div className="md:col-span-2 flex gap-3">
            <button onClick={handleAddFlashCampaign} className="flex-1 bg-purple-900 text-white py-4 rounded-xl font-bold tracking-widest text-sm shadow-sm">{editFcId ? "儲存更新" : "發布並推播"}</button>
            {editFcId && <button onClick={() => { setEditFcId(null); setFcTitle(""); setFcDesc(""); setFcPreviewUrl(""); setFcOptions([{ title: "", price: 0 }]); setFcSplash(false);}} className="px-6 bg-background border border-border font-bold rounded-xl text-sm">取消</button>}
          </div>
        </div>
        <div className="space-y-4">
          {flashCampaignsList.map((fc: any) => (
            <div key={fc.id} className="p-5 bg-background border border-border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-2"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${fc.is_active ? 'bg-purple-700' : 'bg-stone-400'}`}>{fc.is_active ? '推播中' : '已結束'}</span><h4 className="font-bold">{fc.title}</h4></div>
                <p className="text-xs text-muted-foreground">方案: {fc.options?.map((o:any) => `${o.title}($${o.price})`).join('、')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleCopyUrl(fc.id, fc.title)} className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-2 rounded-lg">複製連結</button>
                <button onClick={() => {setEditFcId(fc.id); setFcTitle(fc.title); setFcDesc(fc.description||""); setFcPreviewUrl(fc.image_url||""); setFcSplash(fc.show_splash||false); setFcBankId(fc.bank_account_id||""); setFcOptions(fc.options?.length?fc.options:[{title:"", price:fc.price||0}]); window.scrollTo({top:800, behavior:'smooth'});}} className="text-xs font-bold bg-muted px-3 py-2 rounded-lg">編輯</button>
                <button onClick={async()=>{if(confirm("確定刪除？")){await supabase.from("flash_campaigns").delete().eq("id", fc.id); fetchData();}}} className="text-xs font-bold bg-red-50 text-red-600 px-3 py-2 rounded-lg">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 獨立專款專案 */}
      <section className="bg-card text-card-foreground p-6 md:p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-blue-700 pl-3">5. 獨立專款專案管理 (如: 建廟基金)</h2>
        <div className="bg-muted p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-border">
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">主標題</label><input value={spTitle} onChange={e=>setSpTitle(e.target.value)} className="w-full bg-background border border-border p-3 rounded-xl outline-none"/></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">專屬匯款帳戶</label><input value={spBankInfo} onChange={e=>setSpBankInfo(e.target.value)} className="w-full bg-background border border-border p-3 rounded-xl outline-none"/></div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">專案詳細說明</label><textarea value={spDesc} onChange={e=>setSpDesc(e.target.value)} className="w-full bg-background border border-border p-3 rounded-xl h-24 outline-none"/></div>
          
          <div className="md:col-span-2 border-t border-border pt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold">認捐方案與價格</label>
              <button onClick={addSpOption} className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg">新增方案</button>
            </div>
            <div className="space-y-3">
              {spOptions.map((opt: any, idx: number) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input value={opt.title} onChange={e=>updateSpOption(idx, "title", e.target.value)} placeholder="方案名稱" className="flex-1 bg-background border border-border p-3 rounded-xl outline-none text-sm"/>
                  <input type="number" value={opt.price} onChange={e=>updateSpOption(idx, "price", Number(e.target.value))} placeholder="金額 (0為隨喜)" className="w-24 md:w-32 bg-background border border-border p-3 rounded-xl outline-none text-sm"/>
                  {spOptions.length > 1 && <button onClick={() => removeSpOption(idx)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl font-bold">×</button>}
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">圖片</label><input type="file" onChange={e=>{if(e.target.files?.[0]){setSpImageFile(e.target.files[0]); setSpPreviewUrl(URL.createObjectURL(e.target.files[0]))}}} className="text-xs"/></div>
          <div className="md:col-span-2 flex gap-3">
            <button onClick={handleSaveSpecialProject} className="flex-1 bg-blue-700 text-white py-4 rounded-xl font-bold tracking-widest text-sm shadow-sm">{editSpId ? "儲存更新" : "發布專案"}</button>
            {editSpId && <button onClick={() => { setEditSpId(null); setSpTitle(""); setSpDesc(""); setSpBankInfo(""); setSpOptions([{ title: "隨喜", price: 0 }]);}} className="px-6 bg-background border border-border font-bold rounded-xl text-sm">取消</button>}
          </div>
        </div>
        <div className="space-y-4">
          {spList.map((sp: any) => (
            <div key={sp.id} className="p-5 bg-background border border-border rounded-2xl flex justify-between items-center shadow-sm">
              <div>
                <h4 className="font-bold mb-1">{sp.title}</h4>
                <p className="text-xs text-muted-foreground">帳戶: {sp.bank_info}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleCopyUrl(sp.id, sp.title, true)} className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-2 rounded-lg">複製連結</button>
                <button onClick={() => {setEditSpId(sp.id); setSpTitle(sp.title); setSpDesc(sp.description||""); setSpBankInfo(sp.bank_info||""); setSpOptions(sp.options?.length?sp.options:[{title:"隨喜",price:0}]); window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'});}} className="text-xs font-bold bg-muted px-3 py-2 rounded-lg">編輯</button>
                <button onClick={async()=>{if(confirm("確定刪除？")){await supabase.from("special_projects").delete().eq("id", sp.id); fetchData();}}} className="text-xs font-bold bg-red-50 text-red-600 px-3 py-2 rounded-lg">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}