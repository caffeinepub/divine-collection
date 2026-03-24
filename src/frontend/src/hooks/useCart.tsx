import type React from "react";
import { createContext, useContext, useReducer } from "react";

export type ProductSize = "M" | "L" | "XL" | "XXL" | string;

export interface CartProduct {
  id: string;
  name: string;
  price: bigint;
  category?: string;
  description?: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  image: string;
  size: ProductSize;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; product: CartProduct; image: string; size: ProductSize }
  | { type: "REMOVE_ITEM"; productId: string; size: ProductSize }
  | { type: "INCREMENT"; productId: string; size: ProductSize }
  | { type: "DECREMENT"; productId: string; size: ProductSize }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const exists = state.items.find(
        (item) =>
          item.product.id === action.product.id && item.size === action.size,
      );
      if (exists) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((item) =>
            item.product.id === action.product.id && item.size === action.size
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
          {
            product: action.product,
            quantity: 1,
            image: action.image,
            size: action.size,
          },
        ],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.product.id === action.productId && item.size === action.size
            ),
        ),
      };
    case "INCREMENT":
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.productId && item.size === action.size
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      };
    case "DECREMENT":
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.product.id === action.productId && item.size === action.size
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
  addItem: (product: CartProduct, image: string, size: ProductSize) => void;
  removeItem: (productId: string, size: ProductSize) => void;
  increment: (productId: string, size: ProductSize) => void;
  decrement: (productId: string, size: ProductSize) => void;
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
        addItem: (product, image, size) =>
          dispatch({ type: "ADD_ITEM", product, image, size }),
        removeItem: (productId, size) =>
          dispatch({ type: "REMOVE_ITEM", productId, size }),
        increment: (productId, size) =>
          dispatch({ type: "INCREMENT", productId, size }),
        decrement: (productId, size) =>
          dispatch({ type: "DECREMENT", productId, size }),
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
