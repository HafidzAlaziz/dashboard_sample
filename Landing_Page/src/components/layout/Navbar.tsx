"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Truck, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { usePathname } from "next/navigation";
import { useOrderSync } from "@/hooks/useOrderSync";

interface NavbarProps {
    onCartClick: () => void;
}



export function Navbar({ onCartClick }: NavbarProps) {
    const items = useCartStore((state) => state.items);
    const [itemCount, setItemCount] = useState(0);
    const { orders, clearOrders, updateOrderStatus, removeOrder } = useOrderStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    // Aktifkan real-time sync untuk pesanan
    useOrderSync();

    useEffect(() => {
        // Update itemCount from cart store whenever items change
        setItemCount(items.reduce((acc, item) => acc + item.quantity, 0));

        // This part of the instruction seems to suggest a different way of getting itemCount
        // If the intention is to load from localStorage directly, it might conflict with useCartStore
        // For now, keeping the useCartStore derivation for itemCount.
        // If the user intended to replace the useCartStore itemCount with localStorage,
        // the logic below would be used instead of the line above.
        // const updateCount = () => {
        //     const storedCart = localStorage.getItem('cart-storage');
        //     if (storedCart) {
        //         try {
        //             const parsedCart = JSON.parse(storedCart);
        //             const count = parsedCart.state?.items?.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0) || 0;
        //             setItemCount(count);
        //         } catch (e) {
        //             console.error("Failed to parse cart-storage from localStorage", e);
        //             setItemCount(0);
        //         }
        //     } else {
        //         setItemCount(0);
        //     }
        // };
        // updateCount();
        // window.addEventListener('storage', updateCount); // Listen for changes in other tabs/windows
        // return () => window.removeEventListener('storage', updateCount);
    }, [items]); // Depend on `items` from useCartStore



    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        setIsMenuOpen(false); // Always close menu

        // Handle root link scroll to top
        if (href === "/") {
            if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
            return;
        }

        // Check if it's a hash link
        if (href.includes("#")) {
            const [path, hash] = href.split("#");

            // If we are on the same page (e.g. href="/#about" and pathname="/")
            // OR if href="#about"
            if (pathname === path || (path === "" && pathname === "/") || (path === "/" && pathname === "/")) {
                e.preventDefault();
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2" onClick={(e) => handleScroll(e, "/")}>
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm">
                            <img
                                src="/images/ui/logo-pattern.jpg"
                                alt="UMKM Logo Pattern"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20" /> {/* Overlay for contrast */}
                            <span className="relative z-10 text-white font-bold text-xl drop-shadow-md">U</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            UMKM Store
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/"
                            onClick={(e) => handleScroll(e, "/")}
                            className={cn(
                                "font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                                pathname === "/" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"
                            )}
                        >
                            Beranda
                        </Link>
                        <Link
                            href="/products"
                            className={cn(
                                "font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                                pathname === "/products" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"
                            )}
                        >
                            Produk
                        </Link>
                        <Link
                            href="/#how-to-buy"
                            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                            onClick={(e) => handleScroll(e, "/#how-to-buy")}
                        >
                            Cara Belanja
                        </Link>
                        <Link
                            href="/#about"
                            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                            onClick={(e) => handleScroll(e, "/#about")}
                        >
                            Tentang Kami
                        </Link>
                        <Link
                            href="/register"
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            Daftar
                        </Link>
                        <Link
                            href="/login"
                            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-sm hover:bg-slate-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                        >
                            Masuk
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Order Tracking Widget */}
                        {orders.length > 0 && (
                            <Link
                                href="/orders"
                                className="flex items-center gap-3 pl-3 pr-4 py-2 bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full hover:bg-emerald-100/50 dark:hover:bg-emerald-500/20 transition-all group"
                            >
                                <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                                    <Truck className="w-4 h-4 text-white animate-bounce-horizontal" />
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#0a0a0c]">
                                        {orders.length}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">{orders.length} Paket</span>
                                    <span className="text-[10px] text-slate-500 dark:text-emerald-500/70 font-bold truncate max-w-[100px]">Lacak Pengiriman</span>
                                </div>
                            </Link>
                        )}

                        <ThemeToggle />
                        <button
                            onClick={onCartClick}
                            className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            aria-label="Shopping Cart"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div >
                </div >
            </div >

            {/* Mobile Menu */}
            {
                isMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <div className="px-4 py-3 space-y-3">
                            <Link
                                href="/"
                                className={cn(
                                    "block font-medium hover:text-blue-600 dark:hover:text-blue-400",
                                    pathname === "/" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"
                                )}
                                onClick={(e) => handleScroll(e, "/")}
                            >
                                Beranda
                            </Link>
                            <Link
                                href="/products"
                                className={cn(
                                    "block font-medium hover:text-blue-600 dark:hover:text-blue-400",
                                    pathname === "/products" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"
                                )}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Produk
                            </Link>
                            <Link
                                href="/#how-to-buy"
                                className="block text-gray-600 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={(e) => handleScroll(e, "/#how-to-buy")}
                            >
                                Cara Belanja
                            </Link>
                            <Link
                                href="/#about"
                                className="block text-gray-600 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={(e) => handleScroll(e, "/#about")}
                            >
                                Tentang Kami
                            </Link>
                            <Link
                                href="/register"
                                className="block text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 dark:hover:text-emerald-300"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Daftar
                            </Link>
                            <Link
                                href="/login"
                                className="block text-gray-600 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Masuk
                            </Link>
                            {orders.length > 0 && (
                                <Link
                                    href="/orders"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-5 h-5 text-emerald-500" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase text-emerald-600 tracking-widest">Lacak Pesanan</span>
                                            <span className="text-[10px] text-emerald-500/70 font-bold">{orders.length} Paket Aktif</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </div>
                    </div>
                )
            }
        </nav >
    );
}
