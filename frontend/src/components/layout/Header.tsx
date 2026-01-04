"use client";

import { useState } from "react";
import { Bell, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeaderProps {
    onMenuClick: () => void;
}



export function Header({ onMenuClick }: HeaderProps) {
    const { theme, setTheme } = useTheme();

    const { isLoading, settings } = useDashboard();

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/70 px-4 md:px-6 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/70 transition-colors">

            {/* Left: Menu Trigger (Mobile) & Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    <Menu size={24} />
                </button>

                <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                        {settings?.profile?.storeName || "Toko Saya"}
                    </h1>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Panel Kendali Utama</span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 sm:gap-4">

                <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                </button>

                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
                >
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </div>

            {/* Loading Overlay for Global Filter Effect */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-x-0 top-16 h-1 z-20 bg-indigo-500/20"
                    >
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
