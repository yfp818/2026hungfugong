"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

export interface CartItem {
  id: string;
  serviceType: "booking" | "lamp" | "burning" | "campaign";
  userName: string;
  userPhone?: string;
  birthDate: string;
  address: string;
  itemDetails: string;
  price: number;
  customBankInfo?: string; // 儲存此項目指定的獨立匯款帳戶
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
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [sharedInfo, setSharedInfo] = useState<SharedInfo>({ userName: "", userPhone: "", birthDate: "", address: "" });
  const [selfProfile, setSelfProfile] = useState<SharedInfo | null>(null);

  const updateSharedInfo = (info: Partial<SharedInfo>) => {
    setSharedInfo(prev => ({ ...prev, ...info }));
  };

  const refreshContacts = async () => {
    if (!session?.user) return;
    const userLineId = session.user.email || session.user.name || "unknown";
    
    const { data: contactsData } = await supabase.from("user_contacts").select("*").eq("user_line_id", userLineId).order("created_at", { ascending: false });
    if (contactsData) setContacts(contactsData);

    const { data: lastOrder } = await supabase.from("service_orders").select("user_name, user_phone, birth_date, address").eq("user_line_id", userLineId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (lastOrder) {
      const profile = { userName: lastOrder.user_name || "", userPhone: lastOrder.user_phone || "", birthDate: lastOrder.birth_date || "", address: lastOrder.address || "" };
      setSelfProfile(profile);
      if (!sharedInfo.userName) updateSharedInfo(profile);
    }
  };

  useEffect(() => {
    if (session?.user) refreshContacts();
  }, [session]);

  const addToCart = async (item: CartItem, saveToContacts = false) => {
    setCartItems(prev => [...prev, item]);
    
    if (saveToContacts && session?.user) {
      const userLineId = session.user.email || session.user.name || "unknown";
      const { data: existing } = await supabase.from("user_contacts").select("id").eq("user_line_id", userLineId).eq("contact_name", item.userName).maybeSingle();

      if (!existing) {
        const isSelf = selfProfile && selfProfile.userName === item.userName;
        await supabase.from("user_contacts").insert([{
          user_line_id: userLineId,
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
    // 💡 防呆機制：避免 Vercel 打包時找不到 Provider 而崩潰
    return {
      cartItems: [],
      addToCart: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
    } as any;
  }
  return context;
}