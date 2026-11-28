import { createContext, type ReactNode, useContext, useState } from "react";

import { type Buyer, EMPTY_BUYER } from "./buyer";
import { addLine, type CartLine, cartCount, cartTotal, setQuantity } from "./cart";

interface CartContextValue {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  buyer: Buyer;
  setBuyer: (patch: Partial<Buyer>) => void;
  count: number;
  total: number;
  add: (line: Omit<CartLine, "quantity">) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [buyer, setBuyerState] = useState<Buyer>(EMPTY_BUYER);

  return (
    <CartContext.Provider
      value={{
        lines,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        buyer,
        setBuyer: (patch) => setBuyerState((current) => ({ ...current, ...patch })),
        count: cartCount(lines),
        total: cartTotal(lines),
        add: (line) => setLines((current) => addLine(current, line)),
        setQuantity: (id, quantity) => setLines((current) => setQuantity(current, id, quantity)),
        clear: () => {
          setLines([]);
          setBuyerState(EMPTY_BUYER);
        },
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
