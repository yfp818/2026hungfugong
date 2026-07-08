"use client";
import { Button } from "@/components/ui/button";

export default function ShareButton({ title }: { title: string }) {
  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `【皇府宮】${title}`,
      text: `推薦一篇文章給您：【皇府宮】${title}\n👉 點此閱讀完整內容：\n`,
      url: url,
    };

    // 判斷手機是否支援原生分享選單
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("分享取消或失敗", err);
      }
    } else {
      // 電腦版或不支援的瀏覽器，改用「複製到剪貼簿」
      navigator.clipboard.writeText(`${shareData.text}${url}`);
      alert("✅ 文章連結已複製！可以直接貼上 LINE 傳給親友。");
    }
  };

  return (
    <Button 
      onClick={handleShare} 
      className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-700 px-8 py-6 rounded-xl tracking-widest shadow-sm font-bold flex items-center justify-center gap-2 transition-all"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
      分享給親友
    </Button>
  );
}