"use client";

import { } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    BarChart2,
    ShoppingCart,
    Users,
    Settings,
    X,
    ChevronLeft,
    ChevronRight,
    Package,
    Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { UserSettings } from "@/lib/settingsData";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Analytics", href: "/analytics", icon: BarChart2 },
    { label: "Orders", href: "/orders", icon: ShoppingCart },
    { label: "Products", href: "/products", icon: Package },
    { label: "Customers", href: "/customers", icon: Users },
    { label: "User Mgmt", href: "/users", icon: Shield },
    { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    isMobile: boolean;
    isOpenMobile: boolean;
    closeMobile: () => void;
    onNavigate?: (href: string) => Promise<boolean>;
}

const SidebarContent = ({
    isCollapsed,
    isMobile,
    toggleCollapse,
    closeMobile,
    pathname,
    settings,
    isLoading,
    onNavigate
}: {
    isCollapsed: boolean,
    isMobile: boolean,
    toggleCollapse: () => void,
    closeMobile: () => void,
    pathname: string,
    settings: UserSettings,
    isLoading: boolean,
    onNavigate?: (href: string) => Promise<boolean>
}) => {
    const router = useRouter();

    const handleNavClick = async (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        if (pathname === href) {
            if (isMobile) closeMobile();
            return;
        }

        if (onNavigate) {
            const canNavigate = await onNavigate(href);
            if (!canNavigate) return;
        }

        router.push(href);
        if (isMobile) closeMobile();
    };

    return (
        <div className="flex h-full flex-col bg-slate-900 text-white shadow-xl dark:bg-slate-900 border-r border-slate-800">
            {/* Brand */}
            <div className={cn("flex items-center h-16 px-4", isCollapsed ? "justify-center" : "justify-between")}>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent truncate"
                    >
                        Analytix
                    </motion.div>
                )}
                {isCollapsed && <div className="text-xl font-bold text-indigo-500">A</div>}

                {!isMobile && (
                    <button
                        onClick={toggleCollapse}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                )}
                {isMobile && (
                    <button onClick={closeMobile} className="p-1 text-slate-400">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Nav Links */}
            <nav className="flex-1 space-y-2 py-4 px-3 overflow-y-auto custom-scrollbar">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <button
                            key={item.href}
                            onClick={(e) => handleNavClick(e, item.href)}
                            className={cn(
                                "relative flex w-full items-center rounded-lg px-3 py-2.5 transition-all duration-200 group text-left",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon size={22} className={cn("shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />

                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="ml-3 font-medium whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.span>
                            )}

                            {/* Tooltip for collapsed mode */}
                            {isCollapsed && !isMobile && (
                                <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 hidden rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white shadow-md group-hover:block border border-slate-700">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User / Footer */}
            <div className="p-4 border-t border-slate-800">
                <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
                    <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold ring-2 ring-slate-900 overflow-hidden shrink-0">
                        {isLoading ? (
                            <div className="w-full h-full bg-slate-700 animate-pulse" />
                        ) : settings.profile.avatar ? (
                            <img src={settings.profile.avatar} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            settings.profile.name.charAt(0)
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden space-y-1.5">
                            {isLoading ? (
                                <>
                                    <div className="h-3 w-20 bg-slate-700 animate-pulse rounded" />
                                    <div className="h-2 w-28 bg-slate-800 animate-pulse rounded" />
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-medium text-white truncate">{settings.profile.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{settings.profile.email}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export function Sidebar({
    isCollapsed,
    toggleCollapse,
    isMobile,
    isOpenMobile,
    closeMobile,
    onNavigate
}: SidebarProps) {
    const pathname = usePathname();
    const { settings, isLoading } = useDashboard();

    // Variants for desktop sidebar width
    const sidebarVariants = {
        expanded: { width: "16rem" },
        collapsed: { width: "5rem" },
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={isCollapsed ? "collapsed" : "expanded"}
                variants={sidebarVariants}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden md:block h-screen max-h-screen sticky top-0 z-40 bg-slate-900 border-r border-slate-800"
            >
                <SidebarContent
                    isCollapsed={isCollapsed}
                    isMobile={isMobile}
                    toggleCollapse={toggleCollapse}
                    closeMobile={closeMobile}
                    pathname={pathname}
                    settings={settings}
                    isLoading={isLoading}
                    onNavigate={onNavigate}
                />
            </motion.aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobile && isOpenMobile && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobile}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed inset-y-0 left-0 z-50 w-64 md:hidden bg-slate-900"
                        >
                            <SidebarContent
                                isCollapsed={isCollapsed}
                                isMobile={isMobile}
                                toggleCollapse={toggleCollapse}
                                closeMobile={closeMobile}
                                pathname={pathname}
                                settings={settings}
                                isLoading={isLoading}
                                onNavigate={onNavigate}
                            />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
