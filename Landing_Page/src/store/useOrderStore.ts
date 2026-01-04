import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ActiveOrder {
    id: string;
    status: string;
    eta: string;
    timestamp: number;
    amount?: number; // Total amount including shipping and fees
    rejectionReason?: string;
    items: {
        id: string;
        name: string;
        image: string;
        quantity: number;
        price: number;
    }[];
}

interface OrderState {
    orders: ActiveOrder[];
    addOrder: (order: ActiveOrder) => void;
    updateOrderStatus: (id: string, status: string, rejectionReason?: string, amount?: number) => void;
    removeOrder: (id: string) => void;
    clearOrders: () => void;
}

export const useOrderStore = create<OrderState>()(
    persist(
        (set) => ({
            orders: [],
            addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
            updateOrderStatus: (id, status, rejectionReason, amount) => set((state) => ({
                orders: state.orders.map(o => o.id === id ? {
                    ...o,
                    status,
                    rejectionReason: rejectionReason === undefined ? o.rejectionReason : (rejectionReason === null ? undefined : rejectionReason),
                    amount: amount || o.amount
                } : o)
            })),
            removeOrder: (id) => set((state) => ({
                orders: state.orders.filter(o => o.id !== id)
            })),
            clearOrders: () => set({ orders: [] }),
        }),
        {
            name: "umkm-order-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
