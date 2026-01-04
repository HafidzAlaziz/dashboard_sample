"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { ChevronDown, Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const DATE_RANGES = [
    { value: "today", label: "Hari Ini" },
    { value: "7days", label: "7 Hari Terakhir" },
    { value: "30days", label: "30 Hari Terakhir" },
    { value: "90days", label: "3 Bulan Terakhir" },
];

const generateData = (range: string) => {
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    if (range === "7days") {
        return days.map(day => ({
            name: day,
            visitors: Math.floor(Math.random() * 5000) + 1000,
            pageviews: Math.floor(Math.random() * 8000) + 2000,
        }));
    }

    if (range === "30days") {
        return Array.from({ length: 15 }, (_, i) => ({
            name: `${i * 2 + 1}`,
            visitors: Math.floor(Math.random() * 6000) + 2000,
            pageviews: Math.floor(Math.random() * 9000) + 3000,
        }));
    }

    // Default / "90days" (mocked as monthly view or yearly trend)
    if (range === "90days") {
        return ["Okt", "Nov", "Des"].map(month => ({
            name: month,
            visitors: Math.floor(Math.random() * 7000) + 3000,
            pageviews: Math.floor(Math.random() * 10000) + 5000,
        }));
    }

    // Fallback or "today" logic
    return Array.from({ length: 12 }, (_, i) => ({
        name: `${(i * 2)}:00`,
        visitors: Math.floor(Math.random() * 1000) + 200,
        pageviews: Math.floor(Math.random() * 2000) + 500,
    }));
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <p className="mb-2 font-medium text-slate-900 dark:text-white">{label}</p>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        Pendapatan: <span className="text-slate-600 dark:text-slate-300">Rp {payload[0].value.toLocaleString('id-ID')}</span>
                    </p>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Pesanan: <span className="text-slate-600 dark:text-slate-300">{payload[1].value.toLocaleString('id-ID')}</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export function TrafficChart() {
    const { dateRange, setDateRange, refreshData, isLoading, stats } = useDashboard();
    const [data, setData] = useState(stats.orderTrend || []);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        // Since stats.orderTrend is managed by DashboardContext based on orders,
        // we just sync it here. In a more complex scenario, we'd fetch specific ranges.
        setData(stats.orderTrend || []);
    }, [stats.orderTrend]);

    const handleDateSelect = (value: any) => {
        setDateRange(value);
        setIsDropdownOpen(false);
        refreshData();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-full h-[400px] rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        >
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trend Data Trafik</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pengunjung Unik vs Tayangan Halaman</p>
                </div>

                {/* Date Filter Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
                    >
                        <Calendar size={14} className="text-slate-500" />
                        <span>{DATE_RANGES.find(r => r.value === dateRange)?.label}</span>
                        <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isDropdownOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 top-full mt-2 w-40 z-10 rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 focus:outline-none"
                            >
                                <div className="py-1">
                                    {DATE_RANGES.map((range) => (
                                        <button
                                            key={range.value}
                                            onClick={() => handleDateSelect(range.value)}
                                            className={cn(
                                                "flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors",
                                                dateRange === range.value
                                                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                                            )}
                                        >
                                            {range.label}
                                            {dateRange === range.value && <Check size={12} />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-slate-700" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            className="dark:text-slate-400"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Pendapatan"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                        <Area
                            type="monotone"
                            dataKey="orders"
                            name="Total Pesanan"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorOrders)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
