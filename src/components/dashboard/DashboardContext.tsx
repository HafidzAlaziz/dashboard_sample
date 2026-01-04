"use client";

import React, { useContext, useState, useEffect, useMemo } from "react";
import { Order, OrderStatus, calculateStats } from "@/lib/orderData";
import { Product } from "@/lib/productData";
import { Customer, CustomerSegment } from "@/lib/customerData";
import { UserSettings, parseSettings, DEFAULT_SETTINGS } from "@/lib/settingsData";

import { supabase } from "@/lib/supabase";

import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type DateRange = "today" | "7days" | "30days" | "90days";

interface CustomerStats {
    totalCustomers: number;
    vipCustomers: number;
    newCustomers: number;
}

interface DBCustomer {
    id: string;
    name: string;
    email: string;
    phone: string;
    segment: CustomerSegment;
    avatar: string | null;
    total_orders: number;
    total_spend: number;
    last_order_date: string | null;
    join_date: string;
}

interface DBOrder {
    id: string;
    customer: string;
    products: string;
    amount: number;
    status: OrderStatus;
    payment_status?: string;
    payment_method: "QRIS" | "Transfer" | "Tunai";
    date: string;
    date_obj: string;
    cancellation_reason?: string;
    rejection_reason?: string;
}

interface DashboardContextType {
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
    isLoading: boolean;
    refreshData: () => void;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    stats: ReturnType<typeof calculateStats>;
    customerStats: CustomerStats;
    deleteOrder: (id: string) => void;
    updateOrder: (order: Order) => void;
    // Products
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    // Customers
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    addCustomer: (customer: Customer) => void;
    updateCustomer: (customer: Customer) => void;
    deleteCustomer: (id: string) => void;
    // Settings
    settings: UserSettings;
    updateSettings: (settings: Partial<UserSettings>) => Promise<{ data?: UserSettings; error?: unknown }>;
}

const normalizeStatus = (status: string): OrderStatus => {
    const s = status.toLowerCase();
    if (s === 'pending') return 'Menunggu';
    if (s === 'processing') return 'Diproses';
    if (s === 'shipped' || s === 'on delivery' || s === 'dikirim') return 'Dikirim';
    if (s === 'delivered' || s === 'completed' || s === 'lunas' || s === 'selesai') return 'Selesai';
    if (s === 'cancelled' || s === 'dibatalkan') return 'Dibatalkan';
    if (s === 'cancellation requested') return 'Menunggu Pembatalan';
    return 'Menunggu'; // Default fallback
};

