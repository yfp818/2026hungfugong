export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notoSerif } from "./layout";
import { supabase } from "@/lib/supabase";
import AOSProvider from "@/components/AOSProvider"; 
import FlashCampaignSection from "@/components/FlashCampaignSection";
import CampaignSplash from "@/components/CampaignSplash"; 

// 過濾排版符號的魔法濾網
const stripMarkdown = (text: string) => {
  if (!text) return "";
  return text
    .replace(/#{1,3}\s/g, "")      
    .replace(/\*\*(.*?)\*\*/g, "$1") 
    .replace(/-\s/g, "");          
};

export default async function Home() {
  const { data: introData } = await supabase.from("site_content").select("*").eq("id", "homepage_intro").single();
  const displayTitle = introData?.title || "相信就會看見";
  const displayContent = introData?.content || "勇敢才能無畏";
  const displayImage = introData?.image_url || ""; 
  const opacityValue = introData?.bg_opacity ?? 40;

  const { data: activeCampaign } = await supabase
    .from("flash_campaigns")
    .select("*, campaign_bank_accounts(*)")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  const { data: newsData } = await supabase.from("news_events").select("*").order("created_at", { ascending: false });
  const newsList = newsData || [];
  const listAnnouncements = newsList.filter((n: any) => n.category === 'news' || !n.category);
  const listEvents = newsList.filter((n: any) => n.category === 'event');

  const { data: servicesData } = await supabase.from("blessing_services").select("*").order("created_at", { ascending: true });
  const dynamicServices = servicesData || [];

  // ✨ 新增：抓取目前正在「開放中」的獨立專款專案
  const { data: spData } = await supabase.from("special_projects").select("*").eq("is_active", true).order("created_at", { ascending: false });
  const specialProjects = spData || [];

  const { data: footerDataRaw } = await supabase.from("site_content").select("*").eq("id", "site_footer").single();
  let footerData = {
    address: "920 台灣屏東縣潮州鎮太平路602號",
    phone: "服務請洽 LINE 官方客服",
    lineUrl: "https://lin.ee/uHaPx59",
    igUrl: "https://www.instagram.com/guan__dijun?igsh=ajk0cXVteHJicTFr&utm_source=qr",
    bankName: "連線商業銀行 (824)",
    bankAccount: "111006479907",
    showBankInfo: false
  };
  
  if (footerDataRaw?.content) {
    try {
      const parsed = JSON.parse(footerDataRaw.content);
      footerData = { ...footerData, ...parsed };
    } catch (e) { console.error("解析頁尾資訊失敗", e); }
  }

  return (
    <main className="min-h-screen bg-background dark:bg-[#121212] selection:bg-[#A61D24] selection:text-white transition-colors duration-500">
      
      {activeCampaign && <CampaignSplash campaign={activeCampaign} />}
      <AOSProvider />

      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes customFadeInUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-hero { opacity: 0; animation: customFadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 0.1s; } .delay-300 { animation-delay: 0.3s; } .delay-500 { animation-delay: 0.5s; }
      `}</style>

      {/* ================= 區塊一：主視覺 ================= */}
      <section className="relative w-full min-h-[100dvh] overflow-hidden flex flex-col justify-center">
        {displayImage && <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${displayImage}')` }} />}
        <div className="absolute inset-0 z-10 bg-black transition-opacity duration-500" style={{ opacity: opacityValue / 100 }} />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 h-full flex flex-col py-24 md:py-32">
          <div className="flex-1 flex justify-center md:justify-end items-center w-full mt-10 md:mt-0">
            <div className="flex flex-row-reverse flex-wrap justify-center gap-6 md:gap-10">
              <h1 className={`animate-hero delay-100 ${notoSerif.className} text-4xl md:text-6xl lg:text-7xl text-white font-bold tracking-[0.3em] [writing-mode:vertical-rl] drop-shadow-2xl`}>
                {displayTitle.split('\n').map((line: string, index: number) => <span key={index} className="block">{line}</span>)}
              </h1>
              <p className={`animate-hero delay-300 ${notoSerif.className} text-2xl md:text-4xl lg:text-5xl text-white/90 font-bold tracking-[0.3em] leading-loose [writing-mode:vertical-rl] drop-shadow-2xl`}>
                {displayContent.split('\n').map((line: string, index: number) => <span key={index} className="block">{line}</span>)}
              </p>
            </div>
          </div>

          <div className="animate-hero delay-500 pt-16 pb-8 md:pb-0 flex justify-center md:justify-start gap-4 shrink-0 w-full relative z-30">
            <Link href="/lamps"><Button size="lg" className="w-32 md:w-40 bg-[#A61D24] text-white hover:bg-[#85161C] tracking-wider border border-[#A61D24] shadow-lg rounded-xl">開始祈福</Button></Link>
            <Link href="/booking"><Button size="lg" variant="outline" className="w-32 md:w-40 tracking-wider bg-transparent text-white border-white hover:bg-card text-card-foreground hover:text-[#A61D24] shadow-lg rounded-xl">預約問事</Button></Link>
          </div>
        </div>

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 animate-bounce flex flex-col items-center text-white/60 drop-shadow-md hidden md:flex">
          <span className="text-[10px] tracking-[0.3em] mb-2 font-medium">往下滑動</span>
          <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {activeCampaign && <FlashCampaignSection campaign={activeCampaign} />}

      {/* ================= 區塊二：本宮公告 ================= */}
      {listAnnouncements.length > 0 && (
        <div id="announcements" className="w-full bg-card text-card-foreground dark:bg-[#121212] relative z-20 transition-colors duration-500">
          <section className="py-24 px-6 max-w-7xl mx-auto" data-aos="fade-up">
            <div className="flex flex-col md:flex-row gap-12 md:gap-24">
              <div className="flex flex-col items-center md:items-start shrink-0">
                <h2 className={`${notoSerif.className} text-4xl md:text-5xl font-bold text-slate-800 dark:text-stone-200 tracking-[0.4em] leading-[1.5] transition-colors`}>
                  <span className="block">本 宮</span><span className="block">公 告</span>
                </h2>
                <div className="flex items-center mt-6 w-32"><div className="h-[2px] w-full bg-[#1A432D] dark:bg-[#D89F3C]"></div><div className="w-4 h-4 border-[2px] border-[#D89F3C] rounded-full shrink-0 -ml-2 bg-card dark:bg-[#121212] z-10"></div><div className="h-[4px] w-12 bg-[#1A432D] dark:bg-[#D89F3C] shrink-0 -ml-1 rounded-r-full"></div></div>
              </div>

              <div className="flex-1 flex flex-col w-full border-t border-border dark:border-stone-800 md:border-none">
                {listAnnouncements.map((news: any) => (
                  <Link href={`/news/${news.id}`} key={news.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b border-stone-100 dark:border-stone-800/50 hover:bg-muted dark:hover:bg-stone-900/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <svg className="w-5 h-5 text-[#D89F3C] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z"/></svg>
                      <h3 className="text-lg md:text-xl font-bold text-[#1A432D] dark:text-[#D89F3C] group-hover:text-[#A61D24] transition-colors line-clamp-1">{news.title}</h3>
                    </div>
                    <span className="text-stone-400 dark:text-muted-foreground text-sm mt-3 sm:mt-0 font-medium tracking-widest shrink-0 sm:ml-4">{new Date(news.created_at).toISOString().split('T')[0]}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ================= 區塊三：重點活動 ================= */}
      {listEvents.length > 0 && (
        <div id="events" className="w-full bg-background dark:bg-[#1A1A1A] border-t border-border dark:border-stone-800/50 transition-colors duration-500">
          <section className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
            <div className="text-center md:text-right mb-16 md:mb-24 pr-4" data-aos="fade-up">
              <h2 className={`${notoSerif.className} text-4xl md:text-5xl font-bold tracking-widest text-[#1A432D] dark:text-[#D89F3C] mb-4 transition-colors`}>重點活動</h2>
              <div className="w-full h-[2px] bg-[#D89F3C] mt-6 relative"><div className="absolute right-12 -top-[6px] w-3 h-3 border-2 border-[#D89F3C] rounded-full bg-background dark:bg-[#1A1A1A]"></div></div>
            </div>
            
            <div className="space-y-24 md:space-y-40">
              {listEvents.map((news: any, index: number) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={news.id} data-aos="fade-up" className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center md:items-stretch group`}>
                    {news.image_url && (
                      <Link href={`/news/${news.id}`} className="w-full md:w-[65%] aspect-[4/5] md:aspect-[4/3] overflow-hidden relative rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.1)] shrink-0 block z-0 cursor-pointer">
                        <img src={news.image_url} alt={news.title} className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110" />
                      </Link>
                    )}

                    <div className={`w-[90%] md:w-[45%] relative z-10 -mt-24 md:mt-auto md:mb-auto ${isEven ? 'md:-ml-24 lg:-ml-32' : 'md:-mr-24 lg:-mr-32'} bg-card/85 dark:bg-[#2A2A2A]/85 backdrop-blur-xl border border-white/50 dark:border-stone-700/50 rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 group-hover:-translate-y-2 flex flex-col`}>
                      <p className="text-[#D89F3C] text-sm tracking-widest mb-4 font-bold border-b border-border dark:border-stone-700 pb-4 inline-block md:w-full">{new Date(news.created_at).toLocaleDateString('zh-TW')}</p>
                      <Link href={`/news/${news.id}`}><h3 className={`${notoSerif.className} text-2xl md:text-4xl font-bold text-[#1A432D] dark:text-stone-100 mb-6 tracking-wide leading-snug hover:text-[#A61D24] dark:hover:text-[#D89F3C] transition-colors whitespace-pre-wrap`}>{news.title}</h3></Link>
                      <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-8 text-justify md:text-lg line-clamp-4 whitespace-pre-wrap flex-1">{stripMarkdown(news.content)}</p>
                      <div className="flex justify-end pt-2">
                        <Link href={`/news/${news.id}`} className="text-sm font-medium tracking-widest text-stone-400 hover:text-[#A61D24] dark:hover:text-[#D89F3C] transition-colors group-hover:translate-x-1 duration-300">閱讀全文 →</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ================= 區塊四：祈福專區 ================= */}
      {dynamicServices.length > 0 && (
        <section id="services" className="pb-24 pt-24 w-full bg-card text-card-foreground dark:bg-[#121212] border-t border-stone-100 dark:border-stone-800 transition-colors duration-500">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className={`${notoSerif.className} text-3xl md:text-4xl font-bold tracking-widest text-[#A61D24] dark:text-[#D89F3C] mb-4 transition-colors`}>祈 福 專 區</h2>
            <p className="text-lg tracking-widest text-muted-foreground dark:text-stone-400 font-medium">點亮心燈 照慧平安</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-6">
            {dynamicServices.map((service: any, index: number) => (
              <Link key={service.id} href={service.link_url || "#"} data-aos="fade-up" data-aos-delay={index * 100} className="group relative block w-full outline-none">
                <div className="w-full bg-[#1A432D] border-[2px] border-[#D89F3C] rounded-full py-6 px-8 flex justify-between items-center shadow-[0_10px_20px_rgba(26,67,45,0.2)] group-hover:shadow-[0_20px_40px_rgba(216,159,60,0.4)] group-hover:-translate-y-2 group-hover:bg-[#122F20] transition-all duration-300 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                  <h3 className={`${notoSerif.className} text-xl md:text-2xl font-bold text-[#FAF7F0] tracking-[0.2em] z-10 relative`}>{service.title.replace(/\n/g, ' ')}</h3>
                  <span className="text-[#D89F3C] text-2xl z-10 relative group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ================= 區塊 4.5：獨立專款專案 (✨ 全新專屬顯示區) ================= */}
      {specialProjects.length > 0 && (
        <section id="special-projects" className="pb-32 w-full bg-card text-card-foreground dark:bg-[#121212] transition-colors duration-500 relative overflow-hidden">
          {/* 帝王金裝飾背景 */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D89F3C]/5 via-transparent to-transparent pointer-events-none"></div>

          <div className="text-center mb-16 relative z-10" data-aos="fade-up">
            <h2 className={`${notoSerif.className} text-3xl md:text-4xl font-bold tracking-widest text-[#D89F3C] mb-4 drop-shadow-sm`}>專 款 專 案</h2>
            <p className="text-lg tracking-widest text-muted-foregroundv font-bold">功德無量 福報延綿</p>
          </div>

          <div className="max-w-5xl mx-auto px-6 space-y-12 relative z-10">
            {specialProjects.map((sp: any, index: number) => (
              <div key={sp.id} data-aos="fade-up" data-aos-delay={index * 100} className="bg-gradient-to-br from-[#FAF7F0] to-white dark:from-[#2A2A2A] dark:to-[#1A1A1A] rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-[#D89F3C]/30 flex flex-col md:flex-row gap-8 items-center group hover:border-[#D89F3C]/60 transition-all duration-500">

                {sp.image_url && (
                  <div className="w-full md:w-2/5 aspect-[4/3] rounded-[1.5rem] overflow-hidden shrink-0 relative shadow-md">
                     <img src={sp.image_url} alt={sp.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     <div className="absolute top-4 left-4 bg-[#A61D24] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-widest shadow-lg">獨立專戶辦理</div>
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-center h-full w-full">
                  <h3 className={`${notoSerif.className} text-2xl md:text-3xl font-bold text-[#1A432D] dark:text-stone-100 mb-4 tracking-wide leading-snug`}>{sp.title}</h3>
                  <p className="text-muted-foreground dark:text-stone-400 leading-relaxed mb-8 line-clamp-3 text-justify font-medium">{sp.description}</p>

                  <div className="mt-auto">
                    <Link href={`/project/${sp.id}`} className="block">
                      <Button className="w-full bg-[#D89F3C] hover:bg-[#c48d2e] text-white py-7 rounded-2xl font-bold tracking-widest text-lg shadow-lg transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                        前往專屬認捐網頁
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </Button>
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= 區塊五：頁尾 ================= */}
      <footer id="footer" className="bg-[#1A432D] text-white border-t-[8px] border-[#D89F3C]">
        <div className={`mx-auto px-6 py-16 md:py-24 grid grid-cols-1 gap-12 lg:gap-16 transition-all duration-500 ${
          footerData.showBankInfo ? 'max-w-7xl lg:grid-cols-3' : 'max-w-5xl md:grid-cols-2'
        }`}>
          <div className="space-y-8 flex flex-col justify-center">
            <h3 className={`${notoSerif.className} text-3xl font-bold tracking-widest mb-4`}>皇府宮</h3>
            <div className="space-y-5 text-white/85 font-medium tracking-wide">
              <p className="flex items-start gap-4">
                <svg className="w-5 h-5 text-[#D89F3C] mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="leading-relaxed">{footerData.address}</span>
              </p>
              <p className="flex items-start gap-4">
                <svg className="w-5 h-5 text-[#D89F3C] mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span className="leading-relaxed">{footerData.phone}</span>
              </p>
            </div>
            
            <div className="flex gap-4 pt-6">
              {footerData.lineUrl && (
                <a href={footerData.lineUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-[#06C755] hover:border-[#06C755] transition-colors group">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor"><path d="M22.5 10.9c0-4.3-4.3-7.8-9.5-7.8s-9.5 3.5-9.5 7.8c0 3.8 2.6 7 6.4 7.6.2.1.6.2.7.4l-.2 1.9c0 .1-.1.3.1.5.2.2.5.1.7 0 .2-.1 3-1.8 4.6-3.4 3-2.1 4.7-4.4 4.7-7z"/></svg>
                </a>
              )}
              {footerData.igUrl && (
                <a href={footerData.igUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:border-transparent transition-all group">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
            </div>
          </div>

          <div className="w-full h-64 md:h-[320px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative group">
            <iframe 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(footerData.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full absolute inset-0" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <a href="https://share.google/fRc8RL35ospbZZPoa" target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
              <Button className="bg-[#A61D24] text-white hover:bg-[#85161C] rounded-full px-8 tracking-widest shadow-2xl transform hover:scale-105 transition-all">開啟 Google 導航</Button>
            </a>
          </div>

        </div>
        
        <div className="bg-[#122F20] text-center py-6 text-white/40 text-xs tracking-widest border-t border-white/5">
          © {new Date().getFullYear()} 皇府宮 All Rights Reserved.
        </div>
      </footer>
    </main>
  );
}