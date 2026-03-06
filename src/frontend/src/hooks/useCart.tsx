import type React from "react";
import { createContext, useContext, useReducer, useState } from "react";
import type { Product } from "../backend.d";

export interface CartItem {
  product: Product;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; image: string }
  | { type: "REMOVE_ITEM"; productId: bigint }
  | { type: "INCREMENT"; productId: bigint }
  | { type: "DECREMENT"; productId: bigint }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const exists = state.items.find(
        (item) => item.product.id === action.product.id,
      );
      if (exists) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((item) =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }
      return {
        ...state,
        isOpen: true,
        items: [
          ...state.items,
          { product: action.product, quantity: 1, image: action.image },
        ],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) => item.product.id !== action.productId,
        ),
      };
    case "INCREMENT":
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      };
    case "DECREMENT":
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.product.id === action.productId
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          )
          .filter((item) => item.quantity > 0),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: bigint;
  addItem: (product: Product, image: string) => void;
  removeItem: (productId: bigint) => void;
  increment: (productId: bigint) => void;
  decrement: (productId: bigint) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.product.price * BigInt(item.quantity),
    BigInt(0),
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        totalItems,
        totalPrice,
        addItem: (product, image) =>
          dispatch({ type: "ADD_ITEM", product, image }),
        removeItem: (productId) => dispatch({ type: "REMOVE_ITEM", productId }),
        increment: (productId) => dispatch({ type: "INCREMENT", productId }),
        decrement: (productId) => dispatch({ type: "DECREMENT", productId }),
        clearCart: () => dispatch({ type: "CLEAR_CART" }),
        openCart: () => dispatch({ type: "OPEN_CART" }),
        closeCart: () => dispatch({ type: "CLOSE_CART" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
