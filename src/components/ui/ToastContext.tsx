"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium min-w-[300px]",
                                toast.type === "success" && "bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
                                toast.type === "error" && "bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-500/30 text-rose-700 dark:text-rose-400",
                                toast.type === "info" && "bg-white dark:bg-slate-900 border-blue-100 dark:border-blue-500/30 text-blue-700 dark:text-blue-400"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-lg",
                                toast.type === "success" && "bg-emerald-50 dark:bg-emerald-500/10",
                                toast.type === "error" && "bg-rose-50 dark:bg-rose-500/10",
                                toast.type === "info" && "bg-blue-50 dark:bg-blue-500/10"
                            )}>
                                {toast.type === "success" && <CheckCircle2 size={18} />}
                                {toast.type === "error" && <AlertCircle size={18} />}
                                {toast.type === "info" && <Info size={18} />}
                            </div>
                            <span className="flex-1">{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            >
                                <X size={16} className="text-slate-400" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
