"use client";

import { Product } from "@/store/useCartStore";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
    products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
        </div>
    );
}
