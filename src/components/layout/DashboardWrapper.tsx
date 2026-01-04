"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useTheme } from "next-themes";

export function DashboardWrapper({ children, onNavigate }: { children: React.ReactNode, onNavigate?: (href: string) => Promise<boolean> }) {
    const { settings, isLoading } = useDashboard();
    const { setTheme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Track last synced values to avoid feedback loops with local previews
    const lastSyncedTheme = useRef<string | undefined>(undefined);
    const lastSyncedCompact = useRef<boolean | undefined>(undefined);

    // Sync theme from settings only when settings change (e.g. initial load or post-save)
    useEffect(() => {
        // ONLY sync if we have real settings (updated_at present) and not currently loading defaults
        if (!isLoading && settings.updated_at && settings.appearance.theme !== lastSyncedTheme.current) {
            setTheme(settings.appearance.theme);
            lastSyncedTheme.current = settings.appearance.theme;
        }
    }, [settings.appearance.theme, setTheme, isLoading, settings.updated_at]);

    // Global compact mode application
    useEffect(() => {
        if (!isLoading && settings.updated_at && settings.appearance.compactMode !== lastSyncedCompact.current) {
            if (settings.appearance.compactMode) {
                document.documentElement.classList.add('compact-mode');
            } else {
                document.documentElement.classList.remove('compact-mode');
            }
            lastSyncedCompact.current = settings.appearance.compactMode;
        }
    }, [settings.appearance.compactMode, isLoading, settings.updated_at]);

    // Prevent hydration styling mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                isMobile={typeof window !== "undefined" && window.innerWidth < 768}
                isOpenMobile={isMobileOpen}
                closeMobile={() => setIsMobileOpen(false)}
                onNavigate={onNavigate}
            />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden bg-background">
                <Header onMenuClick={() => setIsMobileOpen(true)} />

                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
                    <div className={cn(
                        "mx-auto max-w-7xl transition-all duration-300",
                        isCollapsed ? "max-w-[1600px]" : ""
                    )}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
