import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader"; 
import AuthProvider from "@/components/AuthProvider"; 
import { CartProvider } from "@/context/CartContext";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import FloatingCartButton from "@/components/FloatingCartButton";
import { ThemeProvider } from "@/components/ThemeProvider"; 

// 設定主要黑體 (內文使用)
const notoSans = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// ✨ 設定莊嚴宋體，並宣告一個 CSS 變數 `--font-noto-serif`
export const notoSerif = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: '--font-noto-serif', // 👈 關鍵就在這一行！
});

export const metadata: Metadata = {
  title: "皇府宮 - 官方網站",
  description: "線上預約問事與祈福點燈系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" data-scroll-behavior="smooth" suppressHydrationWarning>
      {/* ✨ 在 body 標籤中加入 notoSerif.variable，讓全站都能取用這個字體 */}
      <body className={`${notoSans.className} ${notoSerif.variable} antialiased bg-stone-50 text-stone-900 dark:bg-[#121212] dark:text-stone-100 transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <SiteHeader fontClassName={notoSerif.className} />
              {children}
              <FloatingCartButton />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}