"use client";

import { motion } from "framer-motion";
import { Hammer } from "lucide-react";
import { DashboardWrapper } from "@/components/layout/DashboardWrapper";

interface PlaceholderStateProps {
    title: string;
    description: string;
}

export function PlaceholderState({ title, description }: PlaceholderStateProps) {
    return (
        <DashboardWrapper>
            <div className="flex h-[80vh] w-full flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 rounded-full bg-slate-100 p-6 dark:bg-slate-800"
                >
                    <Hammer size={48} className="text-indigo-500" />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-2 text-2xl font-bold text-slate-900 dark:text-white"
                >
                    {title}
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-md text-slate-500 dark:text-slate-400"
                >
                    {description}
                </motion.p>
            </div>
        </DashboardWrapper>
    );
}
