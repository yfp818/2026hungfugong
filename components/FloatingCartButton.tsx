"use client";
import Link from "next/link";
import { usePathname } from "next/navigation"; // 💡 1. 引入偵測網址的工具
import { useCart } from "@/context/CartContext";

export default function FloatingCartButton() {
  const { cartItems } = useCart();
  const pathname = usePathname(); // 💡 2. 取得目前的網址
  
  // 💡 3. 關鍵防護：如果目前在後台，就直接回傳 null (隱藏按鈕！)
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  // ✨ 已經加上了 id="global-cart-btn" 作為隱形斗篷的定位點
  return (
    <Link id="global-cart-btn" href="/cart" className="fixed bottom-24 right-8 z-50 bg-[#A61D24] text-white w-14 h-14 rounded-full shadow-2xl hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(166,29,36,0.5)] transition-all duration-300 flex items-center justify-center group border-2 border-white/20">
      <div className="relative">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        
        {/* 只有當購物車內有物品時，才顯示右上角的黃色數量標籤 */}
        {cartItems.length > 0 && (
          <span className="absolute -top-3 -right-4 bg-[#D89F3C] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
            {cartItems.length}
          </span>
        )}
      </div>
    </Link>
  );
}