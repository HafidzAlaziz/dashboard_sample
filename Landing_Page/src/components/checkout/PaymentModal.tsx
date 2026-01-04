"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, CheckCircle2, ChevronRight, CreditCard,
    Smartphone, Landmark, ShieldCheck, Copy,
    Zap, AlertCircle, QrCode, ArrowLeft
} from "lucide-react";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    amount: number;
    onSuccess: () => void;
}

type Step = 'category' | 'method' | 'instruction' | 'processing' | 'success';
type Category = 'va' | 'qris' | 'card';

interface PaymentMethod {
    id: string;
    name: string;
    description?: string;
}

export function PaymentModal({ isOpen, onClose, orderId, amount, onSuccess }: PaymentModalProps) {
    const [step, setStep] = useState<Step>('category');
    const [category, setCategory] = useState<Category | null>(null);
    const [method, setMethod] = useState<PaymentMethod | null>(null);
    const [isCopying, setIsCopying] = useState(false);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStep('category');
            setCategory(null);
            setMethod(null);
        }
    }, [isOpen]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 2000);
    };

    const handlePay = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }, 2500);
    };

    const categories = [
        { id: 'va', name: 'Virtual Account', icon: <Landmark className="w-5 h-5" />, desc: 'BCA, Mandiri, BNI, BRI, dll' },
        { id: 'qris', name: 'QRIS & E-Wallet', icon: <QrCode className="w-5 h-5" />, desc: 'Gopay, OVO, Dana, ShopeePay' },
        { id: 'card', name: 'Kartu Kredit', icon: <CreditCard className="w-5 h-5" />, desc: 'Visa, Mastercard, JCB' },
    ];

    const methods: Record<Category, PaymentMethod[]> = {
        va: [
            { id: 'bca', name: 'BCA Virtual Account', description: 'Dicek otomatis' },
            { id: 'mandiri', name: 'Mandiri Bill Payment', description: 'Dicek otomatis' },
            { id: 'bni', name: 'BNI Virtual Account', description: 'Dicek otomatis' },
            { id: 'bri', name: 'BRI Virtual Account', description: 'Dicek otomatis' },
        ],
        qris: [
            { id: 'qris', name: 'QRIS (Gopay, OVO, LinkAja)', description: 'Scan QR pakai aplikasi e-wallet' },
            { id: 'shopeepay', name: 'ShopeePay', description: 'Bayar via aplikasi Shopee' },
            { id: 'dana', name: 'DANA', description: 'Bayar via aplikasi DANA' },
        ],
        card: [
            { id: 'visa', name: 'Visa / Mastercard', description: 'Kartu kredit atau debit online' },
        ]
    };

    const renderHeader = () => (
        <div className="px-6 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
            <div>
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Total Tagihan</h3>
                <p className="text-2xl font-black text-slate-900 dark:text-white">Rp {amount.toLocaleString('id-ID')}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400">
                <X size={24} />
            </button>
        </div>
    );

    const renderFooter = () => (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30">
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Secure Mock Payment Gateway</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-700"></span>
                <span className="text-indigo-600 dark:text-indigo-500">Demo System</span>
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#0a0a0c]/90 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white dark:bg-[#16161a] border border-gray-200 dark:border-slate-800 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl shadow-indigo-500/10 ring-1 ring-black/5 dark:ring-white/5"
            >
                {step !== 'processing' && step !== 'success' && renderHeader()}

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {step === 'category' && (
                            <motion.div
                                key="cat" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                                className="space-y-4"
                            >
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2 mb-2">Pilih Kategori Pembayaran</p>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setCategory(cat.id as Category); setStep('method'); }}
                                        className="w-full group flex items-center justify-between p-4 rounded-[24px] border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/40 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm dark:shadow-none">
                                                {cat.icon}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-slate-900 dark:text-white mb-0.5">{cat.name}</p>
                                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{cat.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-400 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {step === 'method' && category && (
                            <motion.div
                                key="method" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                                className="space-y-4"
                            >
                                <button onClick={() => setStep('category')} className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-4 hover:translate-x-[-4px] transition-transform">
                                    <ArrowLeft size={14} /> KEMBALI
                                </button>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2">Pilih Metode {category.toUpperCase()}</p>
                                <div className="space-y-3">
                                    {methods[category].map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => { setMethod(m); setStep('instruction'); }}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 rounded-2xl hover:border-indigo-200 dark:hover:border-slate-600 hover:bg-indigo-50 dark:hover:bg-slate-900 transition-all"
                                        >
                                            <div className="text-left">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{m.name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">{m.description}</p>
                                            </div>
                                            <div className="w-6 h-6 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-600">
                                                <ChevronRight size={14} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 'instruction' && method && (
                            <motion.div
                                key="inst" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                                className="space-y-6"
                            >
                                <button onClick={() => setStep('method')} className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-4 hover:translate-x-[-4px] transition-transform">
                                    <ArrowLeft size={14} /> KEMBALI
                                </button>

                                <div className="bg-gray-50 dark:bg-slate-900/80 p-6 rounded-[28px] border border-gray-100 dark:border-slate-800 space-y-4 text-center">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Instruksi Pembayaran</p>

                                    {category === 'va' && (
                                        <div className="space-y-4">
                                            <div className="py-4 px-6 bg-white dark:bg-slate-950 border border-indigo-500/20 rounded-2xl relative group shadow-sm dark:shadow-none">
                                                <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">Nomor Virtual Account</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-[0.1em]">8806 0812 3456 7890</p>
                                                <button
                                                    onClick={() => handleCopy('8806081234567890')}
                                                    className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all shadow-lg"
                                                >
                                                    {isCopying ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Silakan transfer via ATM, Mobile Banking, atau Internet Banking menggunakan nomor VA di atas.</p>
                                        </div>
                                    )}

                                    {category === 'qris' && (
                                        <div className="space-y-4">
                                            <div className="w-48 h-48 bg-white mx-auto rounded-3xl p-3 shadow-xl dark:shadow-[0_0_30px_rgba(255,255,255,0.05)] ring-1 dark:ring-8 ring-gray-100 dark:ring-white/5 border border-gray-100 dark:border-transparent">
                                                <img
                                                    src="/mock_qris_code.png"
                                                    alt="QRIS Code"
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        // Fallback to a placeholder if image not found
                                                        (e.target as any).src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MOCK_ORDER_" + orderId;
                                                    }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/5 mx-auto w-fit">
                                                <QrCode size={14} className="text-indigo-600 dark:text-indigo-400 transition-all group-hover:scale-110" />
                                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-200 uppercase tracking-widest tracking-tighter">Scan to Pay</span>
                                            </div>
                                        </div>
                                    )}

                                    {category === 'card' && (
                                        <div className="space-y-4 py-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center mx-auto mb-2">
                                                <CreditCard size={32} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Simulasi Kartu Kredit</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Klik tombol bayar di bawah untuk mensimulasikan otorisasi kartu kredit.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 pt-2">
                                    <button
                                        onClick={handlePay}
                                        className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-[28px] font-black text-lg transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        <Zap className="fill-current w-5 h-5" />
                                        <span>BAYAR SEKARANG</span>
                                    </button>
                                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                        <AlertCircle size={14} />
                                        <span>Pesanan kedaluwarsa dalam 24 jam</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'processing' && (
                            <motion.div
                                key="proc" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className="py-20 flex flex-col items-center text-center space-y-8"
                            >
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShieldCheck className="text-indigo-500 w-8 h-8 opacity-50" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Otorisasi Pembayaran...</h3>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.2em] animate-pulse">Mohon tunggu sebentar</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="succ" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className="py-20 flex flex-col items-center text-center space-y-8"
                            >
                                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                                        <CheckCircle2 size={56} />
                                    </motion.div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Pembayaran Berhasil!</h3>
                                        <p className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.2em]">Transaksi #{orderId.split('-').pop()}</p>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium px-4">Mengalihkan Anda kembali ke toko dalam beberapa saat...</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {step !== 'processing' && step !== 'success' && renderFooter()}
            </motion.div>
        </div>
    );
}
