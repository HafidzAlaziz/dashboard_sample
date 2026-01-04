"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Smartphone, Laptop, Tablet } from "lucide-react";

const data = [
    { name: "HP / Tablet", value: 75, color: "#4f46e5", icon: Smartphone },
    { name: "Komputer / Laptop", value: 25, color: "#ec4899", icon: Laptop },
];

export function DeviceStats() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-full md:col-span-1 min-h-[400px] rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        >
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Perangkat Pelanggan</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Sumber Akses Toko</p>
            </div>

            <div className="relative h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <Smartphone className="mx-auto h-8 w-8 text-slate-400" />
                </div>
            </div>

            <div className="mt-6 space-y-4">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
                                <item.icon size={20} style={{ color: item.color }} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
                                <p className="text-xs text-slate-500">{item.value}% pelanggan</p>
                            </div>
                        </div>
                        <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${item.value}%`, backgroundColor: item.color }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
