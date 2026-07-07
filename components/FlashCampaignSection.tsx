"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export default function FlashCampaignSection({ campaign }: { campaign: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { contacts, addToCart, updateSharedInfo, selfProfile } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [remarks, setRemarks] = useState(""); 
  const [selectedContactId, setSelectedContactId] = useState("self");
  const [saveToContacts, setSaveToContacts] = useState(true);
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  const campaignOptions = Array.isArray(campaign.options) && campaign.options.length > 0 
    ? campaign.options 
    : [{ title: "活動報名", price: campaign.price || 0 }];
    
  const [optionQuantities, setOptionQuantities] = useState<number[]>(new Array(campaignOptions.length).fill(0));

  const totalPrice = campaignOptions.reduce((sum: number, opt: any, idx: number) => sum + (opt.price * optionQuantities[idx]), 0);

  useEffect(() => {
    if (selfProfile && !name && selectedContactId === "self") {
      setName(selfProfile.userName); setPhone(selfProfile.userPhone);
      setBirthDate(selfProfile.birthDate); setAddress(selfProfile.address);
    }
  }, [selfProfile, isOpen]);

  const handleQtyChange = (index: number, delta: number) => {
    setOptionQuantities(prev => {
      const newQty = [...prev];
      newQty[index] = Math.max(0, newQty[index] + delta);
      return newQty;
    });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedContactId(selectedId);
    if (selectedId === "new") {
      setName(""); setBirthDate(""); setAddress(""); setPhone(selfProfile?.userPhone || "");
    } else if (selectedId === "self") {
      if (selfProfile) { setName(selfProfile.userName); setPhone(selfProfile.userPhone); setBirthDate(selfProfile.birthDate); setAddress(selfProfile.address); }
    } else {
      const contact = contacts.find(c => c.id === selectedId);
      if (contact) { setName(contact.contact_name); setPhone(contact.contact_phone || selfProfile?.userPhone || ""); setBirthDate(contact.birth_date); setAddress(contact.address); }
    }
  };

  const handleConfirmAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPrice === 0) return alert("請至少選擇一種活動方案與數量。");

    updateSharedInfo({ userName: name, userPhone: phone, birthDate, address });
    const safeId = Date.now().toString() + Math.random().toString(36).substring(2);
    const bankString = campaign.campaign_bank_accounts ? `${campaign.campaign_bank_accounts.bank_name} | 帳號: ${campaign.campaign_bank_accounts.account_number}` : "";

    const selectedDetails = campaignOptions
      .map((opt: any, idx: number) => optionQuantities[idx] > 0 ? `${opt.title} x${optionQuantities[idx]} ($${opt.price * optionQuantities[idx]})` : null)
      .filter(Boolean)
      .join("、");

    const details = `特辦活動: ${campaign.title}\n報名方案: ${selectedDetails}${remarks ? `\n(備註: ${remarks})` : ""}`;

    await addToCart({
      id: safeId, serviceType: "campaign", userName: name, userPhone: phone,
      birthDate: birthDate, address: address, itemDetails: details, price: totalPrice, customBankInfo: bankString
    }, saveToContacts);

    setIsOpen(false);
    setShowRedirectModal(true);
  };

  // ✨ 改進：為了讓「價格數字」跟「起」可以分開排版，精準抓取最低金額
  const minPrice = Math.min(...campaignOptions.map((o: any) => o.price));
  const hasMultipleOptions = campaignOptions.length > 1;

  return (
    <div className="w-full bg-white relative border-b border-stone-200/60">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="relative overflow-hidden bg-[#FAF7F0] border-2 border-[#D89F3C]/40 rounded-[2rem] p-6 md:p-10 shadow-lg transition-all hover:shadow-xl group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#A61D24] opacity-[0.02] rounded-full blur-3xl pointer-events-none animate-pulse"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {campaign.image_url && (
              <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden bg-stone-100 shrink-0 shadow-inner">
                <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            )}
            
            <div className="flex-1 space-y-4 text-center md:text-left w-full">
              <span className="inline-flex items-center gap-2 bg-[#A61D24] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
                本月限定快閃特辦活動
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-[#1A432D] tracking-wide">{campaign.title}</h3>
              <p className="text-stone-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{campaign.description}</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 border-t border-stone-200/60">
                
                {/* ✨ 質感深灰排版：主次分明，突顯右側按鈕 */}
                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                  <span className="text-3xl font-black text-stone-700 font-mono tracking-tight">
                    ${minPrice}
                  </span>
                  {hasMultipleOptions && (
                    <span className="text-sm font-bold text-stone-500 tracking-widest">
                      起
                    </span>
                  )}
                </div>

                {session ? (
                  <button onClick={() => setIsOpen(true)} className="w-full sm:w-auto bg-[#1A432D] hover:bg-[#122F20] text-white px-8 py-4 rounded-xl font-bold tracking-widest text-sm shadow-md transition-all">
                    立即線上報名
                  </button>
                ) : (
                  <button onClick={() => signIn("line")} className="w-full sm:w-auto bg-stone-200 hover:bg-stone-300 text-stone-700 px-8 py-4 rounded-xl font-bold tracking-widest text-sm transition-all">
                    登入 LINE 開始登記
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <form onSubmit={handleConfirmAdd} className="bg-white border border-stone-100 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-bold text-[#1A432D] tracking-widest border-l-4 border-[#D89F3C] pl-3">活動報名資料</h3>
              <select value={selectedContactId} onChange={handleContactChange} className="border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold bg-stone-50 text-stone-700 outline-none">
                <option value="self">本人資料</option>
                <option value="new">手動輸入</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.contact_name}</option>)}
              </select>
            </div>
            
            <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <h4 className="text-xs font-bold text-stone-500 tracking-widest mb-3">請選擇欲報名之方案與數量</h4>
              {campaignOptions.map((opt: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-stone-100 shadow-sm">
                  <div>
                    <p className="font-bold text-stone-800 text-sm">{opt.title}</p>
                    <p className="text-[#A61D24] font-mono font-bold mt-1">${opt.price}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-stone-50 rounded-full border border-stone-200 p-1">
                    <button type="button" onClick={() => handleQtyChange(idx, -1)} disabled={optionQuantities[idx] === 0} className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-base transition-all ${optionQuantities[idx] > 0 ? 'bg-white text-stone-600 shadow-sm hover:text-[#A61D24]' : 'text-stone-300 cursor-not-allowed'}`}>-</button>
                    <span className="w-4 text-center font-bold text-stone-700 text-sm">{optionQuantities[idx]}</span>
                    <button type="button" onClick={() => handleQtyChange(idx, 1)} className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-600 font-bold text-base hover:text-[#A61D24] transition-all">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <input required value={name} onChange={e=>setName(e.target.value)} placeholder="信眾姓名" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#A61D24] font-medium"/>
              <input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="聯絡電話" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#A61D24] font-medium"/>
              <input required value={birthDate} onChange={e=>setBirthDate(e.target.value)} placeholder="農曆出生年月日" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#A61D24] font-medium"/>
              <input required value={address} onChange={e=>setAddress(e.target.value)} placeholder="居住完整地址" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#A61D24] font-medium"/>
              <textarea value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="備註說明 (選填，如：特殊需求、指定事項)" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl h-24 resize-none outline-none focus:ring-2 focus:ring-[#A61D24] font-medium"/>
              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input type="checkbox" checked={saveToContacts} onChange={e=>setSaveToContacts(e.target.checked)} className="w-4 h-4 accent-[#A61D24]"/>
                <span className="text-xs font-bold text-stone-600 tracking-widest">儲存至常用名冊</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t items-center">
              <div className="w-1/3">
                 <p className="text-xs text-stone-400 font-bold">總計金額</p>
                 <p className="text-xl text-[#A61D24] font-bold font-mono">${totalPrice}</p>
              </div>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="px-4 py-6 rounded-xl">取消</Button>
              <Button type="submit" className="flex-1 bg-[#A61D24] hover:bg-[#85161C] text-white py-6 rounded-xl font-bold tracking-widest shadow-md">加入清單</Button>
            </div>
          </form>
        </div>
      )}

      {showRedirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-[#FAF7F0] border-2 border-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl space-y-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-white border border-[#D89F3C]/30 shadow-sm rounded-full flex items-center justify-center mx-auto text-[#D89F3C]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-[#1A432D] tracking-widest">已加入祈福清單</h3>
              <p className="text-stone-500 text-sm tracking-widest leading-relaxed">特殊特辦活動已成功暫存於清單中，您可以繼續為家人報名或前往結帳。</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              
              <button onClick={() => { 
                setShowRedirectModal(false); 
                setIsOpen(true);
                setSelectedContactId("new"); 
                setName(""); setBirthDate(""); setAddress(""); setPhone(selfProfile?.userPhone || ""); setRemarks("");
                setOptionQuantities(new Array(campaignOptions.length).fill(0));
              }} className="w-full flex items-center justify-center gap-2 bg-white border border-stone-200 text-[#1A432D] py-4 rounded-xl font-bold tracking-widest shadow-sm transition-all hover:border-[#D89F3C]">
                <svg className="w-5 h-5 text-[#D89F3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                繼續為下一位親友報名
              </button>

              <button onClick={() => router.push("/lamps")} className="w-full flex items-center justify-center gap-2 bg-white border border-stone-200 text-stone-600 py-4 rounded-xl font-bold tracking-widest shadow-sm transition-all hover:border-[#D89F3C]">加購當月點燈</button>
              <button onClick={() => router.push("/cart")} className="w-full bg-[#A61D24] hover:bg-[#85161C] text-white py-4 rounded-xl font-bold tracking-widest shadow-lg transition-all mt-2">前往合併結帳對帳</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}