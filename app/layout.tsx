"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";

export default function LampsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  // 表單狀態
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    async function loadProducts() {
      // 💡 精準抓取後台 category 為 'lamp' 的商品
      const { data } = await supabase.from("blessing_products").select("*").eq("category", "lamp").order("created_at", { ascending: true });
      if (data) setProducts(data);
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  const handleAddToCart = () => {
    if (!selectedProduct) return alert("請先選擇要點的燈種！");
    if (!userName || !birthDate || !address) return alert("請填寫完整的祈福人資料（姓名、生日、地址）");

    addToCart({
      id: Date.now().toString(),
      serviceType: "lamp",
      userName,
      userPhone,
      birthDate,
      address,
      itemDetails: selectedProduct.title,
      price: selectedProduct.price,
    });

    alert(`✅ 已將「${selectedProduct.title}」加入祈福清單！\n您可繼續為其他家人填寫，或點擊右下角購物車結帳。`);
    
    // 清空表單，方便為下一位家人填寫
    setUserName(""); 
    setBirthDate(""); 
    setSelectedProduct(null);
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4 md:px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-[#A61D24] dark:text-red-400 tracking-widest">當月點燈祈福</h1>
          <p className="text-muted-foreground tracking-widest">祈求平安順心，照亮前程</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">載入點燈項目中...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 左側：選擇燈種 */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold border-l-4 border-[#D89F3C] pl-3">選擇燈種</h3>
              <div className="grid grid-cols-1 gap-4">
                {products.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedProduct(p)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${selectedProduct?.id === p.id ? 'border-[#A61D24] dark:border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-border bg-card hover:border-[#D89F3C]'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-lg">{p.title}</h4>
                      <span className="text-[#A61D24] dark:text-red-400 font-bold">${p.price}</span>
                    </div>
                    {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* 右側：祈福人資料表單 */}
            <div className="bg-card p-6 md:p-8 rounded-[2rem] border border-border shadow-sm space-y-6">
              <h3 className="text-xl font-bold border-l-4 border-[#1A432D] dark:border-emerald-500 pl-3">祈福人資料</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">姓名 <span className="text-red-500">*</span></label>
                  <input value={userName} onChange={e=>setUserName(e.target.value)} placeholder="祈福人姓名" className="w-full bg-background border border-border p-3 rounded-xl outline-none focus:border-[#D89F3C]"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">聯絡電話</label>
                  <input value={userPhone} onChange={e=>setUserPhone(e.target.value)} placeholder="09xxxxxxxx" className="w-full bg-background border border-border p-3 rounded-xl outline-none focus:border-[#D89F3C]"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">農曆生日 (生辰) <span className="text-red-500">*</span></label>
                  <input value={birthDate} onChange={e=>setBirthDate(e.target.value)} placeholder="例：甲辰年五月初五吉時" className="w-full bg-background border border-border p-3 rounded-xl outline-none focus:border-[#D89F3C]"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">居住地址 <span className="text-red-500">*</span></label>
                  <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="祈福人居住地址" className="w-full bg-background border border-border p-3 rounded-xl outline-none focus:border-[#D89F3C]"/>
                </div>
              </div>

              <button 
                onClick={handleAddToCart} 
                className="w-full bg-[#1A432D] hover:bg-[#122F20] dark:bg-emerald-800 dark:hover:bg-emerald-900 text-white py-4 rounded-xl font-bold tracking-widest shadow-md transition-colors"
              >
                加入祈福合併清單
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}