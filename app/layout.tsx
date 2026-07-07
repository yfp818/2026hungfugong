import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader"; 
import AuthProvider from "@/components/AuthProvider"; 
import { CartProvider } from "@/context/CartContext";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import FloatingCartButton from "@/components/FloatingCartButton";
import { ThemeProvider } from "@/components/ThemeProvider"; 

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
  // ✨ 註解移到 return 外面就安全了
  return (
    <html lang="zh-TW" data-scroll-behavior="smooth" suppressHydrationWarning>
<body className={`${notoSans.className} antialiased bg-stone-50 text-stone-900 dark:bg-[#121212] dark:text-stone-100 transition-colors duration-300`}>
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