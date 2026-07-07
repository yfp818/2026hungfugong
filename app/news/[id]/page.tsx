import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

// 💡 修正 1：加上 any，並使用 Promise 處理最新版 Next.js 的參數
export default async function NewsDetailPage({ params }: any) {
  // 正確解開網址參數
  const resolvedParams = await Promise.resolve(params);
  const articleId = resolvedParams.id;

  // 向資料庫請求文章，並同時捕捉錯誤 (error)
  const { data: news, error } = await supabase
    .from("news_events")
    .select("*")
    .eq("id", articleId)
    .single();

  // 💡 修正 2：拔掉粗暴的 404 畫面。如果查不到資料，顯示清楚的錯誤原因！
  if (error || !news) {
    return (
      <main className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-red-100 max-w-lg">
          <h1 className="text-2xl font-bold text-[#A61D24] mb-4">找不到對應的文章</h1>
          <p className="text-stone-600 mb-2">系統嘗試尋找的文章 ID：<span className="font-mono bg-stone-100 px-2 py-1 rounded text-sm">{articleId}</span></p>
          <p className="text-stone-500 text-sm mb-8">可能原因：該文章已被刪除，或資料庫連線錯誤。</p>
          <p className="text-xs text-stone-400 mb-8 border-t pt-4">系統錯誤代碼：{error?.message || "無"}</p>
          <Link href="/#announcements">
            <Button className="bg-[#1A432D] text-white hover:bg-[#122F20] tracking-widest rounded-xl">
              返回首頁
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  // 👇 以下為正常顯示文章的完美排版
  return (
    <main className="min-h-screen bg-[#FAF7F0] pt-32 pb-16 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        {news.image_url && (
          <div className="w-full h-64 md:h-96 relative bg-stone-100">
            <img src={news.image_url} alt={news.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-8 md:p-12 space-y-6">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${news.category === 'event' ? 'bg-[#D89F3C]' : 'bg-stone-400'}`}>
              {news.category === 'event' ? '重點活動' : '本宮公告'}
            </span>
            <span className="text-stone-400 text-sm font-medium tracking-widest">
              {new Date(news.created_at).toLocaleDateString('zh-TW')}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A432D] tracking-wide leading-snug">
            {news.title}
          </h1>
          <div className="w-12 h-1 bg-[#D89F3C] rounded-full"></div>
          <div className="text-stone-600 leading-loose whitespace-pre-wrap text-lg pt-4">
            {news.content}
          </div>
          <div className="pt-12 mt-8 border-t border-stone-100 flex justify-center">
            <Link href="/#announcements">
              <Button variant="outline" className="px-8 py-6 rounded-xl tracking-widest text-stone-500 border-stone-200 hover:bg-stone-50 transition-colors">
                返回首頁
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}