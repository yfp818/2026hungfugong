"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function OrdersPage() {
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [spOrdersList, setSpOrdersList] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  async function fetchData() {
    setIsLoadingOrders(true);
    
    // 1. 獲取一般服務訂單
    const { data: orders } = await supabase.from("service_orders").select("*").order("created_at", { ascending: false });
    if (orders) setOrdersList(orders);
    
    // 2. 獲取獨立專案訂單
    const { data: spoData } = await supabase.from("special_project_orders").select("*, special_projects(title)").order("created_at", { ascending: false });
    if (spoData) setSpOrdersList(spoData);

    // 3. 獲取信眾名冊 (用於退款到錢包)
    const { data: mData } = await supabase.from("member_profiles").select("*").order("created_at", { ascending: false });
    if (mData) setMembersList(mData);

    setIsLoadingOrders(false);
  }
  
  useEffect(() => { fetchData(); }, []);

  // 計算可選月份
  const allOrderDates = [...ordersList.map(o => o.created_at), ...spOrdersList.map(o => o.created_at)];
  const monthOptions = Array.from(new Set(allOrderDates.map((dateStr: string) => {
    const d = new Date(dateStr); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))).sort().reverse();

  useEffect(() => { 
    if (monthOptions.length > 0 && !selectedMonth) setSelectedMonth(monthOptions[0]); 
  }, [monthOptions]);

  // 過濾一般訂單
  const filteredOrders = ordersList.filter((o: any) => {
    const d = new Date(o.created_at);
    const isMonthMatch = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
    if (!isMonthMatch) return false;

    if (selectedServiceType !== 'all' && selectedServiceType !== 'special_project') {
      if (selectedServiceType === 'lamp' && o.service_type !== '當月點燈' && o.service_type !== 'lamp') return false;
      if (selectedServiceType === 'burning' && o.service_type !== '代燒服務' && o.service_type !== 'burning') return false;
      if (selectedServiceType === 'booking' && o.service_type !== '濟事問事' && o.service_type !== 'booking') return false;
      if (selectedServiceType === 'campaign' && o.service_type !== '限時特辦活動' && o.service_type !== 'campaign') return false;
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      return o.user_name?.toLowerCase().includes(q) || o.user_phone?.includes(q) || o.bank_last_5?.includes(q);
    }
    return true;
  });

  // 過濾獨立專案訂單
  const filteredSpOrders = spOrdersList.filter((o: any) => {
    const d = new Date(o.created_at);
    const isMonthMatch = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
    if (!isMonthMatch) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      return o.user_name?.toLowerCase().includes(q) || o.user_phone?.includes(q) || o.bank_last_5?.includes(q);
    }
    return true;
  });

  const isShowingSpOrders = selectedServiceType === 'special_project';
  const currentDisplayOrders = isShowingSpOrders ? filteredSpOrders : filteredOrders;

  const totalIncomeCompleted = currentDisplayOrders.filter((o: any) => o.status === 'completed').reduce((sum: number, o: any) => sum + (Number(o.total_price || o.amount) || 0), 0);
  const totalIncomePending = currentDisplayOrders.filter((o: any) => o.status !== 'completed' && o.status !== 'refunded').reduce((sum: number, o: any) => sum + (Number(o.total_price || o.amount) || 0), 0);

  // ========== API 動作 ==========

  const toggleOrderStatus = async (id: string, currentStatus: string, isSp: boolean = false) => { 
    if(currentStatus === 'refunded') return alert("已作廢退款的訂單無法變更狀態！");
    try { 
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'; 
      const table = isSp ? "special_project_orders" : "service_orders"; 
      await supabase.from(table).update({ status: newStatus }).eq("id", id); 
      fetchData(); 
    } catch (err: any) { alert("狀態更新失敗：" + err.message); } 
  };
  
  const deleteOrder = async (id: string, isSp: boolean = false) => { 
    if(confirm("確定要刪除這筆紀錄嗎？此動作無法復原。")) { 
      try { 
        const table = isSp ? "special_project_orders" : "service_orders"; 
        await supabase.from(table).delete().eq("id", id); 
        fetchData(); 
      } catch (err: any) { alert("刪除失敗：" + err.message); } 
    } 
  };

  const handleRefundOrder = async (order: any, isSp: boolean = false) => {
    if (order.status === 'refunded') return alert("此訂單已退款作廢，無法重複退款。");
    
    const refundAmt = Number(order.total_price || order.amount || 0);
    if (refundAmt <= 0) return alert("此訂單金額為 0，無需退款。");

    if (!confirm(`⚠️ 警告：確定要將此訂單全額退款 $${refundAmt} 至信眾錢包，並直接「作廢此訂單」嗎？`)) return;

    let targetMember = membersList.find(m => m.user_line_id === order.user_line_id);
    if (!targetMember && order.user_phone) targetMember = membersList.find(m => m.phone === order.user_phone);
    if (!targetMember && order.user_phone) targetMember = membersList.find(m => m.user_line_id === `phone_${order.user_phone}`);

    if (!targetMember) {
      return alert("找不到該信眾的數位錢包帳戶。\n請先引導信眾登入系統綁定手機，或前往「信眾與餘額管理」手動發放。");
    }

    try {
      const newBalance = (targetMember.wallet_balance || 0) + refundAmt;
      const { error: balanceError } = await supabase.from("member_profiles").update({ wallet_balance: newBalance }).eq("user_line_id", targetMember.user_line_id);
      if (balanceError) throw balanceError;

      const serviceName = isSp ? order.special_projects?.title : order.service_type;
      const desc = `[系統自動退款] 撤銷作廢訂單：${serviceName} (報名大德: ${order.user_name})`;
      const { error: txError } = await supabase.from("wallet_transactions").insert([{
        user_line_id: targetMember.user_line_id, amount: refundAmt, transaction_type: "refund", description: desc
      }]);
      if (txError) throw txError;

      const table = isSp ? "special_project_orders" : "service_orders";
      const { error: orderError } = await supabase.from(table).update({ status: 'refunded' }).eq("id", order.id);
      if (orderError) throw orderError;

      alert(`✅ 一鍵退款成功！\n已自動加值 $${refundAmt} 至錢包，並作廢該訂單。`);
      fetchData();
    } catch (err: any) { alert("執行失敗：" + err.message); }
  };

  const exportToCSV = () => {
    if (currentDisplayOrders.length === 0) return alert("目前分類下沒有資料可供匯出。");
    const isSp = selectedServiceType === 'special_project';
    const headers = ["建立時間", "服務/專案名稱", "信眾姓名", "聯絡電話", "生日生辰", "地址", "明細/方案", "匯款後五碼", "狀態", "金額"];
    const csvContent = [ headers.join(","), ...currentDisplayOrders.map((order: any) => [ new Date(order.created_at).toLocaleString('zh-TW'), isSp ? (order.special_projects?.title || "") : (order.service_type || ""), order.user_name || "", order.user_phone || "", order.birth_date || "", `"${order.address || ""}"`, `"${(order.service_details || "").replace(/\n/g, ' ')}"`, order.bank_last_5 || "", order.status === 'completed' ? '已處理' : order.status === 'refunded' ? '已作廢退款' : '待處理', order.total_price || order.amount || 0 ].join(",")) ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a"); link.setAttribute("href", URL.createObjectURL(blob)); 
    const typeNames: Record<string, string> = { all: "全部", lamp: "點燈", burning: "代燒", booking: "問事", campaign: "特辦活動", special_project: "獨立專款專用" };
    link.setAttribute("download", `皇府宮_${selectedMonth}_${typeNames[selectedServiceType]}_名單.csv`); 
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (isLoadingOrders) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground font-bold tracking-widest">載入訂單資料中...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="bg-card text-card-foreground p-4 md:p-8 rounded-[2rem] shadow-sm border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold border-l-4 border-emerald-700 pl-3 text-emerald-950">服務與預約紀錄管理</h2>
          <button onClick={exportToCSV} className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 transition-colors text-white font-bold tracking-widest rounded-xl shadow-sm text-sm md:text-base">
            匯出當前名單 (Excel)
          </button>
        </div>

        <div className="flex flex-col gap-4 border-y border-border py-4">
          <div className="flex flex-col xl:flex-row justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              {monthOptions.length > 0 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide md:border-r border-border pr-4">
                  {monthOptions.map((month: string) => (
                    <button key={month} onClick={() => setSelectedMonth(month)} className={`px-4 md:px-5 py-2 rounded-full font-bold text-xs md:text-sm tracking-widest shrink-0 transition-colors ${selectedMonth === month ? 'bg-emerald-700 text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{month}</button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'all', label: '全部合併' },
                  { id: 'lamp', label: '點燈' },
                  { id: 'burning', label: '代燒' },
                  { id: 'booking', label: '問事' },
                  { id: 'campaign', label: '特辦活動' },
                  { id: 'special_project', label: '獨立專款' } 
                ].map(tab => (
                  <button key={tab.id} onClick={() => setSelectedServiceType(tab.id)} className={`px-3 md:px-4 py-2 rounded-xl font-bold text-xs md:text-sm tracking-widest shrink-0 transition-colors border ${selectedServiceType === tab.id ? 'bg-emerald-50 border-emerald-600 text-emerald-700' : 'bg-card text-muted-foreground border-border hover:bg-muted'}`}>{tab.label}</button>
                ))}
              </div>
            </div>

            <div className="w-full xl:w-72 shrink-0">
              <input type="text" placeholder="搜尋姓名、電話或後五碼" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-background border border-border p-2.5 rounded-xl outline-none text-sm focus:border-emerald-500 transition-colors"/>
            </div>
          </div>
        </div>

        {selectedMonth && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pb-4">
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 md:p-5 rounded-2xl">
              <p className="text-[10px] md:text-xs font-bold tracking-widest mb-1 text-emerald-800/70">已入帳總額</p>
              <p className="text-xl md:text-2xl font-bold text-emerald-700">${totalIncomeCompleted.toLocaleString()}</p>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 p-4 md:p-5 rounded-2xl">
              <p className="text-[10px] md:text-xs font-bold tracking-widest mb-1 text-amber-800/70">待對帳總額</p>
              <p className="text-xl md:text-2xl font-bold text-amber-600">${totalIncomePending.toLocaleString()}</p>
            </div>
            <div className="bg-muted border border-border p-4 md:p-5 rounded-2xl hidden sm:block">
               <p className="text-[10px] md:text-xs font-bold tracking-widest mb-1 text-muted-foreground">當前列表性質</p>
               <p className="text-xs md:text-sm font-bold text-foreground mt-2">{isShowingSpOrders ? '獨立專案 (專戶)' : '一般購物車 (公帳戶)'}</p>
            </div>
            <div className="bg-muted border border-border p-4 md:p-5 rounded-2xl hidden sm:block">
              <p className="text-[10px] md:text-xs font-bold tracking-widest mb-1 text-muted-foreground">當前篩選件數</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-1 md:mt-2">{currentDisplayOrders.length}</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto border border-border rounded-xl relative shadow-sm scrollbar-hide">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted text-muted-foreground font-bold tracking-widest sticky top-0 z-10 shadow-sm border-b border-border text-xs md:text-sm">
              <tr>
                <th className="p-3 md:p-4">建立日期</th>
                <th className="p-3 md:p-4">{isShowingSpOrders ? '專案名稱' : '類別'}</th>
                <th className="p-3 md:p-4">信眾姓名</th>
                <th className="p-3 md:p-4">明細/五碼</th>
                <th className="p-3 md:p-4 text-right">金額</th>
                <th className="p-3 md:p-4 text-center">狀態</th>
                <th className="p-3 md:p-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card text-card-foreground text-xs md:text-sm">
              {currentDisplayOrders.map((order: any) => (
                <tr key={order.id} className={`hover:bg-muted transition-colors ${order.status === 'refunded' ? 'opacity-60 bg-stone-50' : ''}`}>
                  <td className="p-3 md:p-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString('zh-TW')}</td>
                  <td className="p-3 md:p-4 font-bold text-[#1A432D] max-w-[120px] truncate" title={isShowingSpOrders ? order.special_projects?.title : order.service_type}>{isShowingSpOrders ? order.special_projects?.title : order.service_type}</td>
                  <td className="p-3 md:p-4 font-bold text-foreground">{order.user_name}</td>
                  <td className="p-3 md:p-4 text-muted-foreground max-w-[150px] md:max-w-[200px] truncate" title={order.service_details}>
                    {order.bank_last_5 ? <span className="text-[#A61D24] font-bold mr-1 md:mr-2">[{order.bank_last_5}]</span> : ""}
                    {order.service_details}
                  </td>
                  <td className="p-3 md:p-4 font-bold text-right text-foreground">${order.total_price || order.amount || 0}</td>
                  <td className="p-3 md:p-4 text-center">
                    <span className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : order.status === 'refunded' ? 'bg-stone-200 text-stone-600' : 'bg-amber-100 text-amber-800'}`}>
                      {order.status === 'completed' ? '已處理' : order.status === 'refunded' ? '已作廢' : '待對帳'}
                    </span>
                  </td>
                  <td className="p-3 md:p-4 text-center">
                    <div className="flex justify-center gap-1.5 md:gap-2">
                      {order.status !== 'refunded' && (
                        <button onClick={() => handleRefundOrder(order, isShowingSpOrders)} className="px-2 md:px-3 py-1.5 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white rounded-lg text-[10px] md:text-xs font-bold transition-colors">退款</button>
                      )}
                      <button onClick={() => toggleOrderStatus(order.id, order.status, isShowingSpOrders)} className="px-2 md:px-3 py-1.5 border border-border rounded-lg text-[10px] md:text-xs font-bold text-foreground hover:bg-muted transition-colors">切換</button>
                      <button onClick={() => deleteOrder(order.id, isShowingSpOrders)} className="px-2 md:px-3 py-1.5 border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-[10px] md:text-xs font-bold transition-colors">刪除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentDisplayOrders.length === 0 && (
            <div className="p-12 text-center text-muted-foreground font-bold tracking-widest">
              目前篩選條件下沒有訂單紀錄。
            </div>
          )}
        </div>
      </section>
    </div>
  );
}