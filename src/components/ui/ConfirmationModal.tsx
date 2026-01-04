"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Hapus",
    cancelText = "Batal",
    variant = "danger"
}: ConfirmationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                                variant === "danger" && "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
                                variant === "warning" && "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
                                variant === "info" && "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
                            )}>
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {title}
                                </h3>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    {message}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={cn(
                                    "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all active:scale-95",
                                    variant === "danger" && "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20",
                                    variant === "warning" && "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
                                    variant === "info" && "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20",
                                )}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
