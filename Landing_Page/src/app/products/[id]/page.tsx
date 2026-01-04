"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "@/services/api";
import { ArrowLeft, ShoppingBag, MessageCircle, Check, AlertCircle, Star, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { formatRupiah, cn } from "@/lib/utils";
import { Review } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingCart } from "lucide-react";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [product, setProduct] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = () => {
        if (!product) return;
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            weight: product.weight || 100 // fallback weight
        });
        setIsCartOpen(true);
    };

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const data = await getProductById(id);
                setProduct(data);

                // Mock reviews for now - will be replaced by real DB call later
                setReviews([
                    { id: "1", product_id: id, user_name: "Budi Santoso", rating: 5, comment: "Produknya bagus banget, kualitas oke!", created_at: "2024-01-01" },
                    { id: "2", product_id: id, user_name: "Siti Aminah", rating: 4, comment: "Pengiriman cepat, packing rapi.", created_at: "2024-01-02" }
                ]);
            } catch (error) {
                console.error("Failed to fetch product", error);
                // Fallback mock
                const mock = id === '1' ? { id: "1", name: "Kopi Arabika Gayo", category: "Minuman", price: 75000, stock: 50, status: "Available", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop", description: "Kopi Arabika asli dari dataran tinggi Gayo dengan cita rasa khas yang mendunia.", sales_count: 154 }
                    : id === '2' ? { id: "2", name: "Keripik Singkong Pedas", category: "Makanan", price: 15000, stock: 100, status: "Available", image: "https://images.unsplash.com/photo-1566478919030-2614439499bc?q=80&w=800&auto=format&fit=crop", description: "Camilan renyah nan pedas yang cocok untuk menemani waktu santai Anda.", sales_count: 890 }
                        : { id: "3", name: "Tas Anyaman Rotan", category: "Kerajinan", price: 250000, stock: 20, status: "Available", image: "https://images.unsplash.com/photo-1590874103328-3607bac56855?q=80&w=800&auto=format&fit=crop", description: "Tas rotan handmade berkualitas tinggi, modis dan ramah lingkungan.", sales_count: 45 };
                setProduct(mock as any);
                setReviews([
                    { id: "1", product_id: id, user_name: "John Doe", rating: 5, comment: "Mantap jiwa!", created_at: "2024-01-10" }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

    return (
        <main className="min-h-screen bg-white dark:bg-[#0a0a0c]">
            <Navbar onCartClick={() => setIsCartOpen(true)} />

            <div className="container mx-auto px-4 md:px-8 pt-28 pb-20">
                <Link href="/products" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors group font-bold text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Produk
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
                    {/* Left: Image Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-square bg-gray-50 dark:bg-white/[0.02] rounded-[40px] overflow-hidden relative border border-gray-100 dark:border-white/5 shadow-2xl"
                    >
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                        )}
                        <div className="absolute top-6 left-6 bg-white/90 dark:bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-white/10 shadow-lg">
                            {product.category}
                        </div>
                    </motion.div>

                    {/* Right: Info Section */}
                    <div className="flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-400/10 rounded-lg">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-500">4.8</span>
                                </div>
                                <span className="text-sm font-medium text-gray-500 dark:text-slate-500">
                                    | {product.sales_count || 0}+ Terjual
                                </span>
                            </div>

                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                                    {product.name}
                                </h1>
                                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-4 tracking-tighter">
                                    {formatRupiah(product.price)}
                                </p>
                            </div>

                            <div className="py-8 border-y border-gray-100 dark:border-white/5 space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-slate-600">Deskripsi Produk</h4>
                                <p className="text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
                                    {product.description || "Deskripsi produk tidak tersedia."}
                                </p>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-600 mb-1">Stok</span>
                                    <div className={`flex items-center gap-2 ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                                        {product.stock > 0 ? <Check className="w-5 h-5 font-black" /> : <AlertCircle className="w-5 h-5" />}
                                        <span className="font-bold">{product.stock > 0 ? `${product.stock} Tersedia` : "Habis"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 px-8 py-5 bg-white dark:bg-white/5 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-white/10 rounded-[24px] font-black hover:border-indigo-500/50 hover:bg-indigo-50/10 transition-all text-center flex items-center justify-center gap-3 text-lg"
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    TAMBAHKAN
                                </button>
                                <Link
                                    href={`/checkout?productId=${product.id}`}
                                    className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-[24px] font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-3 text-lg"
                                >
                                    <ShoppingBag className="w-6 h-6" />
                                    BELI SEKARANG
                                </Link>
                                <a
                                    href={`https://wa.me/6281234567890?text=Halo%20saya%20tertarik%20dengan%20produk%20${product.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-[0.5] px-6 py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-[24px] font-black hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-3 text-lg"
                                    title="Tanya Penjual"
                                >
                                    <MessageCircle className="w-6 h-6" />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="space-y-12">
                    <div className="flex items-end justify-between border-b border-gray-100 dark:border-white/5 pb-8">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 underline decoration-indigo-500 decoration-8 underline-offset-8">Apa Kata Pembeli</h2>
                            <p className="text-gray-500 dark:text-slate-500 font-medium">Ulasan asli dari pembeli yang sudah mencoba produk ini.</p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-4xl font-black text-gray-900 dark:text-white">4.8<span className="text-lg text-gray-400">/5</span></div>
                            <div className="flex justify-end gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {reviews.length > 0 ? reviews.map((review) => (
                            <div key={review.id} className="p-8 bg-gray-50 dark:bg-white/[0.02] rounded-[32px] border border-gray-100 dark:border-white/5 space-y-4 hover:border-indigo-500/30 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{review.user_name}</h4>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-slate-600">Terverifikasi</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={cn("w-3 h-3", i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200 dark:text-slate-800")} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-slate-400 font-medium leading-relaxed italic">"{review.comment}"</p>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-700 pt-2">{review.created_at}</p>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-white/[0.02] rounded-[40px] border border-dashed border-gray-200 dark:border-white/10">
                                <p className="text-gray-500 dark:text-slate-600 font-bold">Belum ada ulasan untuk produk ini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </main>
    );
}
