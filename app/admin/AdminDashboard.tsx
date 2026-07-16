"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [isAddingSrv, setIsAddingSrv] = useState(false);
  const [isSavingFooter, setIsSavingFooter] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const [title, setTitle] = useState(""); 
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState(""); 
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [bgOpacity, setBgOpacity] = useState(40);
  
  const [newsList, setNewsList] = useState<any[]>([]); 
  const [editNewsId, setEditNewsId] = useState<string|null>(null);
  const [addNewsTitle, setAddNewsTitle] = useState(""); 
  const [addNewsContent, setAddNewsContent] = useState("");
  const [addNewsCategory, setAddNewsCategory] = useState("news");
  const [addNewsPreviewUrl, setAddNewsPreviewUrl] = useState(""); 
  const [addNewsImageFile, setAddNewsImageFile] = useState<File|null>(null);
  const [addNewsActionUrl, setAddNewsActionUrl] = useState(""); 
  
  const [servicesList, setServicesList] = useState<any[]>([]); 
  const [editSrvId, setEditSrvId] = useState<string|null>(null);
  const [srvTitle, setSrvTitle] = useState(""); 
  const [srvDesc, setSrvDesc] = useState("");
  const [srvAction, setSrvAction] = useState(""); 
  const [srvLink, setSrvLink] = useState("/");

  const [address, setAddress] = useState(""); 
  const [phone, setPhone] = useState("");
  const [lineUrl, setLineUrl] = useState(""); 
  const [igUrl, setIgUrl] = useState("");
  const [bankName, setBankName] = useState(""); 
  const [bankAccount, setBankAccount] = useState("");
  const [showBankInfo, setShowBankInfo] = useState(false);

  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  
  const [pCategory, setPCategory] = useState("lamp"); 
  const [pTitle, setPTitle] = useState("");
  const [pPrice, setPPrice] = useState(0); 
  const [pDesc, setPDesc] = useState("");
  const [pPreviewUrl, setPPreviewUrl] = useState(""); 
  const [pImageFile, setPImageFile] = useState<File|null>(null);
  const [editPId, setEditPId] = useState<string|null>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("all");

  const [campaignBanks, setCampaignBankAccounts] = useState<any[]>([]);
  const [flashCampaignsList, setFlashCampaignsList] = useState<any[]>([]);
  const [cbName, setCbName] = useState(""); 
  const [cbNum, setCbNumber] = useState(""); 
  const [cbAlias, setCbAlias] = useState("");
  const [fcTitle, setFcTitle] = useState(""); 
  const [fcDesc, setFcDesc] = useState(""); 
  const [fcBankId, setFcBankId] = useState(""); 
  const [fcPreviewUrl, setFcPreviewUrl] = useState(""); 
  const [fcImageFile, setFcImageFile] = useState<File|null>(null);
  const [fcOptions, setFcOptions] = useState<any[]>([{ title: "", price: 0 }]);
  const [editFcId, setEditFcId] = useState<string|null>(null);
  const [fcSplash, setFcSplash] = useState(false); 

  const [spList, setSpList] = useState<any[]>([]);
  const [spOrdersList, setSpOrdersList] = useState<any[]>([]);
  const [spTitle, setSpTitle] = useState("");
  const [spDesc, setSpDesc] = useState("");
  const [spBankInfo, setSpBankInfo] = useState("");
  const [spPreviewUrl, setSpPreviewUrl] = useState("");
  const [spImageFile, setSpImageFile] = useState<File|null>(null);
  const [spOptions, setSpOptions] = useState<any[]>([{ title: "隨喜認捐", price: 0 }]);
  const [editSpId, setEditSpId] = useState<string|null>(null);

  async function fetchData() {
    const { data: intro } = await supabase.from("site_content").select("*").eq("id", "homepage_intro").single();
    if (intro) { setTitle(intro.title || ""); setContent(intro.content || ""); setPreviewUrl(intro.image_url || ""); setBgOpacity(intro.bg_opacity || 40); }
    
    const { data: news } = await supabase.from("news_events").select("*").order("created_at", { ascending: false });
    if (news) setNewsList(news);
    
    const { data: srv } = await supabase.from("blessing_services").select("*").order("created_at", { ascending: true });
    if (srv) setServicesList(srv);

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

    const { data: orders } = await supabase.from("service_orders").select("*").order("created_at", { ascending: false });
    if (orders) setOrdersList(orders);
    
    const { data: prods } = await supabase.from("blessing_products").select("*").order("category", { ascending: true });
    if (prods) setProductsList(prods);

    const { data: cbData } = await supabase.from("campaign_bank_accounts").select("*").order("created_at", { ascending: false });
    if (cbData) { setCampaignBankAccounts(cbData); if(cbData.length > 0 && !fcBankId) setFcBankId(cbData[0].id); }
    
    const { data: fcData } = await supabase.from("flash_campaigns").select("*, campaign_bank_accounts(*)").order("created_at", { ascending: false });
    if (fcData) setFlashCampaignsList(fcData);

    const { data: spData } = await supabase.from("special_projects").select("*").order("created_at", { ascending: false });
    if (spData) setSpList(spData);
    const { data: spoData } = await supabase.from("special_project_orders").select("*, special_projects(title)").order("created_at", { ascending: false });
    if (spoData) setSpOrdersList(spoData);

    setIsLoadingOrders(false);
  }
  
  useEffect(() => { 
    fetchData(); 
  }, []);

  const allOrderDates = [...ordersList.map(o => o.created_at), ...spOrdersList.map(o => o.created_at)];
  const monthOptions = Array.from(new Set(allOrderDates.map((dateStr: string) => {
    const d = new Date(dateStr); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))).sort().reverse();

  useEffect(() => { if (monthOptions.length > 0 && !selectedMonth) setSelectedMonth(monthOptions[0]); }, [monthOptions]);

  const filteredOrders = ordersList.filter((o: any) => {
    const d = new Date(o.created_at);
    const isMonthMatch = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
    if (!isMonthMatch) return false;

    if (selectedServiceType === 'all') return true;
    if (selectedServiceType === 'lamp') return o.service_type === '當月點燈' || o.service_type === 'lamp';
    if (selectedServiceType === 'burning') return o.service_type === '代燒服務' || o.service_type === 'burning';
    if (selectedServiceType === 'booking') return o.service_type === '濟事問事' || o.service_type === 'booking';
    if (selectedServiceType === 'campaign') return o.service_type === '限時特辦活動' || o.service_type === 'campaign';
    
    return true;
  });

  const filteredSpOrders = spOrdersList.filter((o: any) => {
    const d = new Date(o.created_at);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
  });

  const isShowingSpOrders = selectedServiceType === 'special_project';
  const currentDisplayOrders = isShowingSpOrders ? filteredSpOrders : filteredOrders;

  const totalIncomeCompleted = currentDisplayOrders.filter((o: any) => o.status === 'completed').reduce((sum: number, o: any) => sum + (Number(o.total_price || o.amount) || 0), 0);
  const totalIncomePending = currentDisplayOrders.filter((o: any) => o.status !== 'completed').reduce((sum: number, o: any) => sum + (Number(o.total_price || o.amount) || 0), 0);
  
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
      window.location.reload(); 
    } catch (err: any) {
      alert("發生錯誤：" + err.message);
    } finally {
      setIsSavingHero(false);
    }
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
        await supabase.from("news_events").update({ 
          title: addNewsTitle, content: addNewsContent, image_url: url, category: addNewsCategory, action_url: addNewsActionUrl 
        }).eq("id", editNewsId); 
      } else { 
        await supabase.from("news_events").insert([{ 
          title: addNewsTitle, content: addNewsContent, image_url: url, category: addNewsCategory, action_url: addNewsActionUrl 
        }]); 
      } 
      
      alert("發布成功。"); 
      window.location.reload(); 
    } catch (err: any) {
      alert("儲存發生錯誤: " + err.message);
    } finally {
      setIsAddingNews(false);
    }
  };
  
  const handleSaveService = async () => { 
    setIsAddingSrv(true); 
    try {
      if (editSrvId) await supabase.from("blessing_services").update({ title: srvTitle, description: srvDesc, action_text: srvAction, link_url: srvLink }).eq("id", editSrvId); 
      else await supabase.from("blessing_services").insert([{ title: srvTitle, description: srvDesc, action_text: srvAction, link_url: srvLink }]); 
      alert("祈福項目已儲存。"); 
      window.location.reload(); 
    } catch (err: any) {
      alert("儲存發生錯誤: " + err.message);
    } finally {
      setIsAddingSrv(false);
    }
  };
  
  const handleSaveFooter = async () => { 
    setIsSavingFooter(true); 
    try {
      const footerJsonString = JSON.stringify({ address, phone, lineUrl, igUrl, bankName, bankAccount, showBankInfo }); 
      await supabase.from("site_content").upsert({ id: "site_footer", title: "頁尾聯絡資訊", content: footerJsonString }); 
      alert("頁尾更新成功."); 
      window.location.reload(); 
    } catch (err: any) {
      alert("儲存發生錯誤: " + err.message);
    } finally {
      setIsSavingFooter(false);
    }
  };
  
  const toggleOrderStatus = async (id: string, currentStatus: string, isSp: boolean = false) => { try { const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'; const table = isSp ? "special_project_orders" : "service_orders"; const { error } = await supabase.from(table).update({ status: newStatus }).eq("id", id); if (error) throw error; fetchData(); } catch (err: any) { alert("狀態更新失敗：" + err.message); } };
  const deleteOrder = async (id: string, isSp: boolean = false) => { if(confirm("確定要刪除這筆紀錄嗎？此動作無法復原。")) { try { const table = isSp ? "special_project_orders" : "service_orders"; const { error } = await supabase.from(table).delete().eq("id", id); if (error) throw error; fetchData(); } catch (err: any) { alert("刪除失敗：" + err.message); } } };

  const handleAddCampaignBank = async () => {
    if(!cbName || !cbNum) return alert("請填寫完整的銀行與帳號名稱");
    await supabase.from("campaign_bank_accounts").insert([{ bank_name: cbName, account_number: cbNum, account_alias: cbAlias || cbName }]);
    setCbName(""); setCbNumber(""); setCbAlias(""); alert("活動指定帳戶已成功增設。"); fetchData();
  };

  const updateFcOption = (index: number, field: string, value: any) => {
    const newOptions = [...fcOptions]; newOptions[index] = { ...newOptions[index], [field]: value }; setFcOptions(newOptions);
  };
  const addFcOption = () => { if (fcOptions.length >= 4) return alert("最多設定 4 種方案"); setFcOptions([...fcOptions, { title: "", price: 0 }]); };
  const removeFcOption = (index: number) => { const newOptions = fcOptions.filter((_, i) => i !== index); setFcOptions(newOptions); };

  const handleAddFlashCampaign = async () => {
    if(!fcTitle || !fcBankId) return alert("請輸入活動標題與綁定指定帳戶");
    const validOptions = fcOptions.filter((o: any) => o.title.trim() !== "");
    if(validOptions.length === 0) return alert("請至少填寫一個完整的活動方案名稱");

    try {
      let url = fcPreviewUrl;
      if (fcImageFile) {
        const name = `fc_${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(name, fcImageFile);
        if (uploadError) return alert("圖片上傳失敗：" + uploadError.message);
        url = supabase.storage.from('images').getPublicUrl(name).data.publicUrl;
      }

      if (editFcId) {
        const { error } = await supabase.from("flash_campaigns").update({ 
          title: fcTitle, description: fcDesc, price: validOptions[0]?.price || 0, options: validOptions, image_url: url, bank_account_id: fcBankId, show_splash: fcSplash 
        }).eq("id", editFcId);
        if (error) throw error;
        alert("活動更新成功！");
      } else {
        await supabase.from("flash_campaigns").update({ is_active: false }).neq("title", "completely_empty_target");
        const { error } = await supabase.from("flash_campaigns").insert([{ 
          title: fcTitle, description: fcDesc, price: validOptions[0]?.price || 0, options: validOptions, image_url: url, bank_account_id: fcBankId, is_active: true, show_splash: fcSplash 
        }]);
        if (error) throw error;
        alert("限時快閃活動已成功發布！");
      }
      window.location.reload(); 
    } catch (err: any) {
      alert("儲存發生錯誤: " + err.message);
    }
  };

  const handleSaveProduct = async () => {
    if (!pTitle) return alert("請輸入商品名稱");
    setIsAddingProduct(true);
    try {
      let url = pPreviewUrl;
      if (pImageFile) { const name = `prod_${Date.now()}`; const { error: uploadError } = await supabase.storage.from('images').upload(name, pImageFile); if (uploadError) throw new Error("圖片上傳失敗：" + uploadError.message); url = supabase.storage.from('images').getPublicUrl(name).data.publicUrl; }
      if (editPId) { const { error } = await supabase.from("blessing_products").update({ category: pCategory, title: pTitle, price: pPrice, description: pDesc, image_url: url }).eq("id", editPId); if (error) throw error; } else { const { error } = await supabase.from("blessing_products").insert([{ category: pCategory, title: pTitle, price: pPrice, description: pDesc, image_url: url }]); if (error) throw error; }
      alert("商品項目儲存成功。"); 
      window.location.reload(); 
    } catch (err: any) { 
      alert("儲存發生錯誤: " + err.message); 
      setIsAddingProduct(false); 
    }
  };

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
        const { error } = await supabase.from("special_projects").update({ title: spTitle, description: spDesc, bank_info: spBankInfo, image_url: url, options: validOptions }).eq("id", editSpId);
        if (error) throw error;
        alert("專案更新成功！");
      } else {
        const { error } = await supabase.from("special_projects").insert([{ title: spTitle, description: spDesc, bank_info: spBankInfo, image_url: url, options: validOptions }]);
        if (error) throw error;
        alert("獨立專案發布成功！");
      }
      window.location.reload();
    } catch (err: any) {
      alert("儲存發生錯誤: " + err.message);
    }
  };

  const exportToCSV = () => {
    if (currentDisplayOrders.length === 0) return alert("目前分類下沒有資料可供匯出。");
    const isSp = selectedServiceType === 'special_project';
    const headers = ["建立時間", "服務/專案名稱", "信眾姓名", "聯絡電話", "生日生辰", "地址", "明細/方案", "匯款後五碼", "狀態", "金額"];
    
    const csvContent = [ headers.join(","), ...currentDisplayOrders.map((order: any) => [ 
      new Date(order.created_at).toLocaleString('zh-TW'), 
      isSp ? (order.special_projects?.title || "") : (order.service_type || ""), 
      order.user_name || "", order.user_phone || "", order.birth_date || "", `"${order.address || ""}"`, 
      `"${(order.service_details || "").replace(/\n/g, ' ')}"`, order.bank_last_5 || "", 
      order.status === 'completed' ? '已處理' : '待處理', order.total_price || order.amount || 0 
    ].join(",")) ].join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a"); link.setAttribute("href", URL.createObjectURL(blob)); 
    
    const typeNames: Record<string, string> = { all: "全部", lamp: "點燈", burning: "代燒", booking: "問事", campaign: "特辦活動", special_project: "獨立專款專用" };
    link.setAttribute("download", `皇府宮_${selectedMonth}_${typeNames[selectedServiceType]}_名單.csv`); 
    
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const exportCampaignCSV = (campaignTitle: string) => {
    const campaignOrders = ordersList.filter((o: any) => o.service_details && o.service_details.includes(campaignTitle));
    if (campaignOrders.length === 0) return alert("目前尚無此活動的報名紀錄，或該活動名稱無人報名。");
    
    const headers = ["建立時間", "信眾姓名", "聯絡電話", "生日生辰", "地址", "報名方案與明細", "匯款後五碼", "狀態", "金額"];
    const csvContent = [ headers.join(","), ...campaignOrders.map((order: any) => [ new Date(order.created_at).toLocaleString('zh-TW'), order.user_name || "", order.user_phone || "", order.birth_date || "", `"${order.address || ""}"`, `"${(order.service_details || "").replace(/\n/g, ' ')}"`, order.bank_last_5 || "", order.status === 'completed' ? '已處理' : '待對帳', order.total_price || 0 ].join(",")) ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a"); link.setAttribute("href", URL.createObjectURL(blob)); link.setAttribute("download", `活動名單_${campaignTitle}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleCopyUrl = (id: string, title: string, isSp: boolean = false) => {
    const url = isSp ? `${window.location.origin}/project/${id}` : `https://liff.line.me/2010604926-zQQVEwEM/campaign/${id}`;
    const shareText = `【${title}】熱烈報名中！\n👉 點此前往專屬報名網址：\n${url}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareText).then(() => alert("已複製專屬連結！可以直接貼上 LINE 或 IG 了。"));
    } else {
      const textArea = document.createElement("textarea"); textArea.value = shareText; textArea.style.position = "absolute"; textArea.style.left = "-999999px"; document.body.appendChild(textArea); textArea.select();
      try { document.execCommand('copy'); alert("已複製專屬連結！"); } catch (error) { prompt("請手動複製以下文案：", shareText); } finally { textArea.remove(); }
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 space-y-12 pb-32 animate-in fade-in duration-700">
      <h1 className="text-3xl font-bold text-[#A61D24] dark:text-red-400 tracking-widest border-b border-border pb-4">皇府宮管理後台</h1>
      
      {/* 1. 首頁主視覺 */}
      <section className="bg-card text-card-foreground p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-[#A61D24] dark:border-red-500 pl-3">1. 首頁主視覺</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <textarea value={title} onChange={e=>setTitle(e.target.value)} placeholder="大標題" className="w-full bg-background border border-border p-4 rounded-xl h-32 outline-none focus:border-[#A61D24] dark:focus:border-red-400 transition-colors"/>
            <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="次標題" className="w-full bg-background border border-border p-4 rounded-xl h-32 outline-none focus:border-[#A61D24] dark:focus:border-red-400 transition-colors"/>
          </div>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border p-4 text-center rounded-xl bg-muted text-muted-foreground">
              {previewUrl && <img src={previewUrl} className="max-h-32 mx-auto mb-3 object-cover rounded-lg shadow-sm"/>}
              <input type="file" onChange={e => {if(e.target.files?.[0]){setImageFile(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0]))}}} className="text-sm"/>
            </div>
            <label className="block text-sm font-bold tracking-widest text-muted-foreground">遮罩濃度: {bgOpacity}%</label>
            <input type="range" value={bgOpacity} onChange={e=>setBgOpacity(Number(e.target.value))} className="w-full accent-[#A61D24] dark:accent-red-400"/>
          </div>
        </div>
        <button onClick={handleSaveHero} disabled={isSavingHero} className="w-full bg-[#A61D24] hover:bg-[#85161C] dark:bg-red-700 dark:hover:bg-red-600 text-white py-5 font-bold tracking-widest rounded-xl transition-colors">{isSavingHero?"處理中...":"儲存主視覺"}</button>
      </section>

      {/* 2. 活動專用指定帳戶庫管理 */}
      <section className="bg-card text-card-foreground p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-slate-800 dark:border-slate-400 pl-3 text-slate-900 dark:text-slate-100">2. 活動專用指定帳戶庫管理</h2>
        <div className="bg-muted text-muted-foreground p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 border border-border">
          <input value={cbAlias} onChange={e=>setCbAlias(e.target.value)} placeholder="帳戶簡稱提示 (例: 法會專戶)" className="bg-background text-foreground border border-border p-3 rounded-xl outline-none"/>
          <input value={cbName} onChange={e=>setCbName(e.target.value)} placeholder="銀行名稱代碼" className="bg-background text-foreground border border-border p-3 rounded-xl outline-none"/>
          <input value={cbNum} onChange={e=>setCbNumber(e.target.value)} placeholder="匯款帳號數字" className="bg-background text-foreground border border-border p-3 rounded-xl outline-none"/>
          <button onClick={handleAddCampaignBank} className="md:col-span-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white py-4 rounded-xl font-bold tracking-widest text-sm transition-colors">儲存增設為指定快閃帳戶</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {campaignBanks.map((b: any) => (
            <div key={b.id} className="p-4 bg-card text-card-foreground border border-border rounded-xl flex justify-between items-center shadow-sm">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{b.account_alias}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">{b.bank_name} | {b.account_number}</p>
              </div>
              <button onClick={async()=>{if(confirm("確定刪除此帳戶？")){await supabase.from("campaign_bank_accounts").delete().eq("id",b.id); fetchData();}}} className="text-xs text-red-500 font-bold hover:text-red-700 dark:hover:text-red-400 px-2 py-1 transition-colors">刪除</button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 限時快閃活動發布 */}
      <section className="bg-card text-card-foreground p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-purple-900 dark:border-purple-500 pl-3 text-purple-900 dark:text-purple-400">3. 限時快閃活動發布 (合併結帳系統)</h2>
        <div className="bg-muted text-muted-foreground p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-border">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-2">指定匯款對帳帳戶</label>
            <select value={fcBankId || ""} onChange={e=>setFcBankId(e.target.value)} className="w-full border border-border p-3 rounded-xl bg-background text-foreground outline-none font-bold">
              {campaignBanks.map((b: any) => <option key={b.id} value={b.id}>{b.account_alias}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">限時活動主標題</label><input value={fcTitle} onChange={e=>setFcTitle(e.target.value)} placeholder="例: 虎爺祝壽點燈" className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none"/></div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">活動詳細概述內容</label><input value={fcDesc} onChange={e=>setFcDesc(e.target.value)} placeholder="詳述特辦活動細節與內容" className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none"/></div>
          
          <div className="md:col-span-2 border-t border-border pt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-foreground">設定活動方案與價格</label>
              <button onClick={addFcOption} className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-3 py-1.5 rounded-lg transition-colors">＋ 新增方案</button>
            </div>
            <div className="space-y-3">
              {fcOptions.map((opt: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input value={opt.title} onChange={e=>updateFcOption(idx, "title", e.target.value)} placeholder="方案名稱" className="flex-1 bg-background text-foreground border border-border p-3 rounded-xl outline-none"/>
                  <input type="number" value={opt.price} onChange={e=>updateFcOption(idx, "price", Number(e.target.value))} placeholder="金額" className="w-32 bg-background text-foreground border border-border p-3 rounded-xl outline-none"/>
                  {fcOptions.length > 1 && <button onClick={() => removeFcOption(idx)} className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl font-bold transition-colors">×</button>}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">上傳活動海報圖片</label><input type="file" onChange={e=>{if(e.target.files?.[0]){setFcImageFile(e.target.files[0]); setFcPreviewUrl(URL.createObjectURL(e.target.files[0]))}}} className="text-xs text-muted-foreground mt-1"/></div>
          <div className="md:col-span-2 flex items-center gap-3 bg-card p-4 rounded-xl border border-border"><input type="checkbox" id="splashToggle" checked={fcSplash} onChange={e => setFcSplash(e.target.checked)} className="w-5 h-5 accent-purple-700" /><label htmlFor="splashToggle" className="text-sm font-bold text-foreground select-none">啟用「首頁全螢幕前導(Landing)畫面」強力曝光</label></div>
          <div className="md:col-span-2 flex gap-3">
            <button onClick={handleAddFlashCampaign} className="flex-1 bg-purple-900 hover:bg-purple-950 dark:bg-purple-700 dark:hover:bg-purple-600 text-white py-4 rounded-xl font-bold tracking-widest text-sm shadow-sm transition-colors">{editFcId ? "儲存活動更新" : "發布並推播至首頁焦點"}</button>
            {editFcId && <button onClick={() => { setEditFcId(null); setFcTitle(""); setFcDesc(""); setFcPreviewUrl(""); setFcOptions([{ title: "", price: 0 }]); setFcImageFile(null); setFcSplash(false); setFcBankId(campaignBanks.length > 0 ? campaignBanks[0].id : ""); }} className="px-6 bg-muted hover:bg-muted/80 text-muted-foreground py-4 rounded-xl font-bold tracking-widest text-sm shadow-sm transition-colors">取消編輯</button>}
          </div>
        </div>
        <div className="space-y-4">
          {flashCampaignsList.map((fc: any) => (
            <div key={fc.id} className="p-5 bg-card text-card-foreground border border-border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${fc.is_active ? 'bg-purple-700' : 'bg-stone-400'}`}>{fc.is_active ? '推播中' : '已結束'}</span>{fc.show_splash && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">含前導頁</span>}<h4 className="font-bold text-foreground text-lg">{fc.title}</h4></div>
                <p className="text-xs text-muted-foreground font-mono">方案: {fc.options && Array.isArray(fc.options) ? fc.options.map((o:any) => `${o.title}($${o.price})`).join('、') : `$${fc.price}`}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
                <button onClick={() => handleCopyUrl(fc.id, fc.title)} className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-1">🔗 複製連結</button>
                <button onClick={() => exportCampaignCSV(fc.title)} className="text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg transition-colors">📊 報表</button>
                <button onClick={() => {setEditFcId(fc.id); setFcTitle(fc.title); setFcDesc(fc.description || ""); setFcPreviewUrl(fc.image_url || ""); setFcSplash(fc.show_splash || false); setFcBankId(fc.bank_account_id || (campaignBanks.length > 0 ? campaignBanks[0].id : "")); setFcOptions(fc.options && Array.isArray(fc.options) && fc.options.length > 0 ? fc.options : [{title: "", price: fc.price || 0}]); window.scrollTo({ top: 0, behavior: 'smooth' });}} className="text-xs font-bold bg-muted text-foreground px-4 py-2 rounded-lg transition-colors">編輯</button>
                <button onClick={async()=>{if(confirm("確定刪除此活動？")){await supabase.from("flash_campaigns").delete().eq("id",fc.id); fetchData(); window.location.reload();}}} className="text-xs font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg transition-colors">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 本宮活動與公告管理 */}
      <section className="bg-card text-card-foreground p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-[#D89F3C] pl-3">4. 本宮活動與公告管理</h2>
        <div className="bg-muted text-muted-foreground p-6 rounded-2xl border border-border space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select value={addNewsCategory} onChange={e=>setAddNewsCategory(e.target.value)} className="border border-border p-3 rounded-xl outline-none font-bold text-[#1A432D] dark:text-emerald-400 bg-background text-foreground">
              <option value="news">一般公告 (純文字列表)</option>
              <option value="event">重點活動 (附海報大圖)</option>
            </select>
            <input value={addNewsTitle} onChange={e=>setAddNewsTitle(e.target.value)} placeholder="請輸入標題" className="flex-1 bg-background text-foreground border border-border p-3 rounded-xl outline-none focus:border-[#D89F3C] transition-colors"/>
          </div>
          <div>
            <input value={addNewsActionUrl} onChange={e => setAddNewsActionUrl(e.target.value)} placeholder="專屬活動報名連結 (選填，例：/lamps)" className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none font-medium"/>
          </div>
          <textarea value={addNewsContent} onChange={e=>setAddNewsContent(e.target.value)} placeholder="內文支援換行" className="w-full bg-background text-foreground border border-border p-4 rounded-xl h-32 outline-none focus:border-[#D89F3C]"/>
          <input type="file" onChange={e => {if(e.target.files?.[0]){setAddNewsImageFile(e.target.files[0]); setAddNewsPreviewUrl(URL.createObjectURL(e.target.files[0]))}}} className="text-sm text-muted-foreground"/>
          <button onClick={handleSaveNews} disabled={isAddingNews} className="w-full bg-[#D89F3C] hover:bg-[#c48d2e] dark:bg-amber-600 dark:hover:bg-amber-700 text-white py-5 rounded-xl font-bold tracking-widest transition-colors">{editNewsId?"儲存公告更新":"正式發布公告"}</button>
        </div>
        <div className="space-y-3">
          {newsList.map((n: any) => (
            <div key={n.id} className="flex flex-col md:flex-row md:items-center justify-between border border-border p-4 rounded-xl gap-4 hover:shadow-sm transition-shadow bg-card text-card-foreground">
              <div className="flex items-center">
                <span className={`text-xs px-3 py-1 rounded-full mr-4 text-white font-bold shrink-0 ${n.category === 'event' ? 'bg-[#D89F3C] dark:bg-amber-600' : 'bg-stone-400 dark:bg-stone-600'}`}>{n.category === 'event' ? '重點活動' : '一般公告'}</span>
                <span className="font-bold text-[#1A432D] dark:text-emerald-400 line-clamp-1">{n.title}</span>
                {n.action_url && <span className="ml-3 text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">含報名鈕</span>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={()=>{ setEditNewsId(n.id); setAddNewsTitle(n.title); setAddNewsContent(n.content); setAddNewsPreviewUrl(n.image_url); setAddNewsCategory(n.category || 'news'); setAddNewsActionUrl(n.action_url || ""); window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' });}} className="px-4 py-2 border border-border rounded-lg text-sm font-bold text-foreground hover:bg-muted transition-colors">編輯</button>
                <button onClick={async()=>{if(confirm("確定要刪除嗎？")){await supabase.from("news_events").delete().eq("id",n.id); fetchData();}}} className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold transition-colors">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 祈福專區按鈕設定 */}
      <section className="bg-card text-card-foreground p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-[#1A432D] dark:border-emerald-500 pl-3">5. 祈福專區按鈕設定 (首頁連結)</h2>
        <div className="bg-muted p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 border border-border">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-2">按鈕標題文字</label>
            <input value={srvTitle} onChange={e=>setSrvTitle(e.target.value)} placeholder="例：代燒專區" className="w-full bg-background text-foreground border border-input p-3 rounded-xl outline-none"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-2">對應連結網址</label>
            <input value={srvLink} onChange={e=>setSrvLink(e.target.value)} placeholder="例：/burning" className="w-full bg-background text-foreground border border-input p-3 rounded-xl outline-none"/>
          </div>
          <button onClick={handleSaveService} disabled={isAddingSrv} className="bg-[#1A432D] hover:bg-[#122F20] dark:bg-emerald-800 dark:hover:bg-emerald-900 text-white md:col-span-2 py-5 rounded-xl font-bold tracking-widest transition-colors">
            {editSrvId ? "儲存更新" : "新增按鈕"}
          </button>
        </div>
        <div className="space-y-3">
          {servicesList.map((s: any) => (
            <div key={s.id} className="flex justify-between items-center border border-border p-4 rounded-xl">
              <div className="flex flex-col">
                <span className="font-bold text-[#1A432D] dark:text-emerald-400 text-lg">{s.title}</span>
                <span className="text-xs text-muted-foreground mt-1">連結至：{s.link_url}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{setEditSrvId(s.id); setSrvTitle(s.title); setSrvLink(s.link_url)}} className="px-4 py-2 border border-border rounded-lg text-sm font-bold text-foreground hover:bg-muted transition-colors">編輯</button>
                <button onClick={async()=>{if(confirm("確定要刪除嗎？")){await supabase.from("blessing_services").delete().eq("id",s.id); window.location.reload();}}} className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold transition-colors">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </section>
         
      {/* 6. 頁尾聯絡資訊管理 */}
      <section className="bg-card text-card-foreground p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-slate-700 dark:border-slate-400 pl-3">6. 頁尾聯絡資訊管理</h2>
        <div className="bg-muted text-muted-foreground p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-border">
          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">宮廟實體地址</label><input value={address} onChange={e=>setAddress(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none"/></div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">電話或自訂提示文案</label><input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none"/></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">官方 LINE 連結網址</label><input value={lineUrl} onChange={e=>setLineUrl(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none"/></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">官方 IG 連結網址</label><input value={igUrl} onChange={e=>setIgUrl(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none"/></div>
          <div className="md:col-span-2 border-t border-border pt-6 mt-2">
            <div className="flex items-center justify-between mb-6 bg-background text-foreground p-5 rounded-xl border border-border shadow-sm">
               <div><p className="font-bold text-foreground tracking-widest">開放匯款與捐獻帳戶資訊</p></div>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" checked={showBankInfo} onChange={e=>setShowBankInfo(e.target.checked)} className="sr-only peer"/>
                 <div className="w-14 h-7 bg-muted-foreground/30 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[4px] after:bg-card after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-slate-700 dark:peer-checked:bg-slate-500"></div>
               </label>
            </div>
            {showBankInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-muted-foreground mb-2">銀行名稱與代碼</label><input value={bankName} onChange={e=>setBankName(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none"/></div>
                <div><label className="block text-xs font-bold text-muted-foreground mb-2">匯款帳號</label><input value={bankAccount} onChange={e=>setBankAccount(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none"/></div>
              </div>
            )}
          </div>
          <button onClick={handleSaveFooter} disabled={isSavingFooter} className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white md:col-span-2 py-5 rounded-xl font-bold tracking-widest transition-colors mt-2">儲存頁尾資訊</button>
        </div>
      </section>

      {/* 7. 點燈與代燒品項管理 */}
      <section className="bg-card text-card-foreground p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-amber-700 dark:border-amber-500 pl-3 text-amber-900 dark:text-amber-500">7. 點燈與代燒品項管理</h2>
        <div className="bg-muted text-muted-foreground p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 border border-border">
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">類別項目</label><select value={pCategory} onChange={e=>setPCategory(e.target.value)} className="w-full border border-border p-3 rounded-xl bg-background text-foreground font-bold"><option value="lamp">當月點燈祈福</option><option value="burning">代燒服務項目</option></select></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">品項名稱</label><input value={pTitle} onChange={e=>setPTitle(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none"/></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">結帳金額 (新台幣)</label><input type="number" value={pPrice} onChange={e=>setPPrice(Number(e.target.value))} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none"/></div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">品項簡介說明</label><input value={pDesc} onChange={e=>setPDesc(e.target.value)} className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none"/></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">上傳實體照片</label><input type="file" onChange={e => {if(e.target.files?.[0]){setPImageFile(e.target.files[0]); setPPreviewUrl(URL.createObjectURL(e.target.files[0]))}}} className="text-sm"/></div>
          <button onClick={handleSaveProduct} disabled={isAddingProduct} className="bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white md:col-span-3 py-5 rounded-xl font-bold transition-colors">{editPId ? "儲存修改項目" : "新增品項至前台選單"}</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {productsList.map((p: any) => (
            <div key={p.id} className="bg-card text-card-foreground border border-border p-5 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-start mb-4"><span className={`text-xs font-bold px-3 py-1 rounded-full ${p.category === 'lamp' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400'}`}>{p.category === 'lamp' ? '當月點燈' : '代燒服務'}</span><span className="text-[#A61D24] dark:text-red-400 font-bold text-lg">${p.price}</span></div>
                {p.image_url && <div className="w-full h-40 bg-muted rounded-xl overflow-hidden mb-4"><img src={p.image_url} className="w-full h-full object-cover" /></div>}
                <h4 className="font-bold text-xl text-foreground mb-2">{p.title}</h4>
                <p className="text-muted-foreground text-sm line-clamp-2">{p.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-border">
                <button onClick={()=>{setEditPId(p.id); setPTitle(p.title); setPPrice(p.price); setPDesc(p.description || ""); setPCategory(p.category); setPPreviewUrl(p.image_url || "");}} className="w-full py-2.5 bg-muted hover:bg-muted/80 text-foreground font-bold text-sm rounded-xl transition-colors">編輯</button>
                <button onClick={async()=>{if(confirm("確定刪除嗎？")){await supabase.from("blessing_products").delete().eq("id", p.id); fetchData();}}} className="w-full py-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm rounded-xl transition-colors">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. 服務與預約紀錄管理 */}
      <section className="bg-card text-card-foreground p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold border-l-4 border-emerald-700 dark:border-emerald-500 pl-3 text-emerald-900 dark:text-emerald-500">8. 服務與預約紀錄管理</h2>
          <button onClick={exportToCSV} className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold tracking-widest rounded-xl shadow-sm transition-colors">
            匯出當前名單 (Excel)
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 border-y border-border py-4">
          {monthOptions.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide md:border-r border-border pr-4">
              {monthOptions.map((month: string) => (
                <button key={month} onClick={() => setSelectedMonth(month)} className={`px-5 py-2 rounded-full font-bold text-sm tracking-widest shrink-0 transition-colors ${selectedMonth === month ? 'bg-emerald-700 text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                  {month}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: '全部合併訂單' },
              { id: 'lamp', label: '點燈' },
              { id: 'burning', label: '代燒' },
              { id: 'booking', label: '問事' },
              { id: 'campaign', label: '特辦活動' },
              { id: 'special_project', label: '⭐️ 獨立專款專用' } 
            ].map(tab => (
              <button key={tab.id} onClick={() => setSelectedServiceType(tab.id)} className={`px-4 py-2 rounded-xl font-bold text-sm tracking-widest shrink-0 transition-colors border ${selectedServiceType === tab.id ? (tab.id === 'special_project' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400' : 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400') : 'bg-card text-card-foreground border-border text-muted-foreground hover:bg-muted'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {selectedMonth && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
            <div className="bg-muted text-muted-foreground border border-border p-5 rounded-2xl">
              <p className="text-xs font-bold tracking-widest mb-1">已入帳總額</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">${totalIncomeCompleted.toLocaleString()}</p>
            </div>
            <div className="bg-muted text-muted-foreground border border-border p-5 rounded-2xl">
              <p className="text-xs font-bold tracking-widest mb-1">待對帳總額</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">${totalIncomePending.toLocaleString()}</p>
            </div>
            <div className="bg-muted text-muted-foreground border border-border p-5 rounded-2xl">
               <p className="text-xs font-bold tracking-widest mb-1">當前列表性質</p>
               <p className="text-sm font-bold text-foreground mt-2">{isShowingSpOrders ? '獨立專案 (專款專戶)' : '一般購物車 (公帳戶)'}</p>
            </div>
            <div className="bg-muted text-muted-foreground border border-border p-5 rounded-2xl">
              <p className="text-xs font-bold tracking-widest mb-1">當前篩選件數</p>
              <p className="text-3xl font-bold text-foreground mt-2">{currentDisplayOrders.length}</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto max-h-[380px] overflow-y-auto border border-border rounded-xl relative shadow-sm scrollbar-hide">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted text-muted-foreground font-bold tracking-widest sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4">建立日期</th>
                <th className="p-4">{isShowingSpOrders ? '專案名稱' : '類別'}</th>
                <th className="p-4">信眾姓名</th>
                <th className="p-4">報名明細 / 後五碼</th>
                <th className="p-4">金額</th>
                <th className="p-4 text-center">狀態</th>
                <th className="p-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card text-card-foreground">
              {currentDisplayOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-muted transition-colors">
                  <td className="p-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString('zh-TW')}</td>
                  <td className="p-4 font-bold text-[#1A432D] dark:text-emerald-400">{isShowingSpOrders ? order.special_projects?.title : order.service_type}</td>
                  <td className="p-4 font-bold text-foreground">{order.user_name}</td>
                  <td className="p-4 text-muted-foreground max-w-[200px] truncate" title={order.service_details}>
                    {order.bank_last_5 ? <span className="text-[#A61D24] dark:text-red-400 font-bold mr-2">[{order.bank_last_5}]</span> : ""}
                    {order.service_details}
                  </td>
                  <td className="p-4 font-bold text-foreground">${order.total_price || order.amount || 0}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400'}`}>{order.status === 'completed' ? '已處理' : '待對帳'}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => toggleOrderStatus(order.id, order.status, isShowingSpOrders)} className="px-3 py-1.5 border border-border rounded-lg text-xs font-bold text-foreground hover:bg-muted transition-colors">切換</button>
                      <button onClick={() => deleteOrder(order.id, isShowingSpOrders)} className="px-3 py-1.5 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition-colors">刪除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 9. 獨立專款專案管理 */}
      <section className="bg-card text-card-foreground p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-blue-700 dark:border-blue-500 pl-3 text-blue-900 dark:text-blue-400">9. 獨立專款專案管理 (如: 玉皇上帝金牌、建廟基金)</h2>
        <p className="text-sm text-muted-foreground font-bold mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">💡 提示：此區塊的認捐將「繞過一般購物車」走專屬獨立通道，並提供專屬獨立網址供您分享給信眾。</p>
        
        <div className="bg-muted text-muted-foreground p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-border">
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">獨立專案主標題</label><input value={spTitle} onChange={e=>setSpTitle(e.target.value)} placeholder="例: 恭迎玉皇上帝駐駕 敬獻金牌專案" className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none focus:border-blue-700 dark:focus:border-blue-500"/></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-2">專屬獨立匯款帳戶</label><input value={spBankInfo} onChange={e=>setSpBankInfo(e.target.value)} placeholder="例: 玉山銀行 (808) 1234-5678-9012" className="w-full bg-background text-foreground border border-border p-3 rounded-xl outline-none focus:border-blue-700 dark:focus:border-blue-500"/></div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">專案詳細緣由與說明</label><textarea value={spDesc} onChange={e=>setSpDesc(e.target.value)} placeholder="說明此專款的用途與歷史意義..." className="w-full bg-background text-foreground border border-border p-3 rounded-xl h-24 outline-none focus:border-blue-700 dark:focus:border-blue-500"/></div>
          
          <div className="md:col-span-2 border-t border-border pt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-foreground">設定認捐方案與價格</label>
              <button onClick={addSpOption} className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">＋ 新增方案</button>
            </div>
            <div className="space-y-3">
              {spOptions.map((opt: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input value={opt.title} onChange={e=>updateSpOption(idx, "title", e.target.value)} placeholder="方案名稱 (例: 敬獻一分金牌)" className="flex-1 bg-background text-foreground border border-border p-3 rounded-xl outline-none focus:border-blue-500"/>
                  <input type="number" value={opt.price} onChange={e=>updateSpOption(idx, "price", Number(e.target.value))} placeholder="金額 (0為隨喜)" className="w-32 bg-background text-foreground border border-border p-3 rounded-xl outline-none focus:border-blue-500"/>
                  {spOptions.length > 1 && <button onClick={() => removeSpOption(idx)} className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl font-bold transition-colors">×</button>}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground mb-2">上傳專案主視覺圖片</label><input type="file" onChange={e=>{if(e.target.files?.[0]){setSpImageFile(e.target.files[0]); setSpPreviewUrl(URL.createObjectURL(e.target.files[0]))}}} className="text-xs text-muted-foreground mt-1"/></div>
          
          <div className="md:col-span-2 flex gap-3">
            <button onClick={handleSaveSpecialProject} className="flex-1 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-4 rounded-xl font-bold tracking-widest text-sm shadow-sm transition-colors">{editSpId ? "儲存專案更新" : "正式發布獨立專款專案"}</button>
            {editSpId && <button onClick={() => { setEditSpId(null); setSpTitle(""); setSpDesc(""); setSpBankInfo(""); setSpPreviewUrl(""); setSpOptions([{ title: "隨喜認捐", price: 0 }]); setSpImageFile(null); }} className="px-6 bg-background border border-border hover:bg-muted text-foreground py-4 rounded-xl font-bold tracking-widest text-sm shadow-sm transition-colors">取消編輯</button>}
          </div>
        </div>

        <div className="space-y-4">
          {spList.map((sp: any) => (
            <div key={sp.id} className="p-5 bg-card text-card-foreground border border-border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${sp.is_active ? 'bg-blue-600' : 'bg-stone-400'}`}>{sp.is_active ? '開放認捐中' : '已結案'}</span><h4 className="font-bold text-foreground text-lg">{sp.title}</h4></div>
                <p className="text-xs text-muted-foreground font-mono">設定方案: {sp.options && Array.isArray(sp.options) ? sp.options.map((o:any) => `${o.title}($${o.price})`).join('、') : `未設定`}</p>
                <p className="text-xs text-muted-foreground">專屬帳戶: {sp.bank_info}</p>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
                <button onClick={() => handleCopyUrl(sp.id, sp.title, true)} className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg transition-colors">🔗 複製連結</button>
                <button onClick={() => {
                  setEditSpId(sp.id); setSpTitle(sp.title); setSpDesc(sp.description || ""); setSpBankInfo(sp.bank_info || ""); setSpPreviewUrl(sp.image_url || "");
                  setSpOptions(sp.options && Array.isArray(sp.options) && sp.options.length > 0 ? sp.options : [{title: "隨喜認捐", price: 0}]); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }} className="text-xs font-bold bg-muted text-foreground px-4 py-2 rounded-lg transition-colors">編輯</button>
                <button onClick={async()=>{if(confirm("確定刪除此專案？")){await supabase.from("special_projects").delete().eq("id",sp.id); fetchData(); window.location.reload();}}} className="text-xs font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg transition-colors">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
}