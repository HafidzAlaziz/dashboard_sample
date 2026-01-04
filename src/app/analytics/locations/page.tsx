"use client";

import { DashboardWrapper } from "@/components/layout/DashboardWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowUpRight, ArrowDownRight, Search, Filter, ChevronDown, Check, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { fetchAllLocationData, type LocationItem } from "@/lib/locationData";

type ViewLevel = 'city' | 'province' | 'island';

export default function LocationsReportPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewLevel, setViewLevel] = useState<ViewLevel>('city');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Data State
    const [realLocationData, setRealLocationData] = useState<LocationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingProgress(50);
                const data = await fetchAllLocationData();
                setRealLocationData(data);
                setLoadingProgress(100);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch location data", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const aggregatedData = useMemo(() => {
        let data = [...realLocationData];

        // 1. Filter by Search first (on base data)
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(loc =>
                loc.city.toLowerCase().includes(lowerSearch) ||
                loc.province.toLowerCase().includes(lowerSearch) ||
                loc.island.toLowerCase().includes(lowerSearch)
            );
        }

        // 2. Aggregate
        if (viewLevel === 'city') {
            return data.slice(0, 100).map(item => ({
                id: item.id,
                name: item.city,
                subLabel: item.province,
                users: item.users,
                percent: item.percent,
                trend: item.trend,
                trendUp: item.trendUp
            }));
        } else if (viewLevel === 'province') {
            const grouped: Record<string, any> = {};
            data.forEach(item => {
                if (!grouped[item.province]) {
                    grouped[item.province] = {
                        name: item.province,
                        subLabel: item.island,
                        users: 0,
                        trendAccumulator: 0,
                        count: 0
                    };
                }
                grouped[item.province].users += item.users;
                grouped[item.province].trendAccumulator += parseFloat(item.trend);
                grouped[item.province].count += 1;
            });

            const totalUsers = Object.values(grouped).reduce((sum: number, item: any) => sum + item.users, 0);

            return Object.values(grouped).map((item, idx) => ({
                id: `prov-${idx}`,
                name: item.name,
                subLabel: item.subLabel,
                users: item.users,
                percent: totalUsers ? Math.round((item.users / totalUsers) * 100) : 0,
                trend: `${(item.trendAccumulator / item.count).toFixed(1)}%`,
                trendUp: (item.trendAccumulator / item.count) >= 0
            })).sort((a, b) => b.users - a.users);

        } else { // Island
            const grouped: Record<string, any> = {};
            data.forEach(item => {
                if (!grouped[item.island]) {
                    grouped[item.island] = {
                        name: item.island,
                        subLabel: "Indonesia",
                        users: 0,
                        trendAccumulator: 0,
                        count: 0
                    };
                }
                grouped[item.island].users += item.users;
                grouped[item.island].trendAccumulator += parseFloat(item.trend);
                grouped[item.island].count += 1;
            });

            const totalUsers = Object.values(grouped).reduce((sum: number, item: any) => sum + item.users, 0);

            return Object.values(grouped).map((item, idx) => ({
                id: `island-${idx}`,
                name: item.name,
                subLabel: item.subLabel,
                users: item.users,
                percent: totalUsers ? Math.round((item.users / totalUsers) * 100) : 0,
                trend: `${(item.trendAccumulator / item.count).toFixed(1)}%`,
                trendUp: (item.trendAccumulator / item.count) >= 0
            })).sort((a, b) => b.users - a.users);
        }
    }, [searchTerm, viewLevel, realLocationData]);

    const viewOptions: { value: ViewLevel; label: string }[] = [
        { value: 'island', label: 'Pulau' },
        { value: 'province', label: 'Provinsi' },
        { value: 'city', label: 'Kota' },
    ];

    const currentLabel = viewOptions.find(o => o.value === viewLevel)?.label;

    return (
        <DashboardWrapper>
            <div className="mb-8">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
                                <MapPin size={20} />
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Laporan Lokasi (Live Data)</h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">
                            Detail sebaran geografis pelanggan Anda berdasarkan {currentLabel}.
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                38 Provinsi
                            </span>
                        </p>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Filter size={18} className="text-slate-500 shrink-0" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {currentLabel}
                            </span>
                            <ChevronDown size={16} className={cn("text-slate-400 transition-transform shrink-0", isFilterOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 top-full mt-2 w-40 z-10 rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 focus:outline-none"
                                >
                                    <div className="py-1">
                                        {viewOptions.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => {
                                                    setViewLevel(opt.value);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={cn(
                                                    "flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors",
                                                    viewLevel === opt.value
                                                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                                                )}
                                            >
                                                {opt.label}
                                                {viewLevel === opt.value && <Check size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Table Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800 min-h-[400px]"
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                            <p className="text-sm font-medium mb-1">Mengambil data wilayah seluruh Indonesia...</p>
                            <p className="text-xs text-slate-400">{loadingProgress}% Selesai</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white capitalize">{currentLabel}</th>
                                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                                {viewLevel === 'city' ? 'Provinsi' : viewLevel === 'province' ? 'Pulau' : 'Negara'}
                                            </th>
                                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Total Pengunjung</th>
                                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Persentase</th>
                                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Avg Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        {aggregatedData.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.subLabel}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.users.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-full max-w-[100px] h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-500 rounded-full"
                                                                style={{ width: `${item.percent}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-500">{item.percent}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`flex items-center gap-1 ${item.trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                        {item.trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                        <span className="font-medium">{item.trend}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {aggregatedData.length === 0 && (
                                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                    Tidak ada data untuk "{searchTerm}"
                                </div>
                            )}
                            {viewLevel === 'city' && aggregatedData.length >= 100 && (
                                <div className="p-4 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/50">
                                    Menampilkan 100 kota teratas (dari {realLocationData.length} total kota)
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            </div>
        </DashboardWrapper>
    );
}
