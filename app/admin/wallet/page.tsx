"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function WalletAdminPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 載入所有信眾資料
  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    const { data } = await supabase.from("member_profiles").select("*").order("created_at", { ascending: false });
    if (data) setMembers(data);
  }

  // 處理退款/充值邏輯
  const handleRefund = async () => {
    if (!selectedMember || !amount || !description) return alert("請填寫完整資訊！");
    setIsLoading(true);

    try {
      const targetMember = members.find(m => m.user_line_id === selectedMember);
      const newBalance = (targetMember?.wallet_balance || 0) + parseInt(amount);

      // 1. 更新信眾總餘額
      await supabase.from("member_profiles")
        .update({ wallet_balance: newBalance })
        .eq("user_line_id", selectedMember);

      // 2. 寫入資金變動明細
      await supabase.from("wallet_transactions").insert({
        user_line_id: selectedMember,
        amount: parseInt(amount),
        transaction_type: "refund",
        description: description,
      });

      alert("✅ 成功發放祈福金！");
      setAmount("");
      setDescription("");
      fetchMembers(); // 重新整理列表
    } catch (error) {
      alert("❌ 發生錯誤，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold border-l-4 border-[#A61D24] pl-3">💰 信眾祈福金發放系統</h1>

      {/* 發放表單 */}
      <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">選擇信眾</label>
          <select 
            value={selectedMember} 
            onChange={e => setSelectedMember(e.target.value)}
            className="w-full p-3 rounded-xl border bg-background"
          >
            <option value="">-- 請選擇 --</option>
            {members.map(m => (
              <option key={m.user_line_id} value={m.user_line_id}>
                {m.name || "未命名"} (電話: {m.phone || "無"}) - 目前餘額: ${m.wallet_balance}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">發放金額 (元)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="例如: 600"
            className="w-full p-3 rounded-xl border bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">退款/發放事由</label>
          <input 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="例如: 點燈資料填錯，系統退回"
            className="w-full p-3 rounded-xl border bg-background"
          />
        </div>

        <button 
          onClick={handleRefund} 
          disabled={isLoading}
          className="w-full bg-[#1A432D] text-white py-3 rounded-xl font-bold hover:bg-[#122F20] transition-colors disabled:opacity-50"
        >
          {isLoading ? "處理中..." : "確認發放"}
        </button>
      </div>
    </div>
  );
}
