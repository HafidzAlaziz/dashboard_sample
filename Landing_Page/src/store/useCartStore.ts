import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    weight: number; // in grams
    description?: string;
}

export interface CartItem extends Product {
    quantity: number;
    selected: boolean;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    toggleSelectItem: (productId: string) => void;
    toggleSelectAll: (selected: boolean) => void;
    clearCart: () => void;
    totalPrice: (onlySelected?: boolean) => number;
    totalWeight: (onlySelected?: boolean) => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const items = get().items;
                const existingItem = items.find((item) => item.id === product.id);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...items, { ...product, quantity: 1, selected: true }] });
                }
            },
            removeItem: (productId) => {
                set({
                    items: get().items.filter((item) => item.id !== productId),
                });
            },
            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item.id === productId ? { ...item, quantity } : item
                    ),
                });
            },
            toggleSelectItem: (productId) => {
                set({
                    items: get().items.map((item) =>
                        item.id === productId ? { ...item, selected: !item.selected } : item
                    ),
                });
            },
            toggleSelectAll: (selected) => {
                set({
                    items: get().items.map((item) => ({ ...item, selected })),
                });
            },
            clearCart: () => set({ items: [] }),
            totalPrice: (onlySelected = false) => {
                const items = onlySelected
                    ? get().items.filter(item => item.selected)
                    : get().items;
                return items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },
            totalWeight: (onlySelected = false) => {
                const items = onlySelected
                    ? get().items.filter(item => item.selected)
                    : get().items;
                return items.reduce(
                    (total, item) => total + item.weight * item.quantity,
                    0
                );
            }
        }),
        {
            name: "umkm-cart-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
