"use client";

import { DashboardWrapper } from "@/components/layout/DashboardWrapper";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Filter, ChevronDown, Check, MoreHorizontal,
    Download, ShoppingBag, Clock, CheckCircle2, XCircle,
    ChevronLeft, ChevronRight, Eye, Trash2, Edit, Calendar, X, AlertTriangle
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Order, OrderStatus, STATUSES, PRODUCTS } from "@/lib/orderData";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useToast } from "@/components/ui/ToastContext";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function OrdersPage() {
    const { orders, setOrders, stats, deleteOrder, updateOrder, products } = useDashboard();
    const { showToast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "Semua">("Semua");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

    // Date filter states
    const [dateFilterType, setDateFilterType] = useState<"preset" | "custom">("preset");
    const [presetDateFilter, setPresetDateFilter] = useState<string>("Semua");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    // Modal state
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Order | null>(null);

    // Rejection state
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    const handleApproveCancellation = async () => {
        if (selectedOrder) {
            updateOrder({ ...selectedOrder, status: 'Dibatalkan' });
            showToast(`Permintaan pembatalan pesanan ${selectedOrder.id} disetujui`, "success");
            setIsModalOpen(false);
        }
    };

    const handleRejectCancellation = async () => {
        if (selectedOrder && rejectionReason) {
            updateOrder({
                ...selectedOrder,
                status: 'Diproses', // Return to Processing (Lanjut Proses)
                rejectionReason: rejectionReason
            });
            showToast(`Permintaan pembatalan pesanan ${selectedOrder.id} ditolak`, "info");
            setIsModalOpen(false);
            setRejectionReason("");
            setIsRejecting(false);
        }
    };

    // Calculate subtotal and fees for the selected order
    const orderBreakdown = useMemo(() => {
        if (!selectedOrder) return { subtotal: 0, fees: 0, totalQty: 0 };

        let subtotal = 0;
        let totalQty = 0;
        let isParsed = false;

        try {
            const parsed = JSON.parse(selectedOrder.products);
            if (Array.isArray(parsed)) {
                subtotal = parsed.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0);
                totalQty = parsed.reduce((sum: number, p: any) => sum + p.quantity, 0);
                isParsed = true;
            }
        } catch (e) {
            // Fallback for non-JSON product strings
        }

        if (!isParsed) {
            subtotal = selectedOrder.amount;
            totalQty = 1;
        }

        const fees = Math.max(0, selectedOrder.amount - subtotal);

        return { subtotal, fees, totalQty };
    }, [selectedOrder]);

    const itemsPerPage = 10;

    // --- Computed Data ---
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return orders.filter(order => {
            // Search filter
            const matchesSearch =
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer.toLowerCase().includes(searchTerm.toLowerCase());

            // Status filter
            const matchesStatus = statusFilter === "Semua" || order.status === statusFilter;

            // Date filter
            let matchesDate = true;
            if (dateFilterType === "preset" && presetDateFilter !== "Semua") {
                const orderDate = new Date(order.dateObj);
                orderDate.setHours(0, 0, 0, 0);

                if (presetDateFilter === "Hari Ini") {
                    matchesDate = orderDate.getTime() === today.getTime();
                } else if (presetDateFilter === "Kemarin") {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    matchesDate = orderDate.getTime() === yesterday.getTime();
                } else if (presetDateFilter === "7 Hari") {
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    matchesDate = orderDate >= sevenDaysAgo;
                } else if (presetDateFilter === "30 Hari") {
                    const thirtyDaysAgo = new Date(today);
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    matchesDate = orderDate >= thirtyDaysAgo;
                } else if (presetDateFilter === "Bulan Ini") {
                    matchesDate = orderDate.getMonth() === today.getMonth() &&
                        orderDate.getFullYear() === today.getFullYear();
                } else if (presetDateFilter === "Tahun Ini") {
                    matchesDate = orderDate.getFullYear() === today.getFullYear();
                }
            } else if (dateFilterType === "custom" && (customStartDate || customEndDate)) {
                const orderTime = order.dateObj.getTime();
                if (customStartDate && customEndDate) {
                    const start = new Date(customStartDate).getTime();
                    const end = new Date(customEndDate).getTime();
                    matchesDate = orderTime >= start && orderTime <= end;
                } else if (customStartDate) {
                    const start = new Date(customStartDate).getTime();
                    matchesDate = orderTime >= start;
                } else if (customEndDate) {
                    const end = new Date(customEndDate).getTime();
                    matchesDate = orderTime <= end;
                }
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [orders, searchTerm, statusFilter, dateFilterType, presetDateFilter, customStartDate, customEndDate]);

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(start, start + itemsPerPage);
    }, [filteredOrders, currentPage]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    // --- Helper Functions ---
    const getStatusStyle = (status: OrderStatus) => {
        switch (status) {
            case "Selesai": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
            case "Menunggu": return "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300"; // Changed from Amber to Slate for normal Pending
            case "Diproses": return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
            case "Dikirim": return "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400";
            case "Dibatalkan": return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400";
            case "Menunggu Pembatalan": return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
            default: return "bg-slate-100 text-slate-700";
        }
    };

    const formatProductDisplay = (productString: string) => {
        try {
            const parsed = JSON.parse(productString);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map((p: any) => `${p.name} (x${p.quantity})`).join(", ");
            }
            return productString;
        } catch (e) {
            return productString;
        }
    };

    const calculateSubtotal = (productString: string, fallbackAmount: number) => {
        try {
            const parsed = JSON.parse(productString);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0);
            }
        } catch (e) {
            // Fallback
        }
        return fallbackAmount;
    };

    const getCurrentProductId = (productString: string) => {
        try {
            const parsed = JSON.parse(productString);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
                return parsed[0].id;
            }
            // Fallback strategy: try to find by name if JSON parse fails or no ID
            const found = products.find(p => p.name === productString);
            return found ? found.id : "";
        } catch (e) {
            const found = products.find(p => p.name === productString);
            return found ? found.id : "";
        }
    };

    const formatPaymentMethod = (method: string) => {
        if (!method) return '-';
        // Clean up complex strings like "Gateway | Alamat..."
        let cleaned = method.split('|')[0].trim();

        // Map common terms
        if (cleaned === 'Tunai') return 'COD';

        // Truncate if too long
        if (cleaned.length > 20) {
            return cleaned.substring(0, 17) + '...';
        }

        return cleaned;
    };



    const handleProductChange = (productId: string) => {
        if (!editFormData) return;

        const selectedProduct = products.find(p => p.id === productId);
        if (selectedProduct) {
            // Create JSON structure for the product
            const productJson = JSON.stringify([{
                id: selectedProduct.id,
                name: selectedProduct.name,
                price: selectedProduct.price,
                quantity: 1
            }]);

            setEditFormData({
                ...editFormData,
                products: productJson,
                amount: selectedProduct.price
            });
        }
    };

    const handleExportCSV = () => {
        showToast("Mengekspor data ke CSV...", "info");
        const headers = ["ID Pesanan", "Pelanggan", "Tanggal", "Produk", "Status", "Metode Bayar", "Total"];
        const csvData = filteredOrders.map(order => [
            order.id,
            order.customer,
            order.date,
            order.products,
            order.status,
            order.paymentMethod,
            order.amount
        ]);

        const csvContent = [
            headers.join(","),
            ...csvData.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `laporan-pesanan-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Laporan berhasil diunduh", "success");
    };

    const handleViewOrder = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setSelectedOrder(order);
            setIsModalOpen(true);
        }
        setOpenActionMenu(null);
    };

    const handleEditOrder = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setEditFormData({ ...order });
            setIsEditModalOpen(true);
        }
        setOpenActionMenu(null);
    };

    const handleSaveEdit = () => {
        if (editFormData) {
            updateOrder(editFormData);
            showToast(`Pesanan ${editFormData.id} berhasil diperbarui`, "success");
            setIsEditModalOpen(false);
            setEditFormData(null);
        }
    };

    const handleDeleteOrder = (orderId: string) => {
        setOrderToDelete(orderId);
        setIsDeleteModalOpen(true);
        setOpenActionMenu(null);
    };

    const confirmDeleteOrder = () => {
        if (orderToDelete) {
            deleteOrder(orderToDelete);
            showToast(`Pesanan ${orderToDelete} telah dihapus`, "success");
            setOrderToDelete(null);
        }
    };

    const getActiveDateLabel = () => {
        if (dateFilterType === "custom" && (customStartDate || customEndDate)) {
            if (customStartDate && customEndDate) {
                return `${new Date(customStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${new Date(customEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            } else if (customStartDate) {
                return `Dari ${new Date(customStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            } else {
                return `Sampai ${new Date(customEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            }
        }
        return presetDateFilter === "Semua" ? "Tanggal" : presetDateFilter;
    };

    const clearCustomDate = () => {
        setCustomStartDate("");
        setCustomEndDate("");
        setDateFilterType("preset");
        setPresetDateFilter("Semua");
    };

    return (
        <DashboardWrapper>
            <div className="mb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Pesanan</h1>
                        <p className="text-slate-500 dark:text-slate-400">Pantau dan kelola semua transaksi toko Anda.</p>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        <Download size={18} />
                        <span className="text-sm font-medium">Export Laporan</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Pesanan", value: stats.totalOrders, icon: ShoppingBag, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
                        { label: "Total Pendapatan", value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                        { label: "Menunggu Proses", value: stats.pendingOrders, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
                        { label: "Dibatalkan", value: stats.cancelledOrders, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
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
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800"
                >

                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari ID Pesanan atau Nama Pelanggan..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            {/* Date Filter */}
                            <div className="relative flex items-center gap-1">
                                {(dateFilterType === "custom" && (customStartDate || customEndDate)) && (
                                    <button
                                        onClick={clearCustomDate}
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        title="Clear date filter"
                                    >
                                        <X size={14} className="text-slate-500" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <Calendar size={16} className="text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[150px] truncate">
                                        {getActiveDateLabel()}
                                    </span>
                                    <ChevronDown size={16} className={cn("text-slate-400 transition-transform", isDateFilterOpen && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {isDateFilterOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 w-72 z-10 rounded-xl border border-slate-200 bg-white p-3 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800"
                                        >
                                            {/* Preset Filters */}
                                            <div className="mb-3">
                                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Filter Cepat</p>
                                                <div className="space-y-1">
                                                    {["Semua", "Hari Ini", "Kemarin", "7 Hari", "30 Hari", "Bulan Ini", "Tahun Ini"].map((filter) => (
                                                        <button
                                                            key={filter}
                                                            onClick={() => {
                                                                setDateFilterType("preset");
                                                                setPresetDateFilter(filter);
                                                                setCustomStartDate("");
                                                                setCustomEndDate("");
                                                                setIsDateFilterOpen(false);
                                                                setCurrentPage(1);
                                                            }}
                                                            className={cn(
                                                                "flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors",
                                                                dateFilterType === "preset" && presetDateFilter === filter
                                                                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                                                            )}
                                                        >
                                                            {filter}
                                                            {dateFilterType === "preset" && presetDateFilter === filter && <Check size={12} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Custom Date Range */}
                                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Pilih Periode</p>
                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="text-xs text-slate-600 dark:text-slate-400">Dari</label>
                                                        <input
                                                            type="date"
                                                            value={customStartDate}
                                                            onChange={(e) => { setCustomStartDate(e.target.value); setDateFilterType("custom"); setCurrentPage(1); }}
                                                            className="w-full mt-1 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-600 dark:text-slate-400">Sampai</label>
                                                        <input
                                                            type="date"
                                                            value={customEndDate}
                                                            onChange={(e) => { setCustomEndDate(e.target.value); setDateFilterType("custom"); setCurrentPage(1); }}
                                                            className="w-full mt-1 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Status Filter */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <Filter size={16} className="text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {statusFilter === "Semua" ? "Status" : statusFilter}
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
                                            {["Semua", ...STATUSES].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => { setStatusFilter(status as any); setIsFilterOpen(false); setCurrentPage(1); }}
                                                    className={cn(
                                                        "flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors",
                                                        statusFilter === status
                                                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                                                    )}
                                                >
                                                    {status}
                                                    {statusFilter === status && <Check size={12} />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto overflow-y-visible min-h-[300px]">
                        <table className="w-full text-left text-sm relative">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">ID Pesanan</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Pelanggan</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Tanggal</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Produk</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Harga Produk</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {paginatedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{order.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    {order.customer.charAt(0)}
                                                </div>
                                                <span className="text-slate-700 dark:text-slate-300">{order.customer}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{order.date}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                                            {formatProductDisplay(order.products)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusStyle(order.status))}>
                                                    {order.status}
                                                </span>

                                                {order.paymentStatus === 'Paid' ? (
                                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 ml-1">
                                                        <CheckCircle2 size={10} /> Lunas • {formatPaymentMethod(order.paymentMethod)}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5 ml-1">
                                                        <Clock size={10} /> Belum Bayar • {formatPaymentMethod(order.paymentMethod)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                            Rp {calculateSubtotal(order.products, order.amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={() => setOpenActionMenu(openActionMenu === order.id ? null : order.id)}
                                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            <AnimatePresence>
                                                {openActionMenu === order.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, x: 10 }}
                                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, x: 10 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="absolute right-full top-0 mr-2 w-48 z-[100] rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800"
                                                    >
                                                        <button
                                                            onClick={() => handleViewOrder(order.id)}
                                                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                        >
                                                            <Eye size={16} />
                                                            <span>Lihat Detail</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditOrder(order.id)}
                                                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                        >
                                                            <Edit size={16} />
                                                            <span>Edit Pesanan</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteOrder(order.id)}
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
                            Menampilkan {paginatedOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} dari {filteredOrders.length} pesanan
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
                                Halaman {currentPage} dari {totalPages || 1}
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

                {/* Order Detail Modal */}
                <AnimatePresence>
                    {isModalOpen && selectedOrder && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800"
                            >
                                {/* Modal Header */}
                                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Detail Pesanan</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{selectedOrder.id}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6 space-y-6">
                                    {/* Status Badge */}
                                    <div className="flex items-center justify-between">
                                        <span className={cn("inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border", getStatusStyle(selectedOrder.status))}>
                                            {selectedOrder.status}
                                        </span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{selectedOrder.date}</span>
                                    </div>

                                    {/* Cancellation Request Section */}
                                    {selectedOrder.status === 'Menunggu Pembatalan' && (
                                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                                                <AlertTriangle size={16} /> Permintaan Pembatalan
                                            </h3>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                                                Alasan: <span className="font-medium">"{selectedOrder.cancellationReason || '-'}"</span>
                                            </p>

                                            {!isRejecting ? (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={handleApproveCancellation}
                                                        className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        Setujui Pembatalan
                                                    </button>
                                                    <button
                                                        onClick={() => setIsRejecting(true)}
                                                        className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <textarea
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        placeholder="Masukkan alasan penolakan..."
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                        rows={3}
                                                    />
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => { setIsRejecting(false); setRejectionReason(""); }}
                                                            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400"
                                                        >
                                                            Batal
                                                        </button>
                                                        <button
                                                            onClick={handleRejectCancellation}
                                                            disabled={!rejectionReason}
                                                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
                                                        >
                                                            Kirim Penolakan
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Display Rejection Reason if it exists and not currently rejecting */}
                                    {selectedOrder.rejectionReason && selectedOrder.status !== 'Menunggu Pembatalan' && (
                                        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                                            <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-400 mb-1 flex items-center gap-2">
                                                <XCircle size={16} /> Pembatalan Ditolak
                                            </h3>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                                Alasan: <span className="font-medium">"{selectedOrder.rejectionReason}"</span>
                                            </p>
                                        </div>
                                    )}

                                    {/* Customer Info */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Informasi Pelanggan</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold dark:bg-indigo-900/30 dark:text-indigo-400">
                                                {selectedOrder.customer.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.customer}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Pelanggan Setia</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Detail Pesanan</h3>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-900 dark:text-white">{formatProductDisplay(selectedOrder.products)}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-black tracking-widest">Qty: {orderBreakdown.totalQty}</p>
                                                </div>
                                                <p className="font-black text-indigo-600 dark:text-indigo-400">
                                                    Rp {orderBreakdown.subtotal.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Payment Info */}
                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">Subtotal</span>
                                                <span className="text-slate-900 dark:text-white font-bold">Rp {orderBreakdown.subtotal.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">Ongkir & Biaya Layanan</span>
                                                <span className="text-slate-900 dark:text-white font-bold">Rp {orderBreakdown.fees.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                                                <span className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Total Bayar</span>
                                                <span className="font-black text-xl text-indigo-600 dark:text-indigo-400 tracking-tight">
                                                    Rp {selectedOrder.amount.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Metode Pembayaran</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedOrder.paymentMethod}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex gap-3">
                                    <button
                                        onClick={() => { setIsModalOpen(false); handleEditOrder(selectedOrder.id); }}
                                        className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                                    >
                                        Edit Pesanan
                                    </button>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-600/20"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit Order Modal */}
                <AnimatePresence>
                    {isEditModalOpen && editFormData && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800"
                            >
                                {/* Modal Header */}
                                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Pesanan</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{editFormData.id}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                {/* Modal Content - Form */}
                                <div className="p-6 space-y-6">
                                    {/* Customer Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Nama Pelanggan
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.customer}
                                            onChange={(e) => setEditFormData({ ...editFormData, customer: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Product */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Produk
                                        </label>
                                        <select
                                            value={getCurrentProductId(editFormData.products)}
                                            onChange={(e) => handleProductChange(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="" disabled>Pilih Produk</option>
                                            {products.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} - Rp {product.price.toLocaleString('id-ID')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Total Harga (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            value={editFormData.amount}
                                            onChange={(e) => setEditFormData({ ...editFormData, amount: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            min="0"
                                            step="1000"
                                        />
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Status Pesanan
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {STATUSES.map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => setEditFormData({ ...editFormData, status })}
                                                    className={cn(
                                                        "px-4 py-2.5 rounded-xl border transition-all font-medium",
                                                        editFormData.status === status
                                                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300"
                                                    )}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Status Pembayaran
                                        </label>
                                        <div className="flex gap-3 mb-6">
                                            <button
                                                onClick={() => setEditFormData({ ...editFormData, paymentStatus: 'Paid' })}
                                                className={cn(
                                                    "flex-1 px-4 py-2.5 rounded-xl border transition-all font-medium flex items-center justify-center gap-2",
                                                    editFormData.paymentStatus === 'Paid'
                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300"
                                                )}
                                            >
                                                <CheckCircle2 size={16} />
                                                Lunas
                                            </button>
                                            <button
                                                onClick={() => setEditFormData({ ...editFormData, paymentStatus: 'Unpaid' })}
                                                className={cn(
                                                    "flex-1 px-4 py-2.5 rounded-xl border transition-all font-medium flex items-center justify-center gap-2",
                                                    editFormData.paymentStatus === 'Unpaid'
                                                        ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300"
                                                )}
                                            >
                                                <Clock size={16} />
                                                Belum Bayar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Metode Pembayaran
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(["QRIS", "Transfer", "Tunai"] as const).map((method) => (
                                                <button
                                                    key={method}
                                                    onClick={() => setEditFormData({
                                                        ...editFormData,
                                                        paymentMethod: method,
                                                        // Logic: Tunai -> Unpaid, Others -> Paid (Auto-set)
                                                        paymentStatus: method === "Tunai" ? "Unpaid" : "Paid"
                                                    })}
                                                    className={cn(
                                                        "px-4 py-2.5 rounded-xl border transition-all font-medium",
                                                        editFormData.paymentMethod === method
                                                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300"
                                                    )}
                                                >
                                                    {method}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex gap-3">
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-600/20"
                                    >
                                        Simpan Perubahan
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
                    onConfirm={confirmDeleteOrder}
                    title="Hapus Pesanan"
                    message={`Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.`}
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </div>
        </DashboardWrapper >
    );
}
