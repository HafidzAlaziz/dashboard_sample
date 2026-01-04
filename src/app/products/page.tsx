"use client";

import { DashboardWrapper } from "@/components/layout/DashboardWrapper";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Filter, ChevronDown, Check, MoreHorizontal,
    Plus, Package, AlertTriangle, CheckCircle2, XCircle,
    ChevronLeft, ChevronRight, Eye, Trash2, Edit, X,
    DollarSign, BarChart3, Camera
} from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Product, ProductCategory, ProductStatus, CATEGORIES } from "@/lib/productData";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useToast } from "@/components/ui/ToastContext";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function ProductsPage() {
    const { products, addProduct, updateProduct, deleteProduct, isLoading } = useDashboard();
    const { showToast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "Semua">("Semua");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

    // Modal state
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: "",
        category: "Makanan",
        price: 0,
        stock: 0,
        status: "Tersedia",
        description: ""
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const itemsPerPage = 10;

    const compressImage = (base64: string, callback: (result: string) => void) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 200;
            const MAX_HEIGHT = 200;

            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height = height * (MAX_WIDTH / width);
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width = width * (MAX_HEIGHT / height);
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            callback(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => {
            console.error("Failed to load image for compression");
            showToast("Gagal memproses gambar", "error");
        };
    };

    const processFile = (file: File) => {
        if (file.size > 1024 * 1024) {
            showToast("File terlalu besar! Maksimal ukuran foto produk adalah 1MB.", "error");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            compressImage(base64String, (compressed) => {
                setFormData(prev => ({ ...prev, image: compressed }));
                showToast("Foto produk berhasil diunggah", "success");
            });
        };
        reader.onerror = () => {
            showToast("Gagal membaca file", "error");
        };
        reader.readAsDataURL(file);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (file) {
                processFile(file);
            }
        } catch (err) {
            console.error("Product image upload error:", err);
            showToast("Terjadi kesalahan saat upload foto", "error");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        } else if (file) {
            showToast("Mohon upload file gambar saja", "error");
        }
    };

    // --- Computed Data ---
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "Semua" || product.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, categoryFilter]);

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const stats = useMemo(() => {
        const total = products.length;
        const totalValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
        const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
        const outOfStock = products.filter(p => p.stock === 0).length;
        return { total, totalValue, lowStock, outOfStock };
    }, [products]);

    if (isLoading) {
        return (
            <DashboardWrapper>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-slate-500 font-medium animate-pulse">Memuat produk...</p>
                    </div>
                </div>
            </DashboardWrapper>
        );
    }

    // --- Actions ---
    const handleOpenAdd = () => {
        setEditingProduct(null);
        setFormData({
            name: "",
            category: "Makanan",
            price: 0,
            stock: 0,
            status: "Tersedia",
            description: ""
        });
        setIsAddEditModalOpen(true);
    };

    const handleOpenEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({ ...product });
        setIsAddEditModalOpen(true);
        setOpenActionMenu(null);
    };

    const handleDelete = (id: string) => {
        setProductToDelete(id);
        setIsDeleteModalOpen(true);
        setOpenActionMenu(null);
    };

    const confirmDelete = () => {
        if (productToDelete) {
            deleteProduct(productToDelete);
            showToast("Produk berhasil dihapus", "success");
            setProductToDelete(null);
        }
    };

    const handleSave = () => {
        if (!formData.name || formData.price === undefined || formData.stock === undefined) {
            showToast("Mohon isi semua field yang diperlukan", "error");
            return;
        }

        const productData: Product = {
            id: editingProduct ? editingProduct.id : `PRD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            name: formData.name!,
            category: (formData.category as ProductCategory) || "Makanan",
            price: Number(formData.price),
            stock: Number(formData.stock),
            status: Number(formData.stock) > 0 ? "Tersedia" : "Stok Habis",
            image: formData.image,
            description: formData.description
        };

        if (editingProduct) {
            updateProduct(productData);
            showToast(`Produk "${productData.name}" berhasil diperbarui`, "success");
        } else {
            addProduct(productData);
            showToast(`Produk "${productData.name}" berhasil ditambahkan`, "success");
        }

        setIsAddEditModalOpen(false);
    };

    return (
        <DashboardWrapper>
            <div className="mb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Produk</h1>
                        <p className="text-slate-500 dark:text-slate-400">Kelola inventaris dan katalog produk Anda.</p>
                    </div>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={18} />
                        <span className="text-sm font-medium">Tambah Produk</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Produk", value: stats.total, icon: Package, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
                        { label: "Nilai Inventaris", value: `Rp ${stats.totalValue.toLocaleString('id-ID')}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                        { label: "Stok Menipis", value: stats.lowStock, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
                        { label: "Stok Habis", value: stats.outOfStock, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
                    ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex items-center gap-4">
                            <div className={cn("p-3 rounded-lg", stat.bg, stat.color)}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters & Table */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari nama atau ID produk..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <Filter size={16} className="text-slate-500" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {categoryFilter === "Semua" ? "Kategori" : categoryFilter}
                                </span>
                                <ChevronDown size={16} className={cn("text-slate-400 transition-transform", isFilterOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {isFilterOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-48 z-10 rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800"
                                    >
                                        {["Semua", ...CATEGORIES].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => { setCategoryFilter(cat as any); setIsFilterOpen(false); setCurrentPage(1); }}
                                                className={cn(
                                                    "flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors",
                                                    categoryFilter === cat
                                                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                                                )}
                                            >
                                                {cat}
                                                {categoryFilter === cat && <Check size={12} />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left text-sm relative">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Produk</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Kategori</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Harga</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Stok</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {paginatedProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{product.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            Rp {product.price.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "font-medium",
                                                    product.stock === 0 ? "text-rose-600" : product.stock < 10 ? "text-amber-600" : "text-slate-700 dark:text-slate-300"
                                                )}>
                                                    {product.stock}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                                product.status === "Tersedia"
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                                                    : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                                            )}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={() => setOpenActionMenu(openActionMenu === product.id ? null : product.id)}
                                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            <AnimatePresence>
                                                {openActionMenu === product.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, x: 10 }}
                                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, x: 10 }}
                                                        className="absolute right-full top-0 mr-2 w-40 z-20 rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800"
                                                    >
                                                        <button
                                                            onClick={() => handleOpenEdit(product)}
                                                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                        >
                                                            <Edit size={16} />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                            <span>Hapus</span>
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Menampilkan {paginatedProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} dari {filteredProducts.length} produk
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} className="text-slate-600 dark:text-slate-400" />
                            </button>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {currentPage} / {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} className="text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isAddEditModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsAddEditModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800"
                        >
                            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                                </h2>
                                <button
                                    onClick={() => setIsAddEditModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex justify-center mb-6">
                                    <div
                                        className={cn(
                                            "relative group p-1 rounded-3xl transition-all duration-300",
                                            isDragging ? "bg-indigo-600 scale-105 shadow-2xl shadow-indigo-600/20" : "bg-transparent"
                                        )}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <div
                                            className={cn(
                                                "w-36 h-36 rounded-2xl flex items-center justify-center text-slate-400 border-2 border-dashed overflow-hidden transition-all duration-300",
                                                isDragging
                                                    ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 dark:border-indigo-500 scale-95"
                                                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500"
                                            )}
                                        >
                                            {formData.image ? (
                                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={cn("p-2 rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors", isDragging && "bg-indigo-100 dark:bg-indigo-800 text-indigo-600")}>
                                                        <Package size={32} />
                                                    </div>
                                                    <span className="text-[10px] font-medium uppercase tracking-wider">
                                                        {isDragging ? "Lepas Foto" : "Tarik Foto ke Sini"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute -bottom-2 -right-2 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg text-indigo-600 dark:text-indigo-400 hover:scale-110 active:scale-95 transition-all z-10"
                                            title="Pilih File"
                                        >
                                            <Camera size={18} />
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Produk</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder="Contoh: Kopi Susu Mantap"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Harga (Rp)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stok</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi Produk</label>
                                    <textarea
                                        value={formData.description || ""}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[100px] resize-none"
                                        placeholder="Jelaskan detail produk Anda..."
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                                <button
                                    onClick={() => setIsAddEditModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 text-sm font-medium"
                                >
                                    Simpan Produk
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Hapus Produk"
                message="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
                confirmText="Ya, Hapus"
                cancelText="Batal"
            />
        </DashboardWrapper>
    );
}
