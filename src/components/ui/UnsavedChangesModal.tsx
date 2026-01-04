"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnsavedChangesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function UnsavedChangesModal({ isOpen, onClose, onConfirm }: UnsavedChangesModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600 dark:text-amber-400">
                                    <AlertTriangle size={24} />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-2 mb-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Perubahan Belum Disimpan
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Anda memiliki beberapa perubahan pengaturan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman ini?
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                                >
                                    Tetap di Sini
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
                                >
                                    Tinggalkan Halaman
                                </button>
                            </div>
                        </div>

                        {/* Bottom Stripe */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-indigo-500 to-indigo-600" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
