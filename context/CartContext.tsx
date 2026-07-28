"use client";
import { useLegacyUser } from "@/lib/auth/useLegacyUser";
import React, { createContext, useContext, useState, useEffect } from "react";
// 引入 Supabase Client 替代 next-auth
import { createClient } from "@/lib/supabase/client";

export interface CartItem {
  id: string;
  serviceType: "booking" | "lamp" | "burning" | "campaign";
  userName: string;
  userPhone?: string;
  birthDate: string;
  address: string;
  itemDetails: string;
  price: number;
  customBankInfo?: string; 
}

export interface UserContact {
  id: string;
  contact_name: string;
  contact_phone?: string;
  relationship_tag: string;
  birth_date: string;
  address: string;
}

export interface SharedInfo {
  userName: string;
  userPhone: string;
  birthDate: string;
  address: string;
}

interface CartContextType {
  cartItems: CartItem[];
  contacts: UserContact[];
  sharedInfo: SharedInfo;
  selfProfile: SharedInfo | null;
  updateSharedInfo: (info: Partial<SharedInfo>) => void;
  addToCart: (item: CartItem, saveToContacts?: boolean) => Promise<void>;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  refreshContacts: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useLegacyUser();
  const supabase = createClient();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [sharedInfo, setSharedInfo] = useState<SharedInfo>({ userName: "", userPhone: "", birthDate: "", address: "" });
  const [selfProfile, setSelfProfile] = useState<SharedInfo | null>(null);

  // 初始化時取得使用者狀態
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const updateSharedInfo = (info: Partial<SharedInfo>) => {
    setSharedInfo(prev => ({ ...prev, ...info }));
  };

  const refreshContacts = async () => {
    // 💡 重要修改：Supabase OIDC 登入後，LINE 的 ID 會存在 user_metadata.sub
    if (!user?.user_metadata?.sub) return;
    const userLineId = user.user_metadata.sub;
    
    const { data: contactsData } = await supabase.from("user_contacts").select("*").eq("line_id", userLineId).order("created_at", { ascending: false });
    if (contactsData) setContacts(contactsData);

    const { data: lastOrder } = await supabase.from("service_orders").select("user_name, user_phone, birth_date, address").eq("user_line_id", userLineId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (lastOrder) {
      const profile = { userName: lastOrder.user_name || "", userPhone: lastOrder.user_phone || "", birthDate: lastOrder.birth_date || "", address: lastOrder.address || "" };
      setSelfProfile(profile);
      if (!sharedInfo.userName) updateSharedInfo(profile);
    }
  };

  useEffect(() => {
    if (user) refreshContacts();
  }, [user]);

  const addToCart = async (item: CartItem, saveToContacts = false) => {
    setCartItems(prev => [...prev, item]);
    
    // 💡 同樣修正取得 LINE ID 的方式
    if (saveToContacts && user?.user_metadata?.sub) {
      const userLineId = user.user_metadata.sub;
      const { data: existing } = await supabase.from("user_contacts").select("id").eq("line_id", userLineId).eq("contact_name", item.userName).maybeSingle();

      if (!existing) {
        const isSelf = selfProfile && selfProfile.userName === item.userName;
        await supabase.from("user_contacts").insert([{
          line_id: userLineId, 
          contact_name: item.userName,
          contact_phone: item.userPhone,
          relationship_tag: isSelf ? "本人" : "親友",
          birth_date: item.birthDate,
          address: item.address
        }]);
        await refreshContacts();
      }
    }
  };

  const removeFromCart = (id: string) => setCartItems(prev => prev.filter(item => item.id !== id));
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, contacts, sharedInfo, selfProfile, updateSharedInfo, addToCart, removeFromCart, clearCart, refreshContacts }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cartItems: [],
      addToCart: async () => {},
      removeFromCart: () => {},
      clearCart: () => {},
    } as any;
  }
  return context;
}