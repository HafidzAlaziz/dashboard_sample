"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useOrderStore } from "@/store/useOrderStore";
import { useToastStore } from "@/store/useToastStore";
import { useOrderSync } from "@/hooks/useOrderSync";
import { Truck, Package, Clock, ChevronRight, ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function OrdersPage() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { orders, removeOrder, updateOrderStatus } = useOrderStore();
    const { addToast } = useToastStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Re-integrate real-time sync
    useOrderSync();

    // Set hydration state on mount
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Verification on mount: Check if local orders still exist in DB
    useEffect(() => {
        const syncWithDB = async () => {
            // Wait for hydration to ensure orders are loaded from localStorage
            if (!isHydrated) return;
            if (orders.length === 0) return;
            if (!supabase) {
                console.warn("Supabase client is not initialized. Sync skipped.");
                return;
            }

            try {
                const orderIds = orders.map(o => o.id);
                const { data, error } = await supabase
                    .from('orders')
                    .select('id')
                    .in('id', orderIds);

                if (error) throw error;

                const existingIds = new Set((data as any[])?.map((o: any) => o.id) || []);
                const missingIds = orderIds.filter((id: string) => !existingIds.has(id));

                if (missingIds.length > 0) {
                    missingIds.forEach(id => removeOrder(id));
                    console.log(`Synced: Removed ${missingIds.length} missing orders from local state`);
                }
            } catch (err) {
                console.error("Sync verification failed:", err);
            }
        };

        syncWithDB();
    }, [isHydrated, orders.length]); // Run when orders are loaded or changed

    // Cancellation State
    const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleOpenCancelModal = (orderId: string) => {
        setCancelOrderId(orderId);
        setCancelReason("");
        setIsCancelModalOpen(true);
    };

    const handleSubmitCancellation = async () => {
        if (!cancelOrderId || !cancelReason) return;

        setIsCancelling(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${API_URL}/orders/cancel/${cancelOrderId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: cancelReason })
            });

            if (res.ok) {
                updateOrderStatus(cancelOrderId, "Menunggu Pembatalan");
                setIsCancelModalOpen(false);
                addToast("Permintaan pembatalan berhasil dikirim.", "success");
            } else {
                const err = await res.json();
                addToast(`Gagal membatalkan: ${err.error || 'Terjadi kesalahan'}`, "error");
            }
        } catch (error) {
            console.error("Cancellation error:", error);
            addToast("Terjadi kesalahan koneksi.", "error");
        } finally {
            setIsCancelling(false);
        }
    };

    // Split orders into active and history
    const activeOrders = orders.filter(o => {
        const s = o.status.toLowerCase();
        return !s.includes('selesai') && s !== 'dibatalkan' && s !== 'batal';
    });

    const orderHistory = orders.filter(o => {
        const s = o.status.toLowerCase();
        return s.includes('selesai') || s === 'dibatalkan' || s === 'batal';
    });

    const getStatusStyles = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('menunggu pembatalan')) return "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20";
        if (s.includes('menunggu')) return "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
        if (s.includes('batal')) return "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400";
        if (s.includes('selesai')) return "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
        return "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
    };

    const getProgressValue = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('menunggu pembatalan')) return "w-full bg-rose-500";
        if (s.includes('menunggu')) return "w-1/4 bg-amber-500";
        if (s.includes('batal')) return "w-full bg-rose-500";
        if (s.includes('proses')) return "w-1/2 bg-blue-500";
        if (s.includes('kirim')) return "w-3/4 bg-blue-500";
        if (s.includes('selesai')) return "w-full bg-emerald-500";
        return "w-0";
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0c] pb-20">
            <Navbar onCartClick={() => setIsCartOpen(true)} />

            <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Pesanan Saya</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Lacak pengiriman dan lihat riwayat belanja Anda</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Kembali Belanja</span>
                        </Link>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#16161a] rounded-[32px] p-12 text-center border border-gray-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-black/50"
                    >
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Belum Ada Pesanan</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">Anda belum memiliki riwayat pesanan. Ayo mulai belanja produk UMKM terbaik!</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                        >
                            Jelajahi Produk
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-10">
                        {/* Active Orders Section */}
                        {activeOrders.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                        <Truck className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Sedang Diproses</h2>
                                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{activeOrders.length}</span>
                                </div>
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {activeOrders.map((order) => (
                                            <OrderCard
                                                key={order.id}
                                                order={order}
                                                getStatusStyles={getStatusStyles}
                                                getProgressValue={getProgressValue}
                                                updateOrderStatus={updateOrderStatus}
                                                onCancel={() => handleOpenCancelModal(order.id)}
                                                onRemove={() => removeOrder(order.id)}
                                                addToast={addToast}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </section>
                        )}

                        {/* History Section */}
                        {orderHistory.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-500/10 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Riwayat Pesanan</h2>
                                </div>
                                <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
                                    {orderHistory.map((order) => (
                                        <OrderCard key={order.id} order={order} getStatusStyles={getStatusStyles} getProgressValue={getProgressValue} updateOrderStatus={updateOrderStatus} onRemove={() => removeOrder(order.id)} addToast={addToast} isHistory />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>

            {/* Cancellation Modal */}
            <AnimatePresence>
                {isCancelModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCancelModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-[#16161a] rounded-[32px] w-full max-w-md p-8 shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-rose-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Batalkan Pesanan?</h3>
                            </div>

                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                                Pesanan ini akan diajukan untuk pembatalan. Mohon sertakan alasan yang jelas agar admin dapat memprosesnya.
                            </p>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">Alasan Pembatalan</label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Contoh: Saya salah memasukkan alamat pengiriman..."
                                    className="w-full px-5 py-4 text-sm rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none h-32"
                                />
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setIsCancelModalOpen(false)}
                                    className="flex-1 px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                                >
                                    Kembali
                                </button>
                                <button
                                    onClick={handleSubmitCancellation}
                                    disabled={!cancelReason || isCancelling}
                                    className="flex-1 px-6 py-3 text-sm font-black text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all shadow-lg shadow-rose-500/25 active:scale-95"
                                >
                                    {isCancelling ? "Mengirim..." : "Ya, Batalkan"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </main >
    );
}

function OrderCard({ order, getStatusStyles, getProgressValue, onRemove, onCancel, isHistory, addToast, updateOrderStatus }: any) {
    const totalItems = order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
    const totalPrice = order.items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0;
    // Allow cancellation for any active order that is not already being cancelled or finished
    const isCancellable = !isHistory && !order.status.toLowerCase().includes('pembatalan');
    const isRequestedCancel = order.status.toLowerCase().includes('menunggu pembatalan');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-[#16161a] rounded-[32px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
        >
            {/* Card Header */}
            <div className="p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 dark:border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                        <Package className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">ID PESANAN</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", getStatusStyles(order.status))}>
                        {order.status}
                    </span>
                    {(isHistory || !!order.rejectionReason) && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90"
                            title="Hapus dari daftar"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Rejection Reason - New Section */}
            {order.rejectionReason && (
                <div className="px-8 py-4 bg-rose-500/5 border-b border-rose-500/10 flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-4">
                        <div className="mt-1">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Pembatalan Ditolak Admin</p>
                            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium italic">"{order.rejectionReason}"</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, order.status, null);
                        }}
                        className="text-[10px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest py-1.5 px-3 border border-gray-100 dark:border-white/5 hover:border-rose-200 dark:hover:border-rose-500/30 rounded-xl transition-all whitespace-nowrap"
                    >
                        Sembunyikan
                    </button>
                </div>
            )}

            {/* Items Summary */}
            <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex -space-x-3 overflow-hidden">
                        {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="relative inline-block w-14 h-14 rounded-2xl border-4 border-white dark:border-[#16161a] overflow-hidden bg-gray-50 shadow-sm">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{totalItems} Produk</p>
                        <div className="mt-1">
                            <p className="text-xl font-black text-gray-900 dark:text-white">
                                Rp {(order.amount || totalPrice).toLocaleString('id-ID')}
                            </p>
                            {order.amount && order.amount > totalPrice && (
                                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">
                                    Total Bayar <span className="text-gray-400 dark:text-gray-600 font-medium">(Termasuk Ongkir & Biaya)</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {!isHistory && (
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aktivitas Terakhir</span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{order.eta}</span>
                        </div>
                        <div className="relative h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: getProgressValue(order.status).split(' ')[0] }}
                                className={cn("absolute top-0 left-0 h-full rounded-full transition-all duration-1000", getProgressValue(order.status).split(' ')[1])}
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Pesanan Dibuat</span>
                            <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">Dalam Perjalanan</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="px-8 py-5 bg-gray-50/50 dark:bg-white/[0.02] flex flex-wrap justify-between items-center gap-4">
                <span className="text-[10px] text-gray-400 font-bold italic">
                    Dibuat pada {new Date(order.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>

                <div className="flex items-center gap-4">
                    {isCancellable && !isRequestedCancel && !order.rejectionReason && onCancel && (
                        <button
                            onClick={onCancel}
                            className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest px-4 py-2 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                            Batal Pesanan
                        </button>
                    )}
                    {(isHistory || !!order.rejectionReason) && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(); addToast("Pesanan berhasil dihapus dari daftar.", "success"); }}
                            className="text-[10px] font-black text-gray-500 hover:text-rose-500 uppercase tracking-widest px-4 py-2 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                            Hapus Pesanan
                        </button>
                    )}
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                        Detail Pesanan <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
