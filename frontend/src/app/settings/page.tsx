"use client";

import { DashboardWrapper } from "@/components/layout/DashboardWrapper";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Paintbrush, Building2, Bell, Shield,
    Save, Camera, Moon, Sun, Monitor, Laptop,
    Globe, Clock, DollarSign, Check, ChevronRight, Database
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useToast } from "@/components/ui/ToastContext";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { parseSettings } from "@/lib/settingsData";
import { seedDatabase } from "@/lib/seed";
import { UnsavedChangesModal } from "@/components/ui/UnsavedChangesModal";
import { useRef } from "react";

type TabType = "profile" | "appearance" | "business" | "notifications" | "database";

export default function SettingsPage() {
    const { settings, updateSettings, isLoading } = useDashboard();
    const { showToast } = useToast();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>("profile");
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const navResolverRef = useRef<((value: boolean) => void) | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local state for form to avoid excessive re-renders
    const [localSettings, setLocalSettings] = useState(settings);
    const initialSettingsRef = useRef(settings);

    // Deep compare to detect changes
    const hasUnsavedChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

    // Warn on browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "";
                return "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Sync local settings when context settings load - ONLY on first load or after save
    useEffect(() => {
        // Only overwrite local settings if:
        // 1. It's the initial load (updated_at mismatch)
        // 2. AND there are no unsaved changes (user isn't currently typing)
        // This prevents background syncs from wiping active user input.
        const isInitialLoad = !initialSettingsRef.current.updated_at && settings.updated_at;
        const versionChanged = settings.updated_at !== initialSettingsRef.current.updated_at;

        if (!isLoading && (isInitialLoad || (versionChanged && !hasUnsavedChanges))) {
            setLocalSettings(settings);
            initialSettingsRef.current = settings;

            if (settings.updated_at) {
                const date = new Date(settings.updated_at);
                setLastSaved(date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
            }
        }
    }, [settings, isLoading, hasUnsavedChanges]);

    // Force direct fetch from DB on mount (as requested: "langsung ngambil ke database")
    useEffect(() => {
        const fetchDirectly = async () => {
            if (!supabase) return;
            try {
                const { data, error } = await supabase.from('settings').select('*').single();
                if (data && !error) {
                    const parsed = parseSettings(data);
                    setLocalSettings(parsed);
                    if (parsed.updated_at) {
                        const date = new Date(parsed.updated_at);
                        setLastSaved(date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
                    }
                }
            } catch (err) {
                console.error("Direct fetch error:", err);
            }
        };
        fetchDirectly();
    }, []);

    // Live preview for compact mode
    useEffect(() => {
        if (localSettings.appearance.compactMode) {
            document.documentElement.classList.add('compact-mode');
        } else {
            document.documentElement.classList.remove('compact-mode');
        }

        // Cleanup if leaving page without saving
        return () => {
            if (!settings.appearance.compactMode) {
                document.documentElement.classList.remove('compact-mode');
            }
        };
    }, [localSettings.appearance.compactMode, settings.appearance.compactMode]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Simpan settings ke database
            const result = await updateSettings(localSettings);
            if (result && !result.error) {
                // 2. Sync data admin ke User Management table
                await syncAdminToUsers();

                showToast("Pengaturan berhasil disimpan", "success");
                setLastSaved(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
            } else {
                showToast("Gagal menyimpan pengaturan", "error");
            }
        } catch (err) {
            showToast("Gagal menyimpan pengaturan", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const syncAdminToUsers = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const response = await fetch(`${API_URL}/users/sync-admin`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: localSettings.profile.name,
                    email: localSettings.profile.email,
                    avatar: localSettings.profile.avatar,
                    oldEmail: settings.profile.email
                })
            });

            if (!response.ok) {
                console.error("Sync admin failed:", await response.text());
            } else {
                console.log("Admin profile synced to User Management successfully");
            }
        } catch (error) {
            console.error("Sync error:", error);
            // Don't throw - jangan gagalkan save settings jika sync gagal
        }
    };

    const compressImage = (base64: string, callback: (result: string) => void) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 200;
            const MAX_HEIGHT = 200;

            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height = height * (MAX_WIDTH / width);
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width = width * (MAX_HEIGHT / height);
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            // Kompres ke JPEG quality 0.7 untuk ukuran lebih kecil
            callback(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => {
            console.error("Failed to load image for compression");
            showToast("Gagal memproses gambar", "error");
        };
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (file) {
                if (file.size > 1024 * 1024) {
                    showToast("File terlalu besar! Maksimal ukuran foto adalah 1MB agar aplikasi tetap ringan.", "error");
                    return;
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;

                    // Kompres gambar untuk menghindari payload terlalu besar
                    compressImage(base64String, (compressed) => {
                        console.log("Image compressed successfully, updating state...");
                        setLocalSettings(prev => ({
                            ...prev,
                            profile: { ...prev.profile, avatar: compressed }
                        }));
                        showToast("Foto berhasil diupload", "success");
                    });
                };
                reader.onerror = () => {
                    showToast("Gagal membaca file", "error");
                };
                reader.readAsDataURL(file);
            }
        } catch (err) {
            console.error("Image upload error:", err);
            showToast("Terjadi kesalahan saat upload", "error");
        }
    };

    const tabs = [
        { id: "profile", label: "Profil Pengguna", icon: User },
        { id: "appearance", label: "Tampilan", icon: Paintbrush },
        { id: "business", label: "Informasi Bisnis", icon: Building2 },
        { id: "notifications", label: "Notifikasi", icon: Bell },
        { id: "database", label: "Database", icon: Database },
    ];

    if (isLoading) {
        return (
            <DashboardWrapper>
                <div className="animate-pulse space-y-8">
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-3 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
                        </div>
                        <div className="lg:col-span-9 h-[500px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
                    </div>
                </div>
            </DashboardWrapper>
        );
    }

    const handleNavigate = async (href: string) => {
        if (hasUnsavedChanges) {
            setShowUnsavedModal(true);
            return new Promise<boolean>((resolve) => {
                navResolverRef.current = resolve;
            });
        }
        return true;
    };

    const confirmNavigation = () => {
        setShowUnsavedModal(false);
        if (navResolverRef.current) {
            navResolverRef.current(true);
            navResolverRef.current = null;
        }
    };

    const cancelNavigation = () => {
        setShowUnsavedModal(false);
        if (navResolverRef.current) {
            navResolverRef.current(false);
            navResolverRef.current = null;
        }
    };

    return (
        <DashboardWrapper onNavigate={handleNavigate}>
            <UnsavedChangesModal
                isOpen={showUnsavedModal}
                onClose={cancelNavigation}
                onConfirm={confirmNavigation}
            />
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Pengaturan</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Kelola preferensi akun dan dashboard {localSettings?.profile?.storeName || "Toko"} Anda.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3">
                    <div className="sticky top-24 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium",
                                    activeTab === tab.id
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <tab.icon size={18} />
                                    <span>{tab.label}</span>
                                </div>
                                {activeTab === tab.id && <ChevronRight size={16} />}
                            </button>
                        ))}
                        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                            <div>
                                <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Keamanan</p>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-all">
                                    <Shield size={18} />
                                    <span>Keamanan & Sandi</span>
                                </button>
                            </div>

                            <div className="px-2 pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95",
                                        hasUnsavedChanges
                                            ? "bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                                    )}
                                >
                                    {isSaving ? (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            <span>Simpan Perubahan</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-center text-slate-500 mt-2">
                                    {isSaving ? "Menyimpan..." : (lastSaved ? `Terakhir disimpan: ${lastSaved}` : (isLoading ? "Menghubungkan..." : "Belum disimpan"))}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm min-h-[500px]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Perbarui detail {activeTab === "profile" ? "profil" : activeTab === "appearance" ? "tampilan" : activeTab === "business" ? "bisnis" : "notifikasi"} Anda di bawah ini.
                            </p>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 space-y-8">
                            {/* Profile Tab */}
                            {activeTab === "profile" && (
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 overflow-hidden">
                                                {localSettings.profile.avatar ? (
                                                    <img src={localSettings.profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    localSettings.profile.name.charAt(0)
                                                )}
                                            </div>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-transform"
                                            >
                                                <Camera size={14} />
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1 text-center sm:text-left">
                                            <h4 className="font-bold text-slate-900 dark:text-white">Foto Profil</h4>
                                            <p className="text-xs text-slate-500">JPG, GIF atau PNG. Maksimal 1MB.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                value={localSettings.profile.name}
                                                onChange={(e) => setLocalSettings({ ...localSettings, profile: { ...localSettings.profile, name: e.target.value } })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Alamat Email</label>
                                            <input
                                                type="email"
                                                value={localSettings.profile.email}
                                                onChange={(e) => setLocalSettings({ ...localSettings, profile: { ...localSettings.profile, email: e.target.value } })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Toko</label>
                                            <input
                                                type="text"
                                                value={localSettings.profile.storeName}
                                                onChange={(e) => setLocalSettings({ ...localSettings, profile: { ...localSettings.profile, storeName: e.target.value } })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">No. Telepon</label>
                                            <input
                                                type="text"
                                                value={localSettings.profile.phone}
                                                onChange={(e) => setLocalSettings({ ...localSettings, profile: { ...localSettings.profile, phone: e.target.value } })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">URL Foto Profil (Opsional)</label>
                                            <input
                                                type="text"
                                                placeholder="https://example.com/avatar.jpg"
                                                value={localSettings.profile.avatar || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Jika input adalah base64 manual yang sangat panjang, beri peringatan
                                                    if (value.startsWith('data:') && value.length > 1500000) {
                                                        showToast("Data gambar terlalu besar! Gunakan fitur upload atau URL link saja.", "error");
                                                        return;
                                                    }
                                                    setLocalSettings({ ...localSettings, profile: { ...localSettings.profile, avatar: value } });
                                                }}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "appearance" && (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tema Aplikasi</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {[
                                                { id: "light", label: "Terang", icon: Sun, desc: "Tampilan bersih & klasik" },
                                                { id: "dark", label: "Gelap", icon: Moon, desc: "Nyaman untuk mata" },
                                                { id: "system", label: "Sistem", icon: Laptop, desc: "Mengikuti OS Anda" },
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => {
                                                        setTheme(t.id);
                                                        setLocalSettings({ ...localSettings, appearance: { ...localSettings.appearance, theme: t.id as "light" | "dark" | "system" } });
                                                    }}
                                                    className={cn(
                                                        "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all group",
                                                        theme === t.id
                                                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20"
                                                            : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "p-3 rounded-xl transition-all",
                                                        theme === t.id ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                    )}>
                                                        <t.icon size={20} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{t.label}</p>
                                                        <p className="text-[10px] text-slate-500">{t.desc}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Mode Kompak</h4>
                                                <p className="text-xs text-slate-500">Gunakan padding lebih kecil untuk melihat data lebih banyak.</p>
                                            </div>
                                            <button
                                                onClick={() => setLocalSettings({ ...localSettings, appearance: { ...localSettings.appearance, compactMode: !localSettings.appearance.compactMode } })}
                                                className={cn(
                                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                                    localSettings.appearance.compactMode ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                                                )}
                                            >
                                                <span className={cn(
                                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                    localSettings.appearance.compactMode ? "translate-x-5" : "translate-x-0"
                                                )} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "business" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mata Uang</label>
                                            <div className="relative">
                                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <select
                                                    value={localSettings.business.currency}
                                                    onChange={(e) => setLocalSettings({ ...localSettings, business: { ...localSettings.business, currency: e.target.value } })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all text-sm"
                                                >
                                                    <option value="IDR">Rupiah (IDR)</option>
                                                    <option value="USD">US Dollar (USD)</option>
                                                    <option value="EUR">Euro (EUR)</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pajak %</label>
                                            <input
                                                type="number"
                                                value={localSettings.business.taxRate}
                                                onChange={(e) => setLocalSettings({ ...localSettings, business: { ...localSettings.business, taxRate: Number(e.target.value) } })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Zona Waktu</label>
                                            <div className="relative">
                                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <select
                                                    value={localSettings.business.timezone}
                                                    onChange={(e) => setLocalSettings({ ...localSettings, business: { ...localSettings.business, timezone: e.target.value } })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all text-sm"
                                                >
                                                    <option value="Asia/Jakarta">WIB (Jakarta)</option>
                                                    <option value="Asia/Makassar">WITA (Makassar)</option>
                                                    <option value="Asia/Jayapura">WIT (Jayapura)</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bahasa Dashboard</label>
                                            <div className="relative">
                                                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <select
                                                    value={localSettings.business.language}
                                                    onChange={(e) => setLocalSettings({ ...localSettings, business: { ...localSettings.business, language: e.target.value } })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all text-sm"
                                                >
                                                    <option value="id">Bahasa Indonesia</option>
                                                    <option value="en">English (US)</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Alamat Lengkap</label>
                                            <textarea
                                                rows={3}
                                                value={localSettings.business.address}
                                                onChange={(e) => setLocalSettings({ ...localSettings, business: { ...localSettings.business, address: e.target.value } })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "notifications" && (
                                <div className="space-y-6">
                                    {[
                                        { key: "orderUpdates", label: "Pembaruan Pesanan", desc: "Dapatkan info saat ada pesanan baru atau perubahan status." },
                                        { key: "customerActivity", label: "Aktivitas Pelanggan", desc: "Notifikasi saat pelanggan baru mendaftar atau memberikan ulasan." },
                                        { key: "marketingEmails", label: "Email Pemasaran", desc: "Terima info promo dan tips bisnis UMKM." },
                                        { key: "browserNotifications", label: "Notifikasi Browser", desc: "Tampilkan notifikasi desktop saat dashboard terbuka." },
                                    ].map((n) => (
                                        <div key={n.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="flex-1 mr-8">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.label}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{n.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const key = n.key as keyof typeof localSettings.notifications;
                                                    setLocalSettings({
                                                        ...localSettings,
                                                        notifications: {
                                                            ...localSettings.notifications,
                                                            [key]: !localSettings.notifications[key]
                                                        }
                                                    });
                                                }}
                                                className={cn(
                                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                                    (localSettings.notifications[n.key as keyof typeof localSettings.notifications]) ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                                                )}
                                            >
                                                <span className={cn(
                                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                    (localSettings.notifications[n.key as keyof typeof localSettings.notifications]) ? "translate-x-5" : "translate-x-0"
                                                )} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "database" && (
                                <div className="space-y-6">
                                    <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-500/30">
                                        <h4 className="text-lg font-bold text-indigo-900 dark:text-indigo-400 mb-2">Supabase Seeding</h4>
                                        <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-6">
                                            Gunakan fitur ini untuk mengisi database Supabase Anda dengan data awal (mock data) jika database masih kosong.
                                        </p>
                                        <button
                                            onClick={async () => {
                                                const ok = confirm("Apakah Anda yakin ingin melakukan seeding data? Data lama mungkin akan tertimpa.");
                                                if (ok) {
                                                    setIsSaving(true);
                                                    try {
                                                        await seedDatabase();
                                                        showToast("Database berhasil di-seed!", "success");
                                                    } catch (err) {
                                                        showToast("Gagal melakukan seeding", "error");
                                                    } finally {
                                                        setIsSaving(false);
                                                    }
                                                }
                                            }}
                                            disabled={isSaving}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                                        >
                                            {isSaving ? "Memproses..." : "Mulai Seeding Data"}
                                        </button>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Instruksi Setup</h4>
                                        <ol className="text-xs text-slate-500 space-y-2 list-decimal pl-4">
                                            <li>Hubungkan Supabase URL dan Anon Key di file <code>.env.local</code>.</li>
                                            <li>Jalankan SQL Schema yang telah disediakan di Supabase SQL Editor.</li>
                                            <li>Klik tombol &quot;Mulai Seeding Data&quot; di atas untuk mengisi data awal.</li>
                                        </ol>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

function ChevronDown({ size, className }: { size: number, className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>;
}
