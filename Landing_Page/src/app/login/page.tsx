"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError("Email wajib diisi!");
            return;
        }

        if (!password) {
            setError("Password wajib diisi!");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Using localhost:5000 directly as per plan. 
            // In production, this should be an env var.
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password
            });

            const { token, user } = response.data;

            // Store token if needed for future requests
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            if (user.role === "admin") {
                // Redirect to Admin Dashboard
                window.location.href = "http://localhost:3000";
            } else {
                // Redirect to Home
                router.push("/");
            }

        } catch (err: any) {
            // Handle expected auth errors (400/401) without cluttering console
            if (axios.isAxiosError(err) && (err.response?.status === 400 || err.response?.status === 401)) {
                setError(err.response.data?.error || "Email atau password salah.");
            } else {
                console.error("Login failed", err);
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

                {/* Login Card */}
                <div className="bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/5 rounded-[40px] p-8 sm:p-10 shadow-2xl relative overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5 transition-all">

                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="mb-10 text-center relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 rotate-3">
                            <LogIn className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Selamat Datang</h1>
                        <p className="text-slate-500 text-sm font-medium">Masuk untuk mengelola akun Anda</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-center gap-3 animate-in shake">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-red-600 dark:text-red-400 text-xs font-bold">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-3xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 font-medium outline-none"
                                    placeholder="nama@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-14 pr-12 py-4 bg-slate-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-3xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 font-medium outline-none"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-[32px] font-black text-sm tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-400 dark:hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    MASUK SEKARANG
                                    <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-600 font-medium">
                            Belum punya akun?{' '}
                            <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-bold transition-colors">
                                Daftar disini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
