"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
    { name: "Makanan", value: 4500000, color: "#4f46e5" }, // Indigo 600
    { name: "Minuman", value: 3200000, color: "#10b981" },    // Emerald 500
    { name: "Snack", value: 2100000, color: "#f59e0b" },       // Amber 500
    { name: "Lainnya", value: 1500000, color: "#64748b" },     // Slate 500
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                    <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                    <span className="font-medium text-slate-900 dark:text-white">{payload[0].name}</span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                    Rp {payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export function SalesDistributionChart() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col h-full min-h-[400px] col-span-full xl:col-span-1 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        >
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kategori Penjualan</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Berdasarkan Jenis Produk</p>
            </div>

            <div className="relative flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Central Label */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">11.3jt</p>
                    <p className="text-xs font-medium text-slate-500">Total</p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <div className="flex flex-col text-xs">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                            <span className="text-slate-500">{((item.value / 11300000) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
