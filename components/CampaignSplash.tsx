"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CampaignSplash({ campaign }: { campaign: any }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 智慧判斷：若後台有開啟，且使用者當次瀏覽還沒關閉過，才顯示前導頁
    const hasSeen = sessionStorage.getItem(`seen_splash_${campaign.id}`);
    if (!hasSeen && campaign.show_splash) {
      setIsVisible(true);
      document.body.style.overflow = "hidden"; // 鎖定背景滾動
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [campaign]);

  const handleClose = () => {
    sessionStorage.setItem(`seen_splash_${campaign.id}`, "true");
    setIsVisible(false);
    document.body.style.overflow = "auto";
  };

  const handleEnterCampaign = () => {
    sessionStorage.setItem(`seen_splash_${campaign.id}`, "true");
    document.body.style.overflow = "auto";
    router.push(`/campaign/${campaign.id}`);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-6 animate-in fade-in duration-500">
      <div className="bg-[#FAF7F0] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-4 border-[#D89F3C]/50 relative animate-in zoom-in-95 duration-500">
        
        {campaign.image_url ? (
          <div className="w-full aspect-[4/3] bg-stone-100 relative">
            <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-block bg-[#A61D24] text-[10px] font-bold tracking-widest px-3 py-1 rounded-full mb-3 uppercase shadow-md">限 時 活 動</span>
              <h2 className="text-3xl font-bold tracking-widest leading-snug drop-shadow-lg">{campaign.title}</h2>
            </div>
          </div>
        ) : (
          <div className="bg-[#1A432D] p-10 text-center border-b-[6px] border-[#D89F3C]">
            <span className="inline-block bg-[#A61D24] text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full mb-3 uppercase shadow-md">限 時 活 動</span>
            <h2 className="text-3xl font-bold text-white tracking-widest leading-snug">{campaign.title}</h2>
          </div>
        )}

        <div className="p-8 text-center space-y-6">
          <p className="text-stone-600 tracking-widest text-sm leading-relaxed line-clamp-3">
            {campaign.description}
          </p>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={handleEnterCampaign} className="w-full bg-[#A61D24] hover:bg-[#85161C] text-white py-6 rounded-xl font-bold tracking-widest text-lg shadow-lg transform transition-transform active:scale-95">
              進入活動頁面
            </Button>
            <Button onClick={handleClose} variant="ghost" className="w-full text-stone-500 hover:text-stone-800 py-6 rounded-xl font-bold tracking-widest border border-stone-200 hover:bg-stone-100 transition-colors">
              不，直接進入首頁
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}