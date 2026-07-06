import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// 告訴 Next.js 這是一個動態頁面，不要快取它
export const dynamic = 'force-dynamic';

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  // 透過網址上的 id，去資料庫把這篇文章的詳細內容抓出來
  const { data: news } = await supabase
    .from("news_events")
    .select("*")
    .eq("id", params.id)
    .single();

  // 如果找不到這篇文章，才顯示 404
  if (!news) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FAF7F0] pt-32 pb-16 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        
        {/* 如果文章有附圖，就在上方顯示大圖 */}
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