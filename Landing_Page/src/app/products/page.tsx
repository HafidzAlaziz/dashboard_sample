"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProducts } from "@/services/api";
import { Product } from "@/types";
import { Search, Filter, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/products/ProductGrid";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Mock data fallback if API fails (for development/demo)
    const mockProducts: Product[] = [
        { id: "1", name: "Kopi Arabika Gayo", category: "Minuman", price: 75000, stock: 50, status: "Available", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop", weight: 1000 },
        { id: "2", name: "Keripik Singkong Pedas", category: "Makanan", price: 15000, stock: 100, status: "Available", image: "https://images.unsplash.com/photo-1566478919030-2614439499bc?q=80&w=800&auto=format&fit=crop", weight: 1000 },
        { id: "3", name: "Tas Anyaman Rotan", category: "Kerajinan", price: 250000, stock: 20, status: "Available", image: "https://images.unsplash.com/photo-1590874103328-3607bac56855?q=80&w=800&auto=format&fit=crop", weight: 1000 },
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                const productsWithWeight = data.map((p: any) => ({
                    ...p,
                    weight: p.weight || 1000
                }));
                setProducts(productsWithWeight);
                setFilteredProducts(productsWithWeight);
            } catch (error) {
                console.error("Failed to fetch products, using mock data", error);
                setProducts(mockProducts);
                setFilteredProducts(mockProducts);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        let result = products;

        if (selectedCategory !== "All") {
            result = result.filter(p => p.category === selectedCategory);
        }

        if (searchTerm) {
            result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setFilteredProducts(result);
    }, [searchTerm, selectedCategory, products]);

    const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0c]">
            <Navbar onCartClick={() => setIsCartOpen(true)} />

            <div className="container mx-auto px-4 md:px-8 pt-28 pb-20">
                <Link href="/" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors group font-bold text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Beranda
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Katalog Produk</h1>
                        <p className="text-gray-600 dark:text-slate-400 font-medium">Temukan produk UMKM berkualitas tinggi pilihan kami.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                className="pl-12 pr-6 py-3 bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 w-full sm:w-64 transition-all dark:text-white font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <select
                                className="pl-12 pr-10 py-3 bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 appearance-none w-full sm:w-56 transition-all dark:text-white font-medium cursor-pointer"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat} className="dark:bg-[#16161a]">{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <div key={n} className="aspect-square bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        <ProductGrid products={filteredProducts} />
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full text-center py-32 bg-white dark:bg-white/[0.02] rounded-[40px] border border-dashed border-gray-200 dark:border-white/10">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Produk Tidak Ditemukan</h3>
                                <p className="text-gray-500 dark:text-slate-500">Coba gunakan kata kunci pencarian yang berbeda.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </main>
    );
}
