"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useOrderStore } from '@/store/useOrderStore';
import { useToastStore } from '@/store/useToastStore';

/**
 * Hook untuk sinkronisasi real-time order status dari database
 * Ketika admin update status di dashboard, perubahan otomatis terlihat di Landing Page
 */
export function useOrderSync() {
    const { orders, updateOrderStatus, removeOrder } = useOrderStore();
    const { addToast } = useToastStore();

    useEffect(() => {
        if (!supabase) {
            console.warn('Supabase not configured. Real-time sync disabled.');
            return;
        }

        // Get list of order IDs yang ada di localStorage
        const trackedOrderIds = orders.map(o => o.id);

        if (trackedOrderIds.length === 0) {
            // Tidak ada order untuk di-track
            return;
        }

        console.log('🔄 Starting real-time sync for orders:', trackedOrderIds);

        // Subscribe ke perubahan tabel orders
        const channel = supabase
            .channel('landing-page-orders')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=in.(${trackedOrderIds.join(',')})`
                },
                (payload: any) => {
                    console.log('📦 Order updated:', payload);
                    const updatedOrder = payload.new as any;

                    // Map status dari database (English) ke frontend (Indonesian)
                    const statusMap: Record<string, string> = {
                        'Pending': 'Menunggu',
                        'Processing': 'Diproses',
                        'Shipped': 'Dikirim',
                        'Delivered': 'Selesai',
                        'Cancelled': 'Dibatalkan',
                        'Cancellation Requested': 'Menunggu Pembatalan'
                    };

                    const newStatus = statusMap[updatedOrder.status] || updatedOrder.status;

                    // Find existing order for toast check
                    // Note: This might be slightly stale if another update happened fast, 
                    // but for status changes it's usually fine.
                    const existingOrder = orders.find(o => o.id === updatedOrder.id);

                    if (existingOrder && existingOrder.status !== newStatus) {
                        let toastMsg = `Status pesanan #${updatedOrder.id.slice(0, 8).toUpperCase()} berubah menjadi ${newStatus}.`;
                        let type: "success" | "info" | "error" = "info";

                        if (newStatus === 'Selesai') {
                            toastMsg = `Pesanan #${updatedOrder.id.slice(0, 8).toUpperCase()} telah sampai! Terima kasih.`;
                            type = "success";
                        } else if (newStatus === 'Dibatalkan') {
                            toastMsg = `Pesanan #${updatedOrder.id.slice(0, 8).toUpperCase()} telah dibatalkan.`;
                            type = "error";
                        } else if (newStatus === 'Diproses' && existingOrder.status === 'Menunggu Pembatalan') {
                            toastMsg = `Permintaan pembatalan pesanan #${updatedOrder.id.slice(0, 8).toUpperCase()} ditolak admin.`;
                            type = "error";
                        } else if (newStatus === 'Dikirim') {
                            toastMsg = `Pesanan #${updatedOrder.id.slice(0, 8).toUpperCase()} sedang dalam pengiriman.`;
                        }

                        addToast(toastMsg, type);
                    }

                    updateOrderStatus(updatedOrder.id, newStatus, updatedOrder.rejection_reason, updatedOrder.amount);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'orders',
                    // Filter DELETE might not work with ID in some Supabase versions 
                    // if the payload.old doesn't contain the full record. 
                    // But we'll try it if supported, or handle in callback.
                },
                (payload: any) => {
                    console.log('🗑️ Order deleted from DB:', payload);
                    const deletedId = payload.old?.id;
                    if (deletedId) {
                        removeOrder(deletedId);
                    }
                }
            )
            .subscribe((status: string) => {
                console.log('Subscription status:', status);
            });

        // Cleanup saat component unmount
        return () => {
            console.log('🛑 Stopping real-time sync');
            supabase.removeChannel(channel);
        };
    }, [JSON.stringify(orders.map(o => o.id))]); // Re-subscribe jika set order IDs berubah
}
