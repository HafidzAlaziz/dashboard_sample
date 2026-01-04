"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: any;
    subtext: string;
    delay?: number;
}

export function StatCard({ title, value, change, isPositive, icon: Icon, subtext, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay }}
            className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        >
            <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                    <Icon size={24} />
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                    isPositive ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" : "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
                )}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {change}
                </div>
            </div>

            <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
                <div className="mt-2 flex flex-col items-start gap-1">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{subtext}</span>
                </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500/10 to-transparent blur-2xl" />
        </motion.div>
    );
}
