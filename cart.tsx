import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from './types';

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;
  subtotal: number;
  count: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem,'uid'>) => void;
  removeItem: (uid:string) => void;
  setQuantity: (uid:string, quantity:number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'tuffao-cart-v2';

export function CartProvider({children}:{children:ReactNode}) {
  const [items,setItems] = useState<CartItem[]>([]);
  const [isOpen,setIsOpen] = useState(false);
  const [hydrated,setHydrated] = useState(false);

  useEffect(()=>{
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  },[]);

  useEffect(()=>{
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(items)); } catch {}
  },[items,hydrated]);

  const addItem = useCallback((item:Omit<CartItem,'uid'>)=>{
    setItems(current=>{
      const sig=(i:Omit<CartItem,'uid'>)=>JSON.stringify([i.refId,i.badge??'',i.unitPrice,i.pieces]);
      const existing=current.find(i=>sig(i)===sig(item));
      if(existing) return current.map(i=>i.uid===existing.uid?{...i,quantity:i.quantity+1}:i);
      return [...current,{...item,uid:`${item.refId}-${crypto.randomUUID()}`}];
    });
  },[]);

  const removeItem = useCallback((uid:string)=>setItems(c=>c.filter(i=>i.uid!==uid)),[]);
  const setQuantity = useCallback((uid:string,quantity:number)=>setItems(c=>c.map(i=>i.uid===uid?{...i,quantity:Math.max(1,Math.min(20,quantity))}:i)),[]);
  const clear = useCallback(()=>setItems([]),[]);

  const value=useMemo(()=>({
    items,isOpen,hydrated,
    subtotal:items.reduce((s,i)=>s+i.unitPrice*i.quantity,0),
    count:items.reduce((s,i)=>s+i.quantity,0),
    openCart:()=>setIsOpen(true),closeCart:()=>setIsOpen(false),addItem,removeItem,setQuantity,clear,
  }),[items,isOpen,hydrated,addItem,removeItem,setQuantity,clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(){
  const ctx=useContext(CartContext);
  if(!ctx) throw new Error('useCart precisa estar dentro de CartProvider');
  return ctx;
}
