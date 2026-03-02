import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  imageUrl: string;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; productId: string; size: string; color: string }
  | {
      type: "UPDATE_QUANTITY";
      productId: string;
      size: string;
      color: string;
      quantity: number;
    }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; items: CartItem[] };

const CART_STORAGE_KEY = "pahile_fashion_cart";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) =>
          i.productId === action.item.productId &&
          i.size === action.item.size &&
          i.color === action.item.color,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === action.item.productId &&
            i.size === action.item.size &&
            i.color === action.item.color
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i,
          ),
        };
      }
      return { items: [...state.items, action.item] };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter(
          (i) =>
            !(
              i.productId === action.productId &&
              i.size === action.size &&
              i.color === action.color
            ),
        ),
      };
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          items: state.items.filter(
            (i) =>
              !(
                i.productId === action.productId &&
                i.size === action.size &&
                i.color === action.color
              ),
          ),
        };
      }
      return {
        items: state.items.map((i) =>
          i.productId === action.productId &&
          i.size === action.size &&
          i.color === action.color
            ? { ...i, quantity: action.quantity }
            : i,
        ),
      };
    }
    case "CLEAR_CART":
      return { items: [] };
    case "LOAD_CART":
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as CartItem[];
        dispatch({ type: "LOAD_CART", items });
      }
    } catch {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: CartItem) => dispatch({ type: "ADD_ITEM", item });

  const removeItem = (productId: string, size: string, color: string) =>
    dispatch({ type: "REMOVE_ITEM", productId, size, color });

  const updateQuantity = (
    productId: string,
    size: string,
    color: string,
    quantity: number,
  ) => dispatch({ type: "UPDATE_QUANTITY", productId, size, color, quantity });

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
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
