"use client";
import { useState, useEffect } from "react";

export default function CampaignSplash({ campaign }: { campaign: any }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 檢查瀏覽器紀錄，避免同一次瀏覽一直跳出前導頁打擾信眾
    const hasSeen = sessionStorage.getItem(`splash_seen_${campaign.id}`);
    if (!hasSeen && campaign.show_splash) {
      setIsVisible(true);
    }
  }, [campaign]);

  if (!isVisible) return null;

  // 動作 1：直接關閉前導頁 (進入首頁)
  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem(`splash_seen_${campaign.id}`, "true");
  };

  // 動作 2：關閉前導頁，並平滑往下滾動到活動報名區塊
  const handleGoToCampaign = () => {
    handleClose();
    setTimeout(() => {
      // 往下滾動一個螢幕的高度 (因為首頁主視覺剛好是 100vh)
      window.scrollTo({
        top: window.innerHeight * 0.9, 
        behavior: "smooth"
      });
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="bg-background w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-500">
        {campaign.image_url && (
          <div className="relative aspect-square w-full bg-stone-100">
            <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-[#A61D24] text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-widest shadow-md">
              限時活動
            </div>
            {/* 漸層遮罩讓文字更清楚 */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-24">
              <h2 className="text-white text-2xl font-bold tracking-widest drop-shadow-lg">{campaign.title}</h2>
            </div>
          </div>
        )}
        
        <div className="p-6 space-y-4 text-center bg-card">
          <p className="text-stone-400 text-sm tracking-widest font-mono font-bold">
            {new Date(campaign.created_at).toLocaleDateString('zh-TW')}
          </p>
          <div className="space-y-3 pt-2">
            <button onClick={handleGoToCampaign} className="w-full bg-[#A61D24] hover:bg-[#85161C] text-white py-4 rounded-xl font-bold tracking-widest shadow-lg transition-all transform hover:scale-[1.02]">
              進入活動頁面
            </button>
            <button onClick={handleClose} className="w-full bg-muted border border-border text-muted-foreground hover:bg-stone-100 hover:text-stone-700 py-4 rounded-xl font-bold tracking-widest transition-all">
              不，直接進入首頁
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}