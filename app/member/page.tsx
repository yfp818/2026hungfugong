"use client";
import { useState, useEffect } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function MemberCenterPage() {
  const { data: session, status } = useSession();
  
  const [activeMenu, setActiveMenu] = useState("orders");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // 編輯名冊的狀態管理
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editBirth, setEditBirth] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);

  const fetchMemberData = async () => {
    if (!session?.user) return;
    const userLineId = session.user.email || session.user.name || "unknown";

    const { data: ordersData } = await supabase
      .from("service_orders")
      .select("*")
      .eq("user_line_id", userLineId)
      .order("created_at", { ascending: false });
    if (ordersData) setOrders(ordersData);

    const { data: contactsData } = await supabase
      .from("user_contacts")
      .select("*")
      .eq("user_line_id", userLineId)
      .order("created_at", { ascending: false });
    if (contactsData) setContacts(contactsData);

    setIsLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated") fetchMemberData();
    else if (status === "unauthenticated") setIsLoading(false);
  }, [status, session]);

  const handleDeleteContact = async (id: string) => {
    if (confirm("確定要刪除此筆親友名冊資訊嗎？")) {
      try {
        const { error } = await supabase.from("user_contacts").delete().eq("id", id);
        if (error) throw error;
        fetchMemberData();
      } catch (err: any) {
        alert("刪除失敗：" + err.message);
      }
    }
  };

  const openEditModal = (contact: any) => {
    setEditingContact(contact);
    setEditName(contact.contact_name || "");
    setEditPhone(contact.contact_phone || "");
    setEditTag(contact.relationship_tag || "");
    setEditBirth(contact.birth_date || "");
    setEditAddress(contact.address || "");
  };

  const handleSaveContact = async () => {
    if (!editName) return alert("姓名為必填欄位");
    setIsSavingContact(true);
    try {
      const { error } = await supabase.from("user_contacts").update({
        contact_name: editName,
        contact_phone: editPhone,
        relationship_tag: editTag,
        birth_date: editBirth,
        address: editAddress
      }).eq("id", editingContact.id);

      if (error) throw error;
      setEditingContact(null);
      fetchMemberData();
    } catch (err: any) {
      alert("更新失敗：" + err.message);
    } finally {
      setIsSavingContact(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0]"><div className="w-10 h-10 border-4 border-[#1A432D] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <main className="min-h-screen bg-[#FAF7F0] py-12 px-4 md:px-6 selection:bg-[#A61D24] selection:text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-[#1A432D] tracking-[0.3em]">信眾中心</h1>
        </div>

        {!session ? (
          <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-stone-200/60 space-y-6">
            <p className="text-stone-500 tracking-widest leading-relaxed">請先使用 LINE 登入，即可查詢歷史祈福紀錄與管理常用名冊。</p>
            <Button onClick={() => signIn("line")} className="bg-[#06C755] hover:bg-[#05a546] text-white tracking-widest font-bold px-10 py-7 rounded-full shadow-lg text-lg">使用 LINE 快速登入</Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-stone-800 tracking-wider">{session.user.name}</h2>
                <p className="text-xs text-stone-400 tracking-widest">已完成 LINE 信眾身分認證</p>
              </div>
              <button onClick={() => signOut()} className="text-sm font-bold text-stone-400 hover:text-red-600 transition-colors tracking-widest">
                登出帳戶
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full bg-white border border-stone-200/60 rounded-2xl p-4 flex justify-between items-center text-stone-700 font-bold tracking-widest text-sm shadow-sm"
              >
                <span>{
                  activeMenu === "orders" ? "訂單紀錄查詢" : 
                  activeMenu === "contacts" ? "信眾儲存資訊管理" : "其他帳戶詳細資料"
                }</span>
                <span className="text-stone-400 text-xs transition-transform duration-300" style={{ transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                  ▼
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 shadow-xl rounded-2xl overflow-hidden z-30 divide-y divide-stone-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button onClick={() => { setActiveMenu("orders"); setIsMenuOpen(false); }} className="w-full p-4 text-left text-sm font-bold text-stone-600 hover:bg-stone-50 tracking-widest">訂單紀錄查詢</button>
                  <button onClick={() => { setActiveMenu("contacts"); setIsMenuOpen(false); }} className="w-full p-4 text-left text-sm font-bold text-stone-600 hover:bg-stone-50 tracking-widest">信眾儲存資訊管理</button>
                  <button onClick={() => { setActiveMenu("profile"); setIsMenuOpen(false); }} className="w-full p-4 text-left text-sm font-bold text-stone-400 bg-stone-50/50 cursor-not-allowed tracking-widest">其他詳細資料 (不開放修改)</button>
                </div>
              )}
            </div>

            {/* 區塊 A：訂單紀錄查詢 */}
            {activeMenu === "orders" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {orders.length === 0 ? (
                  <div className="bg-white rounded-[2rem] p-16 text-center border border-dashed text-stone-400 tracking-widest font-medium">目前尚無祈福或問事紀錄</div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm space-y-4">
                      <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                        <div className="space-y-1">
                          <p className="text-xs text-stone-400 font-mono">{new Date(order.created_at).toLocaleDateString('zh-TW')}</p>
                          <h4 className="font-bold text-stone-800 tracking-wide">{order.service_type} - {order.user_name}</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'}`}>
                          {order.status === 'completed' ? '已處理' : '待對帳'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-stone-600 space-y-1 tracking-wide leading-relaxed">
                        <p><span className="text-stone-400 mr-2">祈福明細:</span> {order.service_details}</p>
                        {order.bank_last_5 && <p><span className="text-stone-400 mr-2">對帳後五碼:</span> <span className="font-mono font-bold text-stone-700">{order.bank_last_5}</span></p>}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-stone-50">
                        <p className="text-sm font-bold text-stone-400">總計：<span className="text-lg text-[#A61D24] font-mono">${order.total_price || 0}</span></p>
                        
                        {order.status === 'completed' ? (
                          <button onClick={() => setSelectedOrder(order)} className="bg-white hover:bg-amber-50 border border-[#D89F3C] text-[#D89F3C] px-5 py-2 rounded-xl text-xs font-bold tracking-widest shadow-sm transition-all">
                            感謝狀存根
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-stone-400 tracking-widest">廟方核銷後可調閱平安狀</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 區塊 B：信眾儲存資訊管理 */}
            {activeMenu === "contacts" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {contacts.length === 0 ? (
                  <div className="bg-white rounded-[2rem] p-16 text-center border border-dashed text-stone-400 tracking-widest font-medium">尚未儲存任何信眾名冊資訊</div>
                ) : (
                  <div className="bg-white rounded-3xl border border-stone-200/60 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-stone-50 text-stone-500 font-bold tracking-widest border-b border-stone-100">
                          <tr>
                            <th className="p-4">姓名</th>
                            <th className="p-4">生辰與聯絡</th>
                            <th className="p-4 rounded-tr-xl text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-stone-700 font-medium">
                          {contacts.map((c) => (
                            <tr key={c.id} className="hover:bg-stone-50/40 transition-colors">
                              <td className="p-4">
                                <p className="font-bold text-stone-800">{c.contact_name} <span className="text-xs font-bold px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded ml-1">{c.relationship_tag}</span></p>
                                <p className="text-xs text-stone-400 truncate max-w-[180px] mt-1">{c.address}</p>
                              </td>
                              <td className="p-4 space-y-1">
                                <p className="text-xs text-stone-600 font-mono">{c.birth_date}</p>
                                <p className="text-xs text-stone-400 font-mono">{c.contact_phone || "預設聯絡本人"}</p>
                              </td>
                              <td className="p-4 text-right">
                                <button onClick={() => openEditModal(c)} className="text-xs font-bold text-stone-500 hover:text-[#1A432D] tracking-widest px-3 py-2 mr-1 transition-colors">
                                  編輯
                                </button>
                                <button onClick={() => handleDeleteContact(c.id)} className="text-xs font-bold text-red-500 hover:text-red-700 tracking-widest px-3 py-2 transition-colors">
                                  刪除
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>

      {/* ================= 編輯名冊彈窗 ================= */}
      {editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white border-2 border-stone-100 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-[#1A432D] tracking-widest mb-6 border-l-4 border-[#D89F3C] pl-3">編輯名冊資訊</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500 tracking-widest">信眾姓名</label>
                <input value={editName} onChange={e=>setEditName(e.target.value)} className="w-full bg-stone-50 border border-stone-200 p-3 mt-1 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-500 tracking-widest">關係標籤 (如: 家人、公司)</label>
                <input value={editTag} onChange={e=>setEditTag(e.target.value)} className="w-full bg-stone-50 border border-stone-200 p-3 mt-1 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-500 tracking-widest">聯絡電話 (若留空則聯絡本人)</label>
                <input type="tel" value={editPhone} onChange={e=>setEditPhone(e.target.value)} placeholder="09XX-XXX-XXX" className="w-full bg-stone-50 border border-stone-200 p-3 mt-1 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-500 tracking-widest">農曆生辰</label>
                <input value={editBirth} onChange={e=>setEditBirth(e.target.value)} className="w-full bg-stone-50 border border-stone-200 p-3 mt-1 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-500 tracking-widest">居住地址</label>
                <input value={editAddress} onChange={e=>setEditAddress(e.target.value)} className="w-full bg-stone-50 border border-stone-200 p-3 mt-1 rounded-xl focus:ring-2 focus:ring-[#A61D24] outline-none transition-all font-medium"/>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <Button onClick={handleSaveContact} disabled={isSavingContact} className="w-full bg-[#1A432D] hover:bg-[#122F20] text-white py-6 rounded-xl font-bold tracking-widest">
                {isSavingContact ? "儲存中..." : "確認更新"}
              </Button>
              <Button onClick={() => setEditingContact(null)} className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 py-6 rounded-xl font-bold tracking-widest">
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 古典雙金邊「數位感謝狀」彈窗 ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm transition-all">
          <div className="bg-[#FAF7F0] border-[12px] border-double border-[#D89F3C] p-8 md:p-12 rounded-xl max-w-lg w-full shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="absolute inset-0 bg-[radial-gradient(#D89F3C_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none"></div>

            <div className="space-y-6 relative z-10">
              <h2 className="text-3xl font-black text-[#A61D24] tracking-[0.4em] border-b-2 border-[#D89F3C]/40 pb-4">感 謝 狀</h2>
              
              <div className="py-6 space-y-6 text-[#1A432D] font-bold tracking-[0.2em] leading-loose text-justify text-base md:text-lg">
                <p className="text-left">茲有大德信眾 <span className="text-xl text-[#A61D24] font-black underline decoration-[#D89F3C] decoration-2 underline-offset-4">{selectedOrder.user_name}</span> 閣家，</p>
                <p className="text-indent-8">於西元 {new Date(selectedOrder.created_at).getFullYear()} 年 {new Date(selectedOrder.created_at).getMonth() + 1} 月 {new Date(selectedOrder.created_at).getDate()} 日，誠心護持本宮辦理【<span className="text-[#A61D24]">{selectedOrder.service_details}</span>】之功德。虔誠祈願，神光普照、運勢亨通、消災解厄、大吉大利。</p>
                <p className="text-right text-stone-500 text-sm tracking-widest pt-4">皇府宮 管理委員會 敬頒</p>
              </div>

              <div className="border-t border-stone-200 pt-6 flex flex-col gap-3">
                <p className="text-xs text-stone-400 tracking-widest">提示：長輩信眾可直接按手機電源鍵加音量鍵「截圖」保存至相簿</p>
                <Button 
                  onClick={() => setSelectedOrder(null)} 
                  className="bg-[#1A432D] hover:bg-[#122F20] text-white py-4 rounded-xl font-bold tracking-widest text-sm"
                >
                  關閉存根聯
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}