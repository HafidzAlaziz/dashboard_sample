"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, UserPlus, AlertCircle, Eye, EyeOff, User } from "lucide-react";
import axios from "axios";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Client-side validation
        if (!name) {
            setError("Nama wajib diisi!");
            return;
        }

        if (!email) {
            setError("Email wajib diisi!");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Format email tidak valid!");
            return;
        }

        if (!password) {
            setError("Password wajib diisi!");
            return;
        }

        if (password.length < 6) {
            setError("Password minimal 6 karakter!");
            return;
        }

        if (password !== confirmPassword) {
            setError("Password tidak cocok!");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("http://localhost:5000/api/auth/register", {
                name,
                email,
                password
            });

            const { token, user } = response.data;

            // Store token and user data
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            // TODO: Trigger guest order migration here

            // Redirect to home
            router.push("/");

        } catch (err: any) {
            if (axios.isAxiosError(err) && err.response?.status === 400) {
                setError(err.response.data?.error || "Gagal membuat akun.");
            } else {
                console.error("Register failed", err);
                setError("Terjadi kesalahan pada sistem. Silakan coba lagi.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors group font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Beranda
                </Link>

                {/* Register Card */}
                <div className="bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/5 rounded-[40px] p-8 sm:p-10 shadow-2xl relative overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5 transition-all">

                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="mb-10 text-center relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 rotate-3">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Buat Akun Baru</h1>
                        <p className="text-slate-500 text-sm font-medium">Daftar untuk pengalaman belanja lebih baik</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-center gap-3 animate-in shake">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-red-600 dark:text-red-400 text-xs font-bold">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                            <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-3xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 font-medium outline-none"
                                    placeholder="Nama Anda"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-3xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 font-medium outline-none"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-14 pr-14 py-4 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-3xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 font-medium outline-none"
                                    placeholder="Minimal 6 karakter"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Konfirmasi Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="w-full pl-14 pr-14 py-4 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-3xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 font-medium outline-none"
                                    placeholder="Ketik ulang password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-[32px] font-black text-sm tracking-[.25em] transition-all transform active:scale-95 shadow-2xl shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    MENDAFTAR...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    DAFTAR SEKARANG
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm font-medium">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-black hover:underline">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
