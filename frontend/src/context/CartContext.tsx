"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, MenuItem } from "@/types";

interface CartContextType {
  items: CartItem[]; tableId: string | null; tableNumber: number | null;
  setTable: (id: string, number: number) => void;
  addItem: (item: MenuItem) => void; removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateInstructions: (itemId: string, instructions: string) => void;
  clearCart: () => void; totalItems: number; subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableId, setTableId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(null);

  const setTable = (id: string, num: number) => { setTableId(id); setTableNumber(num); };

  const addItem = (menuItem: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === menuItem.id);
      if (existing) return prev.map((i) => i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { menuItem, quantity: 1, specialInstructions: "" }];
    });
  };

  const removeItem = (itemId: string) => setItems((prev) => prev.filter((i) => i.menuItem.id !== itemId));

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(itemId);
    setItems((prev) => prev.map((i) => (i.menuItem.id === itemId ? { ...i, quantity } : i)));
  };

  const updateInstructions = (itemId: string, instructions: string) => {
    setItems((prev) => prev.map((i) => (i.menuItem.id === itemId ? { ...i, specialInstructions: instructions } : i)));
  };

  const clearCart = () => setItems([]);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, tableId, tableNumber, setTable, addItem, removeItem, updateQuantity, updateInstructions, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
