import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ShareButton from "@/components/ShareButton"; // ✨ 引入我們剛剛做的分享按鈕

export const dynamic = 'force-dynamic';

// 🌟 核心魔法：輕量級文章排版翻譯機
const renderSmartContent = (content: string) => {
  const lines = content.split('\n');
  let inList = false;
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // 魔法 1：辨識 **加粗文字**
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-stone-800">$1</strong>');

    if (line.startsWith('# ')) {
      // 魔法 2：辨識 "# " 變成金色大標題
      if (inList) { elements.push('</ul>'); inList = false; }
      elements.push(`<h2 class="text-2xl md:text-3xl font-bold text-[#D89F3C] mt-10 mb-4 tracking-wider leading-snug">${line.substring(2)}</h2>`);
    } else if (line.startsWith('## ')) {
      // 魔法 3：辨識 "## " 變成深綠中標題
      if (inList) { elements.push('</ul>'); inList = false; }
      elements.push(`<h3 class="text-xl md:text-2xl font-bold text-[#1A432D] mt-8 mb-3 tracking-wide">${line.substring(3)}</h3>`);
    } else if (line.startsWith('- ')) {
      // 魔法 4：辨識 "- " 變成精美的條列式重點
      if (!inList) { elements.push('<ul class="list-none space-y-3 my-4 ml-2">'); inList = true; }
      elements.push(`<li class="flex items-start"><span class="text-[#D89F3C] mr-2 text-lg leading-tight">•</span><span class="leading-relaxed">${line.substring(2)}</span></li>`);
    } else {
      // 一般內文
      if (inList) { elements.push('</ul>'); inList = false; }
      if (line.trim() === '') {
        elements.push('<div class="h-4"></div>'); // 保持段落間距
      } else {
        elements.push(`<p class="leading-loose mb-4 text-stone-600 md:text-lg text-justify">${line}</p>`);
      }
    }
  }
  if (inList) { elements.push('</ul>'); }

  return <div dangerouslySetInnerHTML={{ __html: elements.join('') }} />;
};


export default async function NewsDetailPage({ params }: any) {
  const resolvedParams = await Promise.resolve(params);
  const articleId = resolvedParams.id;

  const { data: news, error } = await supabase
    .from("news_events")
    .select("*")
    .eq("id", articleId)
    .single();

  if (error || !news) {
    return (
      <main className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-red-100 max-w-lg">
          <h1 className="text-2xl font-bold text-[#A61D24] mb-4">找不到對應的文章</h1>
          <p className="text-stone-600 mb-2">系統嘗試尋找的文章 ID：<span className="font-mono bg-stone-100 px-2 py-1 rounded text-sm">{articleId}</span></p>
          <p className="text-stone-500 text-sm mb-8">可能原因：該文章已被刪除，或資料庫連線錯誤。</p>
          <Link href="/#announcements">
            <Button className="bg-[#1A432D] text-white hover:bg-[#122F20] tracking-widest rounded-xl">返回首頁</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F0] pt-32 pb-16 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        {news.image_url && (
          <div className="w-full h-64 md:h-[400px] relative bg-stone-100">
            <img src={news.image_url} alt={news.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="p-8 md:p-12">
          {/* 標頭資訊區 */}
          <div className="flex items-center gap-3 mb-6">
            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${news.category === 'event' ? 'bg-[#D89F3C]' : 'bg-stone-400'}`}>
              {news.category === 'event' ? '重點活動' : '本宮公告'}
            </span>
            <span className="text-stone-400 text-sm font-medium tracking-widest">
              {new Date(news.created_at).toLocaleDateString('zh-TW')}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A432D] tracking-wide leading-snug mb-6">
            {news.title}
          </h1>
          <div className="w-12 h-1 bg-[#D89F3C] rounded-full mb-8"></div>
          
          {/* ✨ 內文區塊 (套用聰明排版魔法) */}
          <div className="article-content">
            {renderSmartContent(news.content)}
          </div>

          {/* ✨ 文章底部動作區塊 */}
          <div className="pt-10 mt-10 border-t border-stone-100 flex flex-col gap-4">
            
            {/* 1. 專屬活動報名 CTA 按鈕 (如果有填寫網址才會出現) */}
            {news.action_url && (
              <Link href={news.action_url} className="w-full">
                <Button className="w-full py-8 text-lg bg-[#1A432D] hover:bg-[#122F20] text-[#D89F3C] font-bold tracking-widest rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-300">
                  前往報名專區
                </Button>
              </Link>
            )}

            {/* 2. 分享與返回按鈕列 */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2">
              <ShareButton title={news.title} />
              <Link href="/#announcements" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full px-8 py-6 rounded-xl tracking-widest text-stone-500 border-stone-200 hover:bg-stone-50 transition-colors font-bold">
                  返回列表
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}