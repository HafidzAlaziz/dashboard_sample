"use client";

import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";

import { useDashboard } from "@/components/dashboard/DashboardContext";
import Link from "next/link";

const getStatusColor = (status: string) => {
    switch (status) {
        case "Lunas": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
        case "Menunggu": return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
        case "Dikirim": return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
        case "Dibatalkan": return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400";
        default: return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
    }
};

export function OrdersTable() {
    const { orders } = useDashboard();

    // Get latest 5 orders
    const recentOrders = [...orders]
        .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
        .slice(0, 5);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-full xl:col-span-2 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pesanan Terbaru</h3>
                <Link href="/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    Lihat Semua
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-400">
                            <th className="px-6 py-4">ID Pesanan</th>
                            <th className="px-6 py-4">Pelanggan</th>
                            <th className="px-6 py-4">Produk</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {recentOrders.map((order, i) => (
                            <tr
                                key={order.id}
                                className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    {order.id}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                            {order.customer.charAt(0)}
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-300">{order.customer}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                    {order.products}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    Rp {order.amount.toLocaleString('id-ID')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
