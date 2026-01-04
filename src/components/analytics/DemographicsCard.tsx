"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAllLocationData, aggregateByIsland, type IslandAggregation } from "@/lib/locationData";

export function DemographicsCard() {
    const [islandData, setIslandData] = useState<IslandAggregation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const locationData = await fetchAllLocationData();
                const aggregated = aggregateByIsland(locationData);
                setIslandData(aggregated.slice(0, 6)); // Top 6 islands
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load island data", error);
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-full md:col-span-1 min-h-[400px] rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        >
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lokasi Pelanggan</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isLoading ? "Memuat data..." : "Pulau Pengunjung Terbanyak"}
                    </p>
                </div>
                <MapPin className="text-indigo-500" />
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-pulse text-slate-400 text-sm">Mengambil data wilayah...</div>
                    </div>
                ) : (
                    islandData.map((loc, i) => (
                        <div key={loc.island} className="group">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📍</span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{loc.island}</span>
                                </div>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{loc.users.toLocaleString()}</span>
                            </div>

                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${loc.percent}%` }}
                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                    className="h-full rounded-full bg-indigo-500"
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Link
                href="/analytics/locations"
                className="mt-8 block w-full text-center rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
                Lihat Laporan Lengkap
            </Link>
        </motion.div>
    );
}
