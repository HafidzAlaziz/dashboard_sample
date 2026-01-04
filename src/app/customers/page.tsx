"use client";

import { DashboardWrapper } from "@/components/layout/DashboardWrapper";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Filter, ChevronDown, Check, MoreHorizontal,
    Plus, Users, UserPlus, Mail, Phone, Calendar,
    ChevronLeft, ChevronRight, Edit, Trash2, X,
    TrendingUp, UserCheck, Star
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Customer, CustomerSegment } from "@/lib/customerData";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useToast } from "@/components/ui/ToastContext";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function CustomersPage() {
    const { customers, addCustomer, updateCustomer, deleteCustomer, isLoading } = useDashboard();
    const { showToast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [segmentFilter, setSegmentFilter] = useState<CustomerSegment | "Semua">("Semua");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

    // Modal state
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState<Partial<Customer>>({
        name: "",
        email: "",
        phone: "",
        segment: "Baru"
    });

    const itemsPerPage = 8;
    const SEGMENTS: CustomerSegment[] = ["Baru", "Reguler", "VIP", "Loyal"];

    // --- Computed Data ---
    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSegment = segmentFilter === "Semua" || customer.segment === segmentFilter;
            return matchesSearch && matchesSegment;
        });
    }, [customers, searchTerm, segmentFilter]);

    const paginatedCustomers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredCustomers.slice(start, start + itemsPerPage);
    }, [filteredCustomers, currentPage]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    const stats = useMemo(() => {
        const total = customers.length;
        const totalVIP = customers.filter(c => c.segment === "VIP").length;
        const totalNew = customers.filter(c => c.segment === "Baru").length;
        const totalAverageSpend = customers.length > 0
            ? Math.round(customers.reduce((acc, curr) => acc + curr.totalSpend, 0) / customers.length)
            : 0;
        return { total, totalVIP, totalNew, totalAverageSpend };
    }, [customers]);

    if (isLoading) {
        return (
            <DashboardWrapper>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-slate-500 font-medium animate-pulse">Memuat pelanggan...</p>
                    </div>
                </div>
            </DashboardWrapper>
        );
    }

    // --- Actions ---
    const handleOpenAdd = () => {
        setEditingCustomer(null);
        setFormData({ name: "", email: "", phone: "", segment: "Baru" });
        setIsAddEditModalOpen(true);
    };

    const handleOpenEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({ ...customer });
        setIsAddEditModalOpen(true);
        setOpenActionMenu(null);
    };

    const handleDelete = (id: string) => {
        setCustomerToDelete(id);
        setIsDeleteModalOpen(true);
        setOpenActionMenu(null);
    };

    const confirmDelete = () => {
        if (customerToDelete) {
            deleteCustomer(customerToDelete);
            showToast("Data pelanggan berhasil dihapus", "success");
            setCustomerToDelete(null);
        }
    };

    const handleSave = () => {
        if (!formData.name || !formData.email) {
            showToast("Nama dan Email wajib diisi", "error");
            return;
        }

        const now = new Date().toISOString().split('T')[0];
        const customerData: Customer = {
            id: editingCustomer ? editingCustomer.id : `CUST-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
            name: formData.name!,
            email: formData.email!,
            phone: formData.phone || "-",
            segment: formData.segment as CustomerSegment || "Baru",
            totalOrders: editingCustomer ? editingCustomer.totalOrders : 0,
            totalSpend: editingCustomer ? editingCustomer.totalSpend : 0,
            lastOrderDate: editingCustomer ? editingCustomer.lastOrderDate : "-",
            joinDate: editingCustomer ? editingCustomer.joinDate : now
        };

        if (editingCustomer) {
            updateCustomer(customerData);
            showToast(`Data "${customerData.name}" berhasil diperbarui`, "success");
        } else {
            addCustomer(customerData);
            showToast(`Pelanggan baru "${customerData.name}" berhasil ditambahkan`, "success");
        }

        setIsAddEditModalOpen(false);
    };

    const getSegmentStyle = (segment: CustomerSegment) => {
        switch (segment) {
            case "VIP": return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
            case "Loyal": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30";
            case "Reguler": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
            case "Baru": return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600";
        }
    };

    return (
        <DashboardWrapper>
            <div className="mb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Database Pelanggan</h1>
                        <p className="text-slate-500 dark:text-slate-400">Kelola riwayat dan segmentasi pelanggan Anda.</p>
                    </div>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        <UserPlus size={18} />
                        <span className="text-sm font-medium">Tambah Pelanggan</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Pelanggan", value: stats.total, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
                        { label: "Pelanggan VIP", value: stats.totalVIP, icon: Star, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
                        { label: "Pelanggan Baru", value: stats.totalNew, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                        { label: "Rata-rata Belanja", value: `Rp ${stats.totalAverageSpend.toLocaleString('id-ID')}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
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
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari nama atau email..."
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
                                    {segmentFilter === "Semua" ? "Segmen" : segmentFilter}
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
                                        {["Semua", ...SEGMENTS].map((seg) => (
                                            <button
                                                key={seg}
                                                onClick={() => { setSegmentFilter(seg as any); setIsFilterOpen(false); setCurrentPage(1); }}
                                                className={cn(
                                                    "flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors",
                                                    segmentFilter === seg
                                                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                                                )}
                                            >
                                                {seg}
                                                {segmentFilter === seg && <Check size={12} />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm relative">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Pelanggan</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Kontak</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Statistik</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Segmen</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Join Date</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {paginatedCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{customer.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{customer.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                    <Mail size={12} />
                                                    {customer.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                    <Phone size={12} />
                                                    {customer.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="font-medium text-slate-900 dark:text-white">{customer.totalOrders}</span> Pesanan
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Total: <span className="font-medium text-slate-900 dark:text-white">Rp {customer.totalSpend.toLocaleString('id-ID')}</span>
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                                getSegmentStyle(customer.segment)
                                            )}>
                                                {customer.segment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white text-xs">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-slate-400" />
                                                {new Date(customer.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={() => setOpenActionMenu(openActionMenu === customer.id ? null : customer.id)}
                                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            <AnimatePresence>
                                                {openActionMenu === customer.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, x: 10 }}
                                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, x: 10 }}
                                                        className="absolute right-full top-0 mr-2 w-40 z-20 rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800"
                                                    >
                                                        <button
                                                            onClick={() => handleOpenEdit(customer)}
                                                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                        >
                                                            <Edit size={16} />
                                                            <span>Edit Profil</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(customer.id)}
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

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            Menampilkan {paginatedCustomers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} dari {filteredCustomers.length} pelanggan
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-semibold">{currentPage} / {totalPages || 1}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={16} />
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
                                    {editingCustomer ? "Edit Profil Pelanggan" : "Tambah Pelanggan Baru"}
                                </h2>
                                <button
                                    onClick={() => setIsAddEditModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder="Contoh: John Doe"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">No. HP</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            placeholder="0812xxxx"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Segmen Pelanggan</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {SEGMENTS.map(seg => (
                                            <button
                                                key={seg}
                                                onClick={() => setFormData({ ...formData, segment: seg })}
                                                className={cn(
                                                    "px-3 py-2 text-xs font-medium rounded-lg border transition-all",
                                                    formData.segment === seg
                                                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500/50"
                                                        : "bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700"
                                                )}
                                            >
                                                {seg}
                                            </button>
                                        ))}
                                    </div>
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
                                    Simpan Pelanggan
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
                title="Hapus Data Pelanggan"
                message="Menghapus pelanggan akan menghilangkan riwayat profil mereka dari database ini. Data pesanan tidak akan terpengaruh."
                confirmText="Ya, Hapus"
                cancelText="Batal"
            />
        </DashboardWrapper>
    );
}
