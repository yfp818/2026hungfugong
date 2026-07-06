import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader"; 
import AuthProvider from "@/components/AuthProvider"; 
import { CartProvider } from "@/context/CartContext";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import FloatingCartButton from "@/components/FloatingCartButton"; // 引入剛剛獨立的浮動按鈕

const notoSans = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const notoSerif = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["700", "900"],
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
    <html lang="zh-TW" data-scroll-behavior="smooth">
      <body className={`${notoSans.className} antialiased bg-stone-50 text-stone-900`}>
        {/* 驗證與購物車的雙重防護罩 */}
        <AuthProvider>
          <CartProvider>
            <SiteHeader fontClassName={notoSerif.className} />
            {children}
            {/* 浮動購物車按鈕放在這裡，全站皆可顯示 */}
            <FloatingCartButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}