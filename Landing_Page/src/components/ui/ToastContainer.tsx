"use client";

import { useToastStore } from "@/store/useToastStore";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        "pointer-events-auto flex items-center gap-3 min-w-[300px] p-4 rounded-xl shadow-lg border transition-all animate-in slide-in-from-right-full fade-in duration-300",
                        toast.type === "success" && "bg-white border-green-100 shadow-green-100/50",
                        toast.type === "error" && "bg-white border-red-100 shadow-red-100/50",
                        toast.type === "info" && "bg-white border-blue-100 shadow-blue-100/50"
                    )}
                >
                    {toast.type === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                    {toast.type === "info" && <Info className="w-5 h-5 text-blue-500" />}

                    <p className="text-sm font-medium text-gray-700 flex-1">{toast.message}</p>

                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
