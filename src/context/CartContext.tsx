import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { CartItem, Seat, Event } from '../types';
import type { SelectedLecture } from '../data/organizer';

interface CartContextType {
  items: CartItem[];
  addItem: (seat: Seat, event: Event) => void;
  removeItem: (seatId: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
  selectedLectures: SelectedLecture[];
  setSelectedLectures: (lectures: SelectedLecture[]) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedLectures, setSelectedLectures] = useState<SelectedLecture[]>([]);

  const addItem = useCallback((seat: Seat, event: Event) => {
    setItems(prev => {
      if (prev.find(i => i.seat.id === seat.id)) return prev;
      return [...prev, { seat, event }];
    });
  }, []);

  const removeItem = useCallback((seatId: string) => {
    setItems(prev => prev.filter(i => i.seat.id !== seatId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setSelectedLectures([]);
  }, []);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.seat.price, 0), [items]);
  const count = items.length;

  const value = useMemo(
    () => ({ items, addItem, removeItem, clearCart, total, count, selectedLectures, setSelectedLectures }),
    [items, addItem, removeItem, clearCart, total, count, selectedLectures],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
