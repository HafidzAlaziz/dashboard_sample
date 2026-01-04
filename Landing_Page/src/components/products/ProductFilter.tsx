"use client";

import { Search } from "lucide-react";

interface ProductFilterProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
    selectedCategory: string;
    onCategoryChange: (value: string) => void;
    categories: string[];
}

export function ProductFilter({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    selectedCategory,
    onCategoryChange,
    categories,
}: ProductFilterProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-100"
                />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48">
                <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200 appearance-none cursor-pointer"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {/* Sort */}
            <div className="w-full md:w-48">
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200 appearance-none cursor-pointer"
                >
                    <option value="newest">Terbaru</option>
                    <option value="price_low">Harga Terendah</option>
                    <option value="price_high">Harga Tertinggi</option>
                    <option value="name_asc">Nama (A-Z)</option>
                </select>
            </div>
        </div>
    );
}