const DashboardContext = React.createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [dateRange, setDateRange] = useState<DateRange>("7days");
    const [isLoading, setIsLoading] = useState(true);

    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

    // Initial data fetch from Supabase
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!supabase) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                // Fetch Orders
                const { data: oData, error: oError } = await supabase.from('orders').select('*').order('date_obj', { ascending: false });
                if (oData) {
                    setOrders((oData as DBOrder[]).map(o => ({
                        id: o.id,
                        customer: o.customer,
                        products: o.products,
                        amount: Number(o.amount),
                        status: normalizeStatus(o.status),
                        paymentStatus: (o.payment_status as "Paid" | "Unpaid") || "Unpaid",
                        paymentMethod: o.payment_method,
                        date: o.date,
                        dateObj: new Date(o.date_obj),
                        cancellationReason: o.cancellation_reason,
                        rejectionReason: o.rejection_reason
                    })));
                } else if (oError) {
                    console.error("Supabase Orders Error:", oError);
                }

                // Fetch Products
                const { data: pData } = await supabase.from('products').select('*');
                if (pData) setProducts(pData);

                // Fetch Customers
                const { data: cData } = await supabase.from('customers').select('*');
                if (cData) {
                    setCustomers((cData as DBCustomer[]).map(c => ({
                        id: c.id,
                        name: c.name,
                        email: c.email,
                        phone: c.phone,
                        segment: c.segment,
                        avatar: c.avatar || undefined,
                        totalOrders: c.total_orders,
                        totalSpend: Number(c.total_spend),
                        lastOrderDate: c.last_order_date || "",
                        joinDate: c.join_date
                    })));
                }

                // Fetch Settings (assume just one row for simplicity in this demo, or by user ID)
                const { data: sData } = await supabase.from('settings').select('*').single();
                if (sData) {
                    setSettings(parseSettings(sData));
                }

            } catch (err) {
                console.error("Failed to fetch data from Supabase", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();

        if (!supabase) return;

        // Real-time Subscriptions
        const ordersChannel = supabase.channel('realtime_orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload: RealtimePostgresChangesPayload<DBOrder>) => {
                const mapOrder = (o: DBOrder): Order => ({
                    id: o.id,
                    customer: o.customer,
                    products: o.products,
                    amount: Number(o.amount),
                    status: normalizeStatus(o.status),
                    paymentStatus: (o.payment_status as "Paid" | "Unpaid") || "Unpaid",
                    paymentMethod: o.payment_method,
                    date: o.date,
                    dateObj: new Date(o.date_obj),
                    cancellationReason: o.cancellation_reason,
                    rejectionReason: o.rejection_reason
                });

                if (payload.eventType === 'INSERT' && payload.new) {
                    setOrders(prev => [mapOrder(payload.new), ...prev]);
                } else if (payload.eventType === 'UPDATE' && payload.new) {
                    setOrders(prev => prev.map(o => o.id === payload.new.id ? mapOrder(payload.new) : o));
                } else if (payload.eventType === 'DELETE' && payload.old) {
                    setOrders(prev => prev.filter(o => o.id !== payload.old.id));
                }
            })
            .subscribe();

        const productsChannel = supabase.channel('realtime_products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload: RealtimePostgresChangesPayload<Product>) => {
                if (payload.eventType === 'INSERT' && payload.new) {
                    setProducts(prev => [payload.new as Product, ...prev]);
                } else if (payload.eventType === 'UPDATE' && payload.new) {
                    setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
                } else if (payload.eventType === 'DELETE' && payload.old) {
                    setProducts(prev => prev.filter(p => p.id !== payload.old.id));
                }
            })
            .subscribe();

        const customersChannel = supabase.channel('realtime_customers')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, (payload: RealtimePostgresChangesPayload<DBCustomer>) => {
                const mapCustomer = (c: DBCustomer): Customer => ({
                    id: c.id,
                    name: c.name,
                    email: c.email,
                    phone: c.phone,
                    segment: c.segment,
                    avatar: c.avatar || undefined,
                    totalOrders: c.total_orders,
                    totalSpend: Number(c.total_spend),
                    lastOrderDate: c.last_order_date || "",
                    joinDate: c.join_date
                });

                if (payload.eventType === 'INSERT' && payload.new) {
                    setCustomers(prev => [mapCustomer(payload.new), ...prev]);
                } else if (payload.eventType === 'UPDATE' && payload.new) {
                    setCustomers(prev => prev.map(c => c.id === payload.new.id ? mapCustomer(payload.new) : c));
                } else if (payload.eventType === 'DELETE' && payload.old) {
                    setCustomers(prev => prev.filter(c => c.id !== payload.old.id));
                }
            })
            .subscribe();

        const settingsChannel = supabase.channel('realtime_settings')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload: RealtimePostgresChangesPayload<UserSettings>) => {
                if (payload.new) {
                    setSettings(parseSettings(payload.new));
                }
            })
            .subscribe();

        return () => {
            if (supabase) {
                supabase.removeChannel(ordersChannel);
                supabase.removeChannel(productsChannel);
                supabase.removeChannel(customersChannel);
                supabase.removeChannel(settingsChannel);
            }
        };
    }, []);

    const stats = useMemo(() => calculateStats(orders), [orders]);

    const customerStats = useMemo(() => ({
        totalCustomers: customers.length,
        vipCustomers: customers.filter(c => c.segment === "VIP").length,
        newCustomers: customers.filter(c => c.segment === "Baru").length,
    }), [customers]);

    const refreshData = () => {
        setIsLoading(true);
        // Manual refresh if needed, but real-time handles most cases
        setTimeout(() => setIsLoading(false), 500);
    };

    // Order actions
    const deleteOrder = async (id: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) console.error("Error deleting order:", error);
    };

    const denormalizeStatus = (status: OrderStatus): string => {
        switch (status) {
            case 'Menunggu': return 'Pending';
            case 'Diproses': return 'Processing';
            case 'Dikirim': return 'Shipped';
            case 'Selesai': return 'Delivered';
            case 'Dibatalkan': return 'Cancelled';
            case 'Menunggu Pembatalan': return 'Cancellation Requested';
            default: return 'Pending';
        }
    };

    const updateOrder = async (order: Order) => {
        if (!supabase) return;
        const updateStatus = denormalizeStatus(order.status);
        let updatePaymentStatus = order.paymentStatus;

        // Auto move to 'Paid' if status is 'Delivered' (Selesai in frontend)
        if (updateStatus === 'Delivered') {
            updatePaymentStatus = 'Paid';
        }

        const dbOrder = {
            id: order.id,
            customer: order.customer,
            products: order.products,
            amount: order.amount,
            status: updateStatus,
            payment_status: updatePaymentStatus,
            payment_method: order.paymentMethod,
            date: order.date,
            date_obj: order.dateObj ? order.dateObj.toISOString() : new Date().toISOString(),
            cancellation_reason: order.cancellationReason,
            rejection_reason: order.rejectionReason
        };
        const { error } = await supabase.from('orders').update(dbOrder).eq('id', order.id);
        if (error) console.error("Error updating order:", error);
    };

    // Product actions
    const addProduct = async (product: Product) => {
        if (!supabase) return;
        const { error } = await supabase.from('products').insert([product]);
        if (error) console.error("Error adding product:", error);
    };

    const updateProduct = async (updatedProduct: Product) => {
        if (!supabase) return;
        const { error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
        if (error) console.error("Error updating product:", error);
    };

    const deleteProduct = async (id: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) console.error("Error deleting product:", error);
    };

    // Customer actions
    const addCustomer = async (customer: Customer) => {
        if (!supabase) return;
        const dbCustomer = {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            segment: customer.segment,
            avatar: customer.avatar,
            total_orders: customer.totalOrders,
            total_spend: customer.totalSpend,
            last_order_date: customer.lastOrderDate,
            join_date: customer.joinDate
        };
        const { error } = await supabase.from('customers').insert([dbCustomer]);
        if (error) console.error("Error adding customer:", error);
    };

    const updateCustomer = async (updatedCustomer: Customer) => {
        if (!supabase) return;
        const dbCustomer = {
            id: updatedCustomer.id,
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            phone: updatedCustomer.phone,
            segment: updatedCustomer.segment,
            avatar: updatedCustomer.avatar,
            total_orders: updatedCustomer.totalOrders,
            total_spend: updatedCustomer.totalSpend,
            last_order_date: updatedCustomer.lastOrderDate,
            join_date: updatedCustomer.joinDate
        };
        const { error } = await supabase.from('customers').update(dbCustomer).eq('id', updatedCustomer.id);
        if (error) console.error("Error updating customer:", error);
    };

    const deleteCustomer = async (id: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) console.error("Error deleting customer:", error);
    };

    // Settings actions
    const updateSettings = async (newSettings: Partial<UserSettings>) => {
        if (!supabase) return { error: new Error("Supabase client not initialized") };

        // SYNC LOGIC: Check if profile name/email/avatar changed, then sync to 'users' table (Admin)
        const profileChanged = newSettings.profile && (
            newSettings.profile.name !== settings.profile.name ||
            newSettings.profile.email !== settings.profile.email ||
            newSettings.profile.avatar !== settings.profile.avatar
        );

        if (profileChanged) {
            console.log("Syncing profile changes to User Management...");
            const oldEmail = settings.profile.email;
            const newEmail = newSettings.profile?.email ?? settings.profile.email;
            const newName = newSettings.profile?.name ?? settings.profile.name;
            const newAvatar = newSettings.profile?.avatar ?? settings.profile.avatar;

            // Uses Backend API to handle Sync (More robust than frontend RLS)
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

            try {
                const res = await fetch(`${API_URL}/users/sync-admin`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        oldEmail,
                        name: newName,
                        email: newEmail,
                        avatar: newAvatar
                    })
                });

                if (res.ok) {
                    console.log("Successfully synced profile to Users table.");
                } else {
                    console.error("Failed to sync profile:", await res.text());
                }
            } catch (err) {
                console.error("Sync API Error:", err);
            }
        }

        // Ensure we preserve the nested structure
        const updated = {
            id: '00000000-0000-0000-0000-000000000000', // Constant ID for single user settings
            profile: newSettings.profile ? { ...settings.profile, ...newSettings.profile } : settings.profile,
            appearance: newSettings.appearance ? { ...settings.appearance, ...newSettings.appearance } : settings.appearance,
            business: newSettings.business ? { ...settings.business, ...newSettings.business } : settings.business,
            notifications: newSettings.notifications ? { ...settings.notifications, ...newSettings.notifications } : settings.notifications,
            updated_at: new Date().toISOString()
        };

        // Use upsert to handle both first-time creation and subsequent updates
        const { data, error } = await supabase.from('settings').upsert([updated]).select();
        if (error) {
            console.error("Error updating settings:", error);
            return { error };
        } else {
            // Local update to reflect changes immediately
            // But skip setting local state if it's already identical to avoid unnecessary renders
            if (JSON.stringify(updated) !== JSON.stringify(settings)) {
                setSettings(prev => ({ ...prev, ...updated }));
            }
            return { data: data?.[0] };
        }
    };

    return (
        <DashboardContext.Provider value={{
            dateRange,
            setDateRange,
            isLoading,
            refreshData,
            orders,
            setOrders,
            stats,
            customerStats,
            deleteOrder,
            updateOrder,
            products,
            setProducts,
            addProduct,
            updateProduct,
            deleteProduct,
            customers,
            setCustomers,
            addCustomer,
            updateCustomer,
            deleteCustomer,
            settings,
            updateSettings
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}
