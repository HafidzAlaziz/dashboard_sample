"use client";


import { ShoppingCart } from "lucide-react";
import { Product, useCartStore } from "@/store/useCartStore";
import { useToastStore } from "@/store/useToastStore";
import { formatRupiah, cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

interface ProductCardProps {
    product: Product;
    priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const addToast = useToastStore((state) => state.addToast);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAdding(true);
        addItem(product);
        addToast(`Berhasil menambahkan ${product.name} ke keranjang`, "success");

        // Simulate feedback
        setTimeout(() => setIsAdding(false), 500);
    };

    return (
        <div className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col h-full">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Link href={`/products/${product.id}`} className="block h-full w-full">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </Link>
                {/* Quick Add Button Overlay */}
                <button
                    onClick={handleAddToCart}
                    className="absolute bottom-3 right-3 p-3 bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 rounded-full shadow-lg md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 active:scale-90 z-10"
                    aria-label="Add to cart"
                >
                    <ShoppingCart className={cn("w-5 h-5", isAdding && "animate-bounce")} />
                </button>
            </div>

            {/* Content */}
            <Link href={`/products/${product.id}`} className="p-4 flex flex-col flex-grow group/link">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                    {product.category}
                </span>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors">
                    {product.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 h-8">
                    {product.description || "Tidak ada deskripsi produk."}
                </p>
                <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                        {formatRupiah(product.price)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {product.weight}g
                    </span>
                </div>
            </Link>
        </div>
    );
}
