import { createContext, type ReactNode, useContext, useState } from "react";

import { addLine, type CartLine, cartCount, cartTotal, setQuantity } from "./cart";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  total: number;
  add: (line: Omit<CartLine, "quantity">) => void;
  setQuantity: (id: string, quantity: number) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  return (
    <CartContext.Provider
      value={{
        lines,
        count: cartCount(lines),
        total: cartTotal(lines),
        add: (line) => setLines((current) => addLine(current, line)),
        setQuantity: (id, quantity) => setLines((current) => setQuantity(current, id, quantity)),
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
