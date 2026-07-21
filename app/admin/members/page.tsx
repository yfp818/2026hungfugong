"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function MembersPage() {
  const [membersList, setMembersList] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 狀態管理
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [refundDesc, setRefundDesc] = useState<string>("");
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState<string>("");
  
  const [editMemId, setEditMemId] = useState<string|null>(null);
  const [editMemName, setEditMemName] = useState("");
  const [editMemPhone, setEditMemPhone] = useState("");

  // 獲取資料
  async function fetchData() {
    setIsLoading(true);
    const { data: mData } = await supabase.from("member_profiles").select("*").order("created_at", { ascending: false });
    if (mData) setMembersList(mData);

    const { data: tData } = await supabase.from("wallet_transactions").select("*").order("created_at", { ascending: false });
    if (tData) setTransactionsList(tData);
    setIsLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  // 搜尋過濾
  const filteredMembers = membersList.filter((m: any) => {
    if (searchMemberQuery.trim() === "") return true;
    const q = searchMemberQuery.toLowerCase().trim();
    return (m.name?.toLowerCase().includes(q) || m.phone?.includes(q) || m.user_line_id?.toLowerCase().includes(q));
  });

  // ========== API 動作 ==========

  const handleUpdateMember = async () => {
    if (!editMemId) return;
    try {
      const { error } = await supabase.from("member_profiles").update({ name: editMemName, phone: editMemPhone }).eq("user_line_id", editMemId);
      if (error) throw error;
      alert("信眾資料更新成功！"); 
      setEditMemId(null); 
      fetchData();
    } catch (err: any) { alert("更新失敗：" + err.message); }
  };

  const handleUndoTransaction = async (tx: any) => {
    if (!confirm("⚠️ 確定要撤銷此筆紀錄嗎？\n系統將會自動從該信眾的錢包中「扣回 / 補回」這筆金額！")) return;
    try {
      const member = membersList.find(m => m.user_line_id === tx.user_line_id);
      if (member) {
        const newBalance = (member.wallet_balance || 0) - tx.amount;
        const { error: balanceError } = await supabase.from("member_profiles").update({ wallet_balance: newBalance }).eq("user_line_id", tx.user_line_id);
        if (balanceError) throw balanceError;
      }
      const { error: txError } = await supabase.from("wallet_transactions").delete().eq("id", tx.id);
      if (txError) throw txError;
      
      alert("已成功撤銷紀錄，並完成餘額校正。"); 
      fetchData();
    } catch (err: any) { alert("撤銷失敗：" + err.message); }
  };

  const handleAdminRefund = async () => {
    if (!selectedMemberId || !refundAmount || !refundDesc) return alert("請填寫完整的發放資訊");
    const amt = parseInt(refundAmount);
    if (isNaN(amt) || amt <= 0) return alert("金額需大於零");

    setIsProcessingRefund(true);
    try {
      const target = membersList.find(m => m.user_line_id === selectedMemberId);
      const newBalance = (target?.wallet_balance || 0) + amt;

      const { error: balanceError } = await supabase.from("member_profiles").update({ wallet_balance: newBalance }).eq("user_line_id", selectedMemberId);
      if (balanceError) throw balanceError;

      const { error: txError } = await supabase.from("wallet_transactions").insert([{ user_line_id: selectedMemberId, amount: amt, transaction_type: "refund", description: refundDesc }]);
      if (txError) throw txError;

      alert("功德金發放成功。"); 
      setRefundAmount(""); 
      setRefundDesc(""); 
      setSelectedMemberId(""); 
      fetchData();
    } catch (err: any) { alert("執行失敗：" + err.message); } 
    finally { setIsProcessingRefund(false); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground font-bold tracking-widest">載入信眾與錢包資料中...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ================= 左側：功德金退款發放控制面板 ================= */}
      <div className="lg:col-span-1 bg-card text-card-foreground p-5 md:p-8 rounded-[2rem] shadow-sm border border-border space-y-5 md:space-y-6 h-fit sticky top-24">
        <h2 className="text-lg md:text-xl font-bold border-l-4 border-purple-700 pl-3">手動核發祈福金</h2>
        
        <div className="space-y-4 md:space-y-5 text-xs md:text-sm">
          <div className={`p-4 md:p-5 rounded-2xl border transition-colors ${selectedMemberId ? 'bg-purple-50 border-purple-200' : 'bg-muted border-border'}`}>
            <label className="block text-[10px] md:text-xs font-bold text-muted-foreground mb-2 md:mb-3">當前發放對象</label>
            {selectedMemberId ? (
              <div className="flex flex-col gap-2 md:gap-3">
                <div>
                  <p className="font-bold text-foreground text-lg md:text-xl mb-0.5 md:mb-1">{membersList.find(m=>m.user_line_id===selectedMemberId)?.name || "未設定姓名"}</p>
                  <p className="text-xs md:text-sm text-muted-foreground font-mono">{membersList.find(m=>m.user_line_id===selectedMemberId)?.phone || "無電話紀錄"}</p>
                </div>
                <button onClick={()=>setSelectedMemberId("")} className="w-full text-[10px] md:text-xs font-bold bg-white border border-border px-3 py-2 rounded-xl shadow-sm hover:bg-muted transition-colors">重新選擇信眾</button>
              </div>
            ) : (
              <div className="text-center py-3 md:py-4">
                <p className="text-xs md:text-sm font-bold text-purple-700">請從右側「名冊」中點選目標對象 👉</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] md:text-xs font-bold text-muted-foreground mb-1 md:mb-2">發放金額 (新台幣)</label>
            <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} placeholder="輸入金額，例如: 600" className="w-full bg-background text-foreground border border-border p-3 md:p-4 rounded-xl outline-none focus:border-purple-500 font-bold text-base md:text-lg transition-colors"/>
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-muted-foreground mb-1 md:mb-2">手動加值事由說明</label>
            <textarea value={refundDesc} onChange={e => setRefundDesc(e.target.value)} placeholder="例如：櫃檯現金儲值、人工退款" className="w-full bg-background text-foreground border border-border p-3 md:p-4 rounded-xl h-20 md:h-24 outline-none resize-none focus:border-purple-500 transition-colors"/>
          </div>
          <button onClick={handleAdminRefund} disabled={isProcessingRefund || !selectedMemberId} className={`w-full py-4 md:py-5 rounded-xl font-bold tracking-widest text-xs md:text-sm transition-all shadow-sm ${selectedMemberId ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-md' : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'}`}>
            {isProcessingRefund ? "處理中..." : selectedMemberId ? "確認核發祈福金" : "請先選擇信眾"}
          </button>
        </div>
      </div>

      {/* ================= 右側：信眾名冊與歷史明細 ================= */}
      <div className="lg:col-span-2 space-y-6 md:space-y-8">
        
        {/* 信眾名冊 */}
        <div className="bg-card text-card-foreground p-5 md:p-8 rounded-[2rem] shadow-sm border border-border space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 md:gap-4">
            <h2 className="text-lg md:text-xl font-bold border-l-4 border-purple-700 pl-3">信眾錢包名冊</h2>
            <div className="relative w-full sm:w-72">
              <input type="text" placeholder="搜尋姓名或電話..." value={searchMemberQuery} onChange={e => setSearchMemberQuery(e.target.value)} className="bg-background text-foreground border border-border p-2.5 md:p-3 pl-4 rounded-xl text-xs md:text-sm outline-none w-full focus:border-purple-500 shadow-sm transition-colors"/>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[350px] md:max-h-[400px] overflow-y-auto border border-border rounded-xl relative scrollbar-hide text-xs md:text-sm bg-background">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-muted text-muted-foreground font-bold tracking-widest sticky top-0 z-10 shadow-sm border-b border-border">
                <tr><th className="p-3 md:p-4">姓名</th><th className="p-3 md:p-4">電話</th><th className="p-3 md:p-4 text-right">餘額</th><th className="p-3 md:p-4 text-center">操作</th></tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {filteredMembers.map((m: any) => (
                  <tr 
                    key={m.user_line_id} 
                    onClick={() => { if(editMemId !== m.user_line_id) { setSelectedMemberId(m.user_line_id); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                    className={`transition-colors cursor-pointer ${selectedMemberId === m.user_line_id ? 'bg-purple-50' : 'hover:bg-muted'}`}
                  >
                    <td className="p-3 md:p-4">
                      {editMemId === m.user_line_id ? (
                        <input autoFocus value={editMemName} onChange={e=>setEditMemName(e.target.value)} onClick={e=>e.stopPropagation()} className="w-20 md:w-28 bg-background border border-purple-400 p-1.5 md:p-2 rounded-lg font-bold shadow-sm"/>
                      ) : (
                        <div className="flex items-center gap-1.5 md:gap-2">
                          {selectedMemberId === m.user_line_id && <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-purple-600"></span>}
                          <span className="font-bold">{m.name || "未設定"}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 md:p-4 text-muted-foreground font-mono">
                      {editMemId === m.user_line_id ? (
                        <input value={editMemPhone} onChange={e=>setEditMemPhone(e.target.value)} onClick={e=>e.stopPropagation()} className="w-24 md:w-32 bg-background border border-purple-400 p-1.5 md:p-2 rounded-lg font-bold shadow-sm"/>
                      ) : (
                        m.phone || "無紀錄"
                      )}
                    </td>
                    <td className="p-3 md:p-4 font-bold text-right text-purple-700 text-base md:text-lg">${m.wallet_balance || 0}</td>
                    <td className="p-3 md:p-4 text-center">
                      {editMemId === m.user_line_id ? (
                        <div className="flex justify-center gap-1.5 md:gap-2">
                           <button onClick={(e)=>{e.stopPropagation(); handleUpdateMember();}} className="text-[10px] md:text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors">儲存</button>
                           <button onClick={(e)=>{e.stopPropagation(); setEditMemId(null);}} className="text-[10px] md:text-xs font-bold bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-lg transition-colors">取消</button>
                        </div>
                      ) : (
                        <button onClick={(e)=>{e.stopPropagation(); setEditMemId(m.user_line_id); setEditMemName(m.name||""); setEditMemPhone(m.phone||"");}} className="text-[10px] md:text-xs font-bold bg-card border border-border text-foreground px-4 py-1.5 rounded-lg shadow-sm hover:bg-muted transition-colors">編輯</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 歷史異動明細 */}
        <div className="bg-card text-card-foreground p-5 md:p-8 rounded-[2rem] shadow-sm border border-border space-y-4 md:space-y-6">
          <h2 className="text-lg md:text-xl font-bold border-l-4 border-purple-700 pl-3">歷史異動明細</h2>
          <div className="overflow-x-auto max-h-[300px] md:max-h-[350px] overflow-y-auto border border-border rounded-xl relative scrollbar-hide text-xs md:text-sm bg-background">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-muted text-muted-foreground font-bold tracking-widest sticky top-0 z-10 shadow-sm border-b border-border">
                <tr><th className="p-3 md:p-4">時間</th><th className="p-3 md:p-4">信眾</th><th className="p-3 md:p-4">明細</th><th className="p-3 md:p-4 text-right">金額</th><th className="p-3 md:p-4 text-center">操作</th></tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {transactionsList.map((tx: any) => {
                  const txMember = membersList.find(m => m.user_line_id === tx.user_line_id);
                  return (
                  <tr key={tx.id} className="hover:bg-muted transition-colors">
                    <td className="p-3 md:p-4 text-[10px] md:text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString('zh-TW', {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'})}</td>
                    <td className="p-3 md:p-4 font-bold">{txMember?.name || tx.user_line_id.replace('phone_', '')}</td>
                    <td className="p-3 md:p-4">
                       <span className={`px-2 py-1 rounded-full text-[8px] md:text-[10px] font-bold mr-1.5 md:mr-3 ${tx.transaction_type === 'refund' ? 'bg-purple-100 text-purple-800' : 'bg-stone-100 text-stone-800'}`}>{tx.transaction_type === 'refund' ? '加值退款' : '消費扣抵'}</span>
                       <span className="text-muted-foreground max-w-[100px] md:max-w-[150px] truncate inline-block align-bottom" title={tx.description}>{tx.description}</span>
                    </td>
                    <td className={`p-3 md:p-4 font-bold text-right text-base md:text-lg ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{tx.amount >= 0 ? `+${tx.amount}` : tx.amount}</td>
                    <td className="p-3 md:p-4 text-center">
                      <button onClick={() => handleUndoTransaction(tx)} className="text-[10px] md:text-xs font-bold bg-red-50 text-red-600 border border-red-100 px-3 md:px-4 py-1.5 md:py-2 rounded-lg shadow-sm hover:bg-red-600 hover:text-white transition-colors">撤銷</button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}