"use client";

import { X, Minus, Plus, Trash2, ShoppingBag, CreditCard } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { formatRupiah, cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, removeItem, updateQuantity, totalPrice, toggleSelectItem, toggleSelectAll } = useCartStore();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const selectedItemsCount = items.filter(item => item.selected).length;
    const isAllSelected = items.length > 0 && selectedItemsCount === items.length;
    const selectedTotalPrice = totalPrice(true);

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white dark:bg-gray-950 shadow-2xl transition-transform duration-300 flex flex-col border-l border-gray-100 dark:border-gray-800",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">Keranjang Belanja</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Select All Section */}
                {items.length > 0 && (
                    <div className="px-5 py-3 border-b border-gray-50 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between shrink-0">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={(e) => toggleSelectAll(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600"></div>
                                <svg
                                    className="absolute inset-0 w-5 h-5 text-white scale-0 transition-transform peer-checked:scale-100"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Pilih Semua
                            </span>
                        </label>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                            {selectedItemsCount} Terpilih
                        </span>
                    </div>
                )}

                {/* Items List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-4">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                    <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">Keranjang masih kosong</p>
                                    <button
                                        onClick={onClose}
                                        className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-bold uppercase tracking-wider"
                                    >
                                        Mulai Belanja
                                    </button>
                                </div>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "group flex gap-3 p-3 bg-white dark:bg-gray-900 border rounded-2xl transition-all duration-300",
                                        item.selected
                                            ? "border-blue-200 dark:border-blue-900 shadow-sm"
                                            : "border-gray-100 dark:border-gray-800"
                                    )}
                                >
                                    {/* Selection Checkbox */}
                                    <div className="flex items-center self-stretch pr-1">
                                        <label className="relative cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!item.selected}
                                                onChange={() => toggleSelectItem(item.id)}
                                                className="peer sr-only"
                                            />
                                            <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600 group-hover:border-blue-400"></div>
                                            <svg
                                                className="absolute inset-0 w-5 h-5 text-white scale-0 transition-transform peer-checked:scale-100"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </label>
                                    </div>

                                    {/* Product Image */}
                                    <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-extrabold mt-0.5">
                                                {formatRupiah(item.price)}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-1 px-2 border border-black/5 dark:border-white/5">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-500 dark:text-gray-400"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-xs font-black w-6 text-center text-gray-900 dark:text-gray-100">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-500 dark:text-gray-400"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer / Summary - Always Sticky */}
                {items.length > 0 && (
                    <div className="p-6 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 space-y-4 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Belanja</span>
                                <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                                    {formatRupiah(selectedTotalPrice)}
                                </span>
                            </div>
                            {selectedItemsCount > 0 && (
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full uppercase tracking-wider">
                                        {selectedItemsCount} Item Terpilih
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                onClose();
                                router.push('/checkout');
                            }}
                            disabled={selectedItemsCount === 0}
                            className={cn(
                                "w-full py-5 text-white font-black rounded-[24px] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 text-lg group",
                                selectedItemsCount === 0
                                    ? "bg-gray-300 dark:bg-gray-800 cursor-not-allowed text-gray-500 dark:text-gray-600 shadow-none"
                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                            )}
                        >
                            <CreditCard className={cn("w-6 h-6 transition-transform", selectedItemsCount > 0 && "group-hover:rotate-12")} />
                            <span>CHECKOUT SEKARANG</span>
                        </button>

                        {selectedItemsCount === 0 && (
                            <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                                Pilih produk untuk melanjutkan
                            </p>
                        )}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 20px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                }
            `}</style>
        </>
    );
}

// Fallback icon
function ShoppingBagIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
    )
}
