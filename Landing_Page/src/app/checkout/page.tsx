"use client";

import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { useSearchParams, useRouter } from "next/navigation";
import { getProductById, createOrder, getProvinces, getRegencies, getDistricts, getVillages, simulatePaymentSuccess } from "@/services/api";
import { Product } from "@/types";
import Link from "next/link";
import { PaymentModal } from "@/components/checkout/PaymentModal";
import { useCartStore } from "@/store/useCartStore";
import { ArrowLeft, CheckCircle, Car, Wallet, ChevronRight, ShieldCheck, MapPin, CreditCard as CreditCardIcon, ShoppingCart, Download } from "lucide-react";
import { useOrderStore } from "@/store/useOrderStore";

interface RegionItem {
    id: string;
    name: string;
}

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const productId = searchParams.get("productId");
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [apiFailed, setApiFailed] = useState(false);
    const [step, setStep] = useState(1); // 1: Alamat, 2: Pembayaran, 3: Konfirmasi

    // Payment Gateway States
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<any>(null);
    const receiptRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // States for Region Data
    const [provinces, setProvinces] = useState<RegionItem[]>([]);
    const [regencies, setRegencies] = useState<RegionItem[]>([]);
    const [districts, setDistricts] = useState<RegionItem[]>([]);
    const [villages, setVillages] = useState<RegionItem[]>([]);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        provinceId: "",
        provinceName: "",
        regencyId: "",
        regencyName: "",
        districtId: "",
        districtName: "",
        villageId: "",
        villageName: "",
        rt: "",
        rw: "",
        addressTail: "",
        weight: 1000, // Default 1kg (1000g)
        paymentMethod: "Gateway" // Default to Gateway for demo
    });

    const [shippingCost, setShippingCost] = useState<number | null>(null);
    const [citySearch, setCitySearch] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const { items: cartItems, totalWeight: getCartWeight, totalPrice: getCartTotal } = useCartStore();
    const [checkoutItems, setCheckoutItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (productId) {
                    // Buy Now Flow
                    const productData = await getProductById(productId);
                    setProduct(productData);
                    setCheckoutItems([{ ...productData, quantity: 1 }]);
                    setForm(prev => ({ ...prev, weight: productData.weight || 1000 }));
                } else if (cartItems.length > 0) {
                    // Cart Checkout Flow - Only selected items
                    const selectedItems = cartItems.filter(item => item.selected);
                    if (selectedItems.length === 0) {
                        router.push('/products');
                        return;
                    }
                    setCheckoutItems(selectedItems);
                    setForm(prev => ({ ...prev, weight: getCartWeight(true) }));
                }

                // Fetch Provinces
                const pData = await getProvinces();
                setProvinces(pData);

                // Set loading to false early so UI renders
                setLoading(false);

                // Fetch ALL Regencies for global search in the background
                // We do this AFTER setLoading(false) to avoid blocking the initial render
                const fetchRegenciesBackgroundTask = async () => {
                    try {
                        const allRegencies: any[] = [];
                        for (const p of pData) {
                            const rData = await getRegencies(p.id);
                            allRegencies.push(...rData.map((r: any) => ({ ...r, provinceName: p.name })));
                            // Update regencies incrementally or at the end
                            if (allRegencies.length % 50 === 0) setRegencies([...allRegencies]);
                        }
                        setRegencies(allRegencies as any);
                    } catch (e) {
                        console.error("Background regency fetch failed partially", e);
                    }
                };

                fetchRegenciesBackgroundTask();
            } catch (error) {
                console.error("Failed to fetch initial data", error);
                setApiFailed(true);
                setLoading(false);
                if (productId === '1') setProduct({ id: "1", name: "Kopi Arabika Gayo", category: "Minuman", price: 75000, stock: 50, status: "Available", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop", weight: 500 });
            }
        };

        fetchInitialData();
    }, [productId, cartItems]);

    // Handle Region Changes
    const handleProvinceChange = async (id: string, name: string) => {
        setForm(prev => ({
            ...prev,
            provinceId: id, provinceName: name,
            regencyId: "", regencyName: "",
            districtId: "", districtName: "",
            villageId: "", villageName: ""
        }));
        setRegencies([]);
        setDistricts([]);
        setVillages([]);

        try {
            const data = await getRegencies(id);
            setRegencies(data);
        } catch (error) {
            console.error("Failed to fetch regencies", error);
            setApiFailed(true);
        }
    };

    const handleRegencyChange = async (id: string, name: string) => {
        setForm(prev => ({
            ...prev,
            regencyId: id, regencyName: name,
            districtId: "", districtName: "",
            villageId: "", villageName: ""
        }));
        setDistricts([]);
        setVillages([]);

        try {
            const data = await getDistricts(id);
            setDistricts(data);
        } catch (error) {
            console.error("Failed to fetch districts", error);
            setApiFailed(true);
        }
    };

    const handleDistrictChange = async (id: string, name: string) => {
        setForm(prev => ({
            ...prev,
            districtId: id, districtName: name,
            villageId: "", villageName: ""
        }));
        setVillages([]);

        try {
            const data = await getVillages(id);
            setVillages(data);
        } catch (error) {
            console.error("Failed to fetch villages", error);
            setApiFailed(true);
        }
    };

    // Global Search Change
    const handleGlobalRegencySelect = async (regency: any) => {
        const province = provinces.find(p => p.name === regency.provinceName);
        setForm(prev => ({
            ...prev,
            provinceId: province?.id || "",
            provinceName: regency.provinceName,
            regencyId: regency.id,
            regencyName: regency.name,
            districtId: "", districtName: "",
            villageId: "", villageName: ""
        }));
        setIsDropdownOpen(false);
        setCitySearch("");
        setDistricts([]);
        setVillages([]);

        // Fetch districts for this regency immediately
        try {
            const data = await getDistricts(regency.id);
            setDistricts(data);
        } catch (error) {
            console.error("Failed to fetch districts", error);
        }
    };

    const calculateOngkir = () => {
        if (!form.regencyName) {
            alert("Silakan pilih kota tujuan terlebih dahulu.");
            return;
        }

        const regencyNm = form.regencyName.toUpperCase();
        const provinceNm = form.provinceName.toUpperCase();
        const weightKg = Math.ceil(form.weight / 1000); // Minimal 1kg

        let baseRate = 50000;
        if (regencyNm.includes("KOTA BOGOR")) baseRate = 15000;
        else if (regencyNm.includes("KABUPATEN BOGOR")) baseRate = 20000;
        else if (regencyNm.includes("DEPOK") || regencyNm.includes("JAKARTA") || regencyNm.includes("BEKASI") || regencyNm.includes("TANGERANG")) baseRate = 25000;
        else if (provinceNm.includes("JAWA BARAT") || provinceNm.includes("BANTEN")) baseRate = 35000;

        setShippingCost(baseRate * weightKg);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Step 1 -> 2
        if (step === 1) {
            // Validation check
            const errors: string[] = [];

            if (!form.name) {
                errors.push("name");
            } else if (!/^[a-zA-Z\s]+$/.test(form.name)) {
                errors.push("invalid_name");
            }

            if (!form.phone) {
                errors.push("phone");
            } else if (!/^[0-9]+$/.test(form.phone)) {
                errors.push("invalid_phone_format");
            } else if (form.phone.length < 10 || form.phone.length > 15) {
                errors.push("invalid_phone_length");
            }

            if (!form.regencyId) errors.push("regency");
            if (!form.districtId) errors.push("district");
            if (!form.villageId) errors.push("village");

            if (!form.rt) {
                errors.push("rt");
            } else if (!/^\d+$/.test(form.rt)) {
                errors.push("invalid_rt_format");
            }

            if (!form.rw) {
                errors.push("rw");
            } else if (!/^\d+$/.test(form.rw)) {
                errors.push("invalid_rw_format");
            }

            if (!form.addressTail) errors.push("address");
            if (shippingCost === null) errors.push("shipping");

            if (errors.length > 0) {
                setValidationErrors(errors);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            setValidationErrors([]);
            setStep(2);
            window.scrollTo(0, 0);
            return;
        }

        // Step 2 -> 3
        if (step === 2) {
            setStep(3);
            window.scrollTo(0, 0);
            return;
        }

        // Final Step (Create Order)
        if (step === 3) {
            setSubmitting(true);
            try {
                const fullAddress = `${form.villageName}, ${form.districtName}, ${form.regencyName}, ${form.provinceName}, RT ${form.rt}/RW ${form.rw}. Patokan: ${form.addressTail}`;
                const totalAmount = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (shippingCost || 0) + 2000;

                const order = await createOrder({
                    customer: `${form.name} (${form.phone})`,
                    products: JSON.stringify(checkoutItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    }))),
                    amount: totalAmount,
                    payment_method: `${form.paymentMethod} | Alamat: ${fullAddress} | Email: ${form.email || 'N/A'} | Berat: ${form.weight}g`
                });

                if (form.paymentMethod === 'Gateway') {
                    setCurrentOrder(order);
                    setIsPaymentModalOpen(true);
                } else {
                    setCurrentOrder(order);
                    // Set Global Order State (COD)
                    useOrderStore.getState().addOrder({
                        id: order.id,
                        status: "Sedang Dikemas",
                        eta: "3-5 Hari",
                        timestamp: Date.now(),
                        amount: order.amount,
                        items: checkoutItems.map(item => ({
                            id: item.id,
                            name: item.name,
                            image: item.image,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    });
                    setOrderSuccess(true);
                    if (!productId) useCartStore.getState().clearCart();
                }
            } catch (error) {
                console.error("Failed to create order", error);
                alert("Gagal membuat pesanan. Silakan coba lagi.");
            } finally {
                setSubmitting(false);
            }
        }
    };

    const handlePaymentSuccess = async () => {
        try {
            if (currentOrder?.id) {
                await simulatePaymentSuccess(currentOrder.id);
                // Set Global Order State (Online)
                useOrderStore.getState().addOrder({
                    id: currentOrder.id,
                    status: "Sedang Dikemas",
                    eta: "2-3 Hari",
                    timestamp: Date.now(),
                    amount: currentOrder.amount,
                    items: checkoutItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        image: item.image,
                        quantity: item.quantity,
                        price: item.price
                    }))
                });
                setIsPaymentModalOpen(false);
                setOrderSuccess(true);
            }
        } catch (error) {
            console.error("Failed to process mock payment success", error);
            alert("Berhasil bayar tapi gagal update status. Silakan hubungi admin.");
            setIsPaymentModalOpen(false);
            setOrderSuccess(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0c] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Menyiapkan Checkout...</p>
            </div>
        );
    }

    if (orderSuccess) {
        const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const adminFee = 2000;
        const total = subtotal + (shippingCost || 0) + adminFee;

        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0c] py-12 px-4 flex flex-col items-center">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body { background: white !important; color: black !important; }
                        .no-print { display: none !important; }
                        .print-receipt { 
                            box-shadow: none !important; 
                            border: 1px solid #eee !important;
                            background: white !important;
                            color: black !important;
                            width: 100% !important;
                            max-width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .print-receipt * { color: black !important; }
                    }
                ` }} />

                {/* Back Button - No Print */}
                <div className="w-full max-w-2xl mb-8 no-print flex justify-start animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link href="/products" className="inline-flex items-center text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Produk
                    </Link>
                </div>

                {/* Success Header */}
                <div className="no-print text-center mb-12 animate-in fade-in zoom-in duration-700">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full scale-150 animate-pulse"></div>
                        <div className="relative w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center shadow-2xl shadow-emerald-500/40 rotate-12">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">Pesanan Diterima!</h1>
                    <p className="text-slate-500 font-medium">Terima kasih atas kepercayaan Anda berbelanja di UMKM Store.</p>
                </div>

                {/* Premium Receipt Card */}
                <div ref={receiptRef} className="print-receipt w-full max-w-2xl bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/5 rounded-[48px] shadow-3xl overflow-hidden animate-in slide-in-from-bottom-8 duration-1000">
                    {/* Receipt Decor Line */}
                    <div className="h-2 w-full bg-gradient-to-r from-indigo-600 via-emerald-500 to-indigo-600"></div>

                    <div className="p-8 sm:p-12 space-y-10">
                        {/* Header Info */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-10 border-b border-gray-100 dark:border-white/[0.05]">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Invoice / Struk</h3>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-black rounded-lg tracking-widest uppercase">
                                        ID: {currentOrder?.id || '---'}
                                    </span>
                                    <span className="w-1 h-1 bg-slate-400 dark:bg-slate-700 rounded-full"></span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em] mb-1">Status</p>
                                <span className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 text-[10px] font-black rounded-full uppercase tracking-widest">
                                    Berhasil Dibayar
                                </span>
                            </div>
                        </div>

                        {/* Customer & Shipping Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <MapPin className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Pengiriman</h4>
                                </div>
                                <div className="pl-6 border-l-2 border-indigo-500/20">
                                    <p className="text-sm font-black text-slate-900 dark:text-white mb-2">{form.name}</p>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {form.villageName}, {form.districtName}<br />
                                        {form.regencyName}, {form.provinceName}<br />
                                        RT {form.rt} / RW {form.rw}<br />
                                        <span className="text-[10px] text-slate-500 dark:text-slate-600 italic">Ptk: {form.addressTail}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <CreditCardIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Metode Pembayaran</h4>
                                </div>
                                <div className="pl-6 border-l-2 border-emerald-500/20">
                                    <p className="text-sm font-black text-slate-900 dark:text-white mb-1">{form.paymentMethod === 'Gateway' ? 'Bayar Langsung (Online)' : 'Bayar di Tempat (COD)'}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Kontak: {form.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="pt-10 border-t border-gray-100 dark:border-white/[0.05]">
                            <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em] mb-6">Ringkasan Produk</h4>
                            <div className="space-y-4">
                                {checkoutItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center group">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5">
                                                <img src={item.image} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.name}</p>
                                                <p className="text-[10px] font-black text-slate-500 dark:text-slate-600">QTY: {item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="pt-10 border-t border-gray-100 dark:border-white/[0.05] space-y-4 bg-gray-50 dark:bg-white/[0.01] -mx-8 sm:-mx-12 px-8 sm:px-12 py-10">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm font-medium">Subtotal</span>
                                <span className="text-slate-900 dark:text-white font-bold text-sm">Rp {subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm font-medium">Ongkos Kirim</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">Rp {(shippingCost || 0).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm font-medium">Biaya Admin (PPN 0%)</span>
                                <span className="text-slate-900 dark:text-white font-bold text-sm">Rp {adminFee.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-white/[0.05]">
                                <span className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-widest">Total Bayar</span>
                                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm dark:drop-shadow-2xl">
                                    Rp {total.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        {/* Footer Receipt */}
                        <div className="text-center space-y-2 pb-2">
                            <p className="text-[9px] font-black text-slate-500 dark:text-slate-700 uppercase tracking-[0.3em]">Terima Kasih Telah Berbelanja</p>
                            <p className="text-[8px] text-slate-400 dark:text-slate-800 font-medium">UMKM Digital Store - Empowering Local Business</p>
                        </div>
                    </div>
                </div>

                {/* Post-Receipt Actions */}
                <div className="no-print mt-12 flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
                    <button
                        onClick={async () => {
                            if (!receiptRef.current) return;
                            setIsDownloading(true);
                            try {
                                const canvas = await html2canvas(receiptRef.current, {
                                    scale: 2,
                                    backgroundColor: null, // Transparent to respect CSS, or detect theme.
                                    // Better to force dark bg just for image capturing if that looks better, 
                                    // OR let it be the current bg of the element.
                                    // Let's use #16161a for consistent "Receipt Look" in image, OR just use current DOM style.
                                    // User liked the "Receipt" look. Let's stick to the dark stylish receipt for the IMAGE if possible,
                                    // OR adapt to what is shown.
                                    // The receiptRef element now has `bg-white dark:bg-[#16161a]`.
                                    // html2canvas should capture that.
                                    useCORS: true,
                                    logging: false
                                });
                                const image = canvas.toDataURL("image/png");
                                const link = document.createElement("a");
                                link.href = image;
                                link.download = `struk-pembelian-${currentOrder?.id || Date.now()}.png`;
                                link.click();
                            } catch (error) {
                                console.error("Download failed", error);
                                alert("Gagal mengunduh struk.");
                            } finally {
                                setIsDownloading(false);
                            }
                        }}
                        disabled={isDownloading}
                        className="flex-1 px-8 py-5 border border-indigo-600/20 dark:border-white/10 hover:border-emerald-500/50 text-indigo-600 dark:text-white rounded-[24px] font-black text-xs tracking-widest hover:bg-indigo-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <div className="w-5 h-5 border-2 border-indigo-600/30 dark:border-white/30 border-t-indigo-600 dark:border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Download className="w-5 h-5 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                        )}
                        {isDownloading ? 'MENGUNDUH...' : 'DOWNLOAD STRUK'}
                    </button>
                    <Link
                        href="/products"
                        className="flex-1 px-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-[24px] font-black text-xs tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all text-center shadow-xl active:scale-95"
                    >
                        BELANJA LAGI
                    </Link>
                </div>
            </div>
        );
    }

    if (!productId && cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0c] flex flex-col items-center justify-center p-6 text-center">
                <ShoppingCart className="w-16 h-16 text-slate-300 dark:text-slate-800 mb-6" />
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Keranjang Kosong</h1>
                <p className="text-slate-500 mb-8">Silakan pilih produk terlebih dahulu.</p>
                <Link href="/products" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs tracking-widest">
                    LIHAT PRODUK
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-white">
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Back Button */}
                <Link href={productId ? `/products/${productId}` : '/products'} className="inline-flex items-center text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-12 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Kembali
                </Link>

                {/* Progress Indicator */}
                <div className="flex items-center justify-between mb-16 max-w-2xl mx-auto relative px-4">
                    <div className="absolute top-6 left-0 w-full h-[2px] bg-gray-200 dark:bg-white/5 -translate-y-1/2 z-0"></div>
                    <div className={`absolute top-6 left-0 h-[2px] bg-gradient-to-r from-indigo-500 to-emerald-500 -translate-y-1/2 z-0 transition-all duration-500`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>

                    {[
                        { s: 1, label: "Alamat", icon: MapPin },
                        { s: 2, label: "Bayar", icon: CreditCardIcon },
                        { s: 3, label: "Konfirmasi", icon: ShieldCheck }
                    ].map((item) => (
                        <div key={item.s} className="relative z-10 flex flex-col items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border shadow-2xl ${step >= item.s ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-indigo-500/20' : 'bg-white dark:bg-[#16161a] border-gray-200 dark:border-white/5 text-slate-400 dark:text-slate-600'}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] uppercase font-black tracking-[0.2em] transition-colors ${step >= item.s ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content (Steps) */}
                    <div className="lg:col-span-7">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* STEP 1: ALAMAT PENGIRIMAN */}
                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-1">
                                        <h2 className="text-3xl font-black mb-2 tracking-tight">Alamat Pengiriman</h2>
                                        <p className="text-slate-500 text-sm font-medium">Lengkapi detail lokasi pengiriman produk Anda.</p>
                                        {validationErrors.length > 0 && (
                                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                                                <p className="text-red-400 text-sm font-bold flex items-center gap-2">
                                                    <span className="text-lg">⚠️</span>
                                                    Mohon lengkapi semua data yang ditandai merah di bawah ini
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                            <input type="text"
                                                className={`w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border rounded-3xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 font-medium ${(validationErrors.includes("name") || validationErrors.includes("invalid_name")) ? "border-red-500/50" : "border-gray-200 dark:border-white/5"
                                                    }`}
                                                placeholder="Nama Anda"
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            />
                                            {validationErrors.includes("name") && (
                                                <p className="text-red-400 text-xs font-bold ml-1">⚠️ Nama wajib diisi</p>
                                            )}
                                            {validationErrors.includes("invalid_name") && (
                                                <p className="text-red-400 text-xs font-bold ml-1">⚠️ Nama hanya boleh berisi huruf</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                                            <input type="tel"
                                                className={`w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border rounded-3xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 font-medium ${(validationErrors.includes("phone") || validationErrors.includes("invalid_phone_format") || validationErrors.includes("invalid_phone_length")) ? "border-red-500/50" : "border-gray-200 dark:border-white/5"
                                                    }`}
                                                placeholder="08xxx"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            />
                                            {validationErrors.includes("phone") && (
                                                <p className="text-red-400 text-xs font-bold ml-1">⚠️ Nomor WhatsApp wajib diisi</p>
                                            )}
                                            {validationErrors.includes("invalid_phone_format") && (
                                                <p className="text-red-400 text-xs font-bold ml-1">⚠️ Nomor WhatsApp hanya boleh berisi angka</p>
                                            )}
                                            {validationErrors.includes("invalid_phone_length") && (
                                                <p className="text-red-400 text-xs font-bold ml-1">⚠️ Nomor WhatsApp minimal 10-15 angka</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ongkir Logic Container */}
                                    <div className="p-8 bg-indigo-50 dark:bg-indigo-600/5 border border-indigo-200 dark:border-indigo-500/10 rounded-[40px] space-y-6">
                                        <div className="space-y-2 relative">
                                            <label className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest ml-1">Kota / Kabupaten</label>
                                            <div
                                                className={`w-full px-6 py-4 bg-white dark:bg-[#16161a] border rounded-3xl flex justify-between items-center cursor-pointer hover:border-indigo-500/30 transition-all shadow-sm dark:shadow-inner ${validationErrors.includes("regency") ? "border-red-500/50" : "border-gray-200 dark:border-white/5"
                                                    }`}
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            >
                                                <span className={form.regencyName ? "text-slate-900 dark:text-white font-bold" : "text-slate-400 dark:text-slate-600 font-medium"}>{form.regencyName || "Pilih Kota / Kabupaten..."}</span>
                                                <ChevronRight className={`w-5 h-5 transition-transform text-slate-400 dark:text-slate-500 ${isDropdownOpen ? 'rotate-90 text-indigo-500' : ''}`} />
                                            </div>
                                            {validationErrors.includes("regency") && (
                                                <p className="text-red-400 text-xs font-bold ml-1">⚠️ Kota wajib dipilih</p>
                                            )}

                                            {isDropdownOpen && (
                                                <div className="absolute z-50 mt-4 w-full bg-white dark:bg-[#16161a] border border-gray-100 dark:border-white/5 rounded-[32px] shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 animate-in zoom-in-95 duration-200">
                                                    <div className="p-4 border-b border-gray-100 dark:border-white/5 sticky top-0 bg-white/90 dark:bg-[#16161a]/90 backdrop-blur-xl">
                                                        <input type="text" autoFocus placeholder="Cari kota..." className="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-2xl focus:border-indigo-500/50 text-slate-900 dark:text-white text-sm outline-none" value={citySearch} onChange={(e) => setCitySearch(e.target.value)} />
                                                    </div>
                                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                                        {(regencies as any[]).filter(r => r.name.toLowerCase().includes(citySearch.toLowerCase())).length > 0 ? (
                                                            (regencies as any[]).filter(r => r.name.toLowerCase().includes(citySearch.toLowerCase())).slice(0, 50).map(r => (
                                                                <button key={r.id} type="button" className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-indigo-600/10 transition-colors border-b border-gray-50 dark:border-white/[0.02] last:border-none group" onClick={() => handleGlobalRegencySelect(r)}>
                                                                    <div className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{r.name}</div>
                                                                    <div className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mt-1">{r.provinceName}</div>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="p-8 text-center text-slate-500 dark:text-slate-600 text-sm font-medium italic">Kota tidak ditemukan</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={calculateOngkir}
                                            disabled={!form.regencyId}
                                            className={`w-full py-5 rounded-3xl font-black text-sm tracking-widest transition-all shadow-xl active:scale-[0.98] ${!form.regencyId
                                                ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
                                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                                                }`}
                                            title={!form.regencyId ? "Pilih kota terlebih dahulu" : ""}
                                        >
                                            HITUNG ONGKOS KIRIM
                                        </button>
                                        {!form.regencyId && (
                                            <p className="text-center text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse mt-2">
                                                Pilih kota untuk menghitung ongkir
                                            </p>
                                        )}

                                        {shippingCost !== null && (
                                            <div className="bg-indigo-600/10 border border-indigo-600/20 p-5 rounded-3xl flex justify-between items-center animate-in slide-in-from-left duration-300">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Estimasi Pengiriman</span>
                                                    <span className="text-slate-900 dark:text-white font-bold text-sm">JNE REGULER (2-3 Hari)</span>
                                                </div>
                                                <span className="text-indigo-600 dark:text-indigo-400 font-black text-xl">Rp {shippingCost.toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Address Details */}
                                    <div className="space-y-4 pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kecamatan</label>
                                                <select disabled={!form.regencyId}
                                                    className={`w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border rounded-3xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed appearance-none font-medium ${validationErrors.includes("district") ? "border-red-500/50" : "border-gray-200 dark:border-white/5"
                                                        }`}
                                                    value={form.districtId}
                                                    onChange={(e) => handleDistrictChange(e.target.value, e.target.options[e.target.selectedIndex].text)}
                                                >
                                                    <option value="" className="bg-white dark:bg-[#0a0a0c]">Pilih Kecamatan</option>
                                                    {districts.map(d => <option key={d.id} value={d.id} className="bg-white dark:bg-[#0a0a0c]">{d.name}</option>)}
                                                </select>
                                                {validationErrors.includes("district") && (
                                                    <p className="text-red-400 text-xs font-bold ml-1">⚠️ Kecamatan wajib dipilih</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kelurahan</label>
                                                <select disabled={!form.districtId}
                                                    className={`w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border rounded-3xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed appearance-none font-medium ${validationErrors.includes("village") ? "border-red-500/50" : "border-gray-200 dark:border-white/5"
                                                        }`}
                                                    value={form.villageId}
                                                    onChange={(e) => setForm({ ...form, villageId: e.target.value, villageName: e.target.options[e.target.selectedIndex].text })}
                                                >
                                                    <option value="" className="bg-white dark:bg-[#0a0a0c]">Pilih Kelurahan</option>
                                                    {villages.map(v => <option key={v.id} value={v.id} className="bg-white dark:bg-[#0a0a0c]">{v.name}</option>)}
                                                </select>
                                                {validationErrors.includes("village") && (
                                                    <p className="text-red-400 text-xs font-bold ml-1">⚠️ Kelurahan wajib dipilih</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <input placeholder="RT (001)"
                                                    type="tel"
                                                    maxLength={3}
                                                    className={`w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border rounded-3xl focus:border-indigo-500/50 text-slate-900 dark:text-white font-medium ${validationErrors.includes("rt") ? "border-red-500/50" : "border-gray-200 dark:border-white/5"
                                                        }`}
                                                    value={form.rt}
                                                    onChange={(e) => setForm({ ...form, rt: e.target.value })}
                                                />
                                                {validationErrors.includes("rt") && (
                                                    <p className="text-red-400 text-xs font-bold ml-1">⚠️ RT wajib diisi</p>
                                                )}
                                                {validationErrors.includes("invalid_rt_format") && (
                                                    <p className="text-red-400 text-xs font-bold ml-1">⚠️ RT harus berupa angka</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <input placeholder="RW (010)"
                                                    type="tel"
                                                    maxLength={3}
                                                    className={`w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border rounded-3xl focus:border-indigo-500/50 text-slate-900 dark:text-white font-medium ${validationErrors.includes("rw") ? "border-red-500/50" : "border-gray-200 dark:border-white/5"
                                                        }`}
                                                    value={form.rw}
                                                    onChange={(e) => setForm({ ...form, rw: e.target.value })}
                                                />
                                                {validationErrors.includes("rw") && (
                                                    <p className="text-red-400 text-xs font-bold ml-1">⚠️ RW wajib diisi</p>
                                                )}
                                                {validationErrors.includes("invalid_rw_format") && (
                                                    <p className="text-red-400 text-xs font-bold ml-1">⚠️ RW harus berupa angka</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <textarea rows={3}
                                                placeholder="Detail Jalan / Patokan / No. Rumah"
                                                className={`w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border rounded-3xl focus:border-indigo-500/50 text-slate-900 dark:text-white resize-none font-medium ${validationErrors.includes("address") ? "border-red-500/50" : "border-gray-200 dark:border-white/5"
                                                    }`}
                                                value={form.addressTail}
                                                onChange={(e) => setForm({ ...form, addressTail: e.target.value })}
                                            />
                                            {validationErrors.includes("address") && (
                                                <p className="text-red-400 text-xs font-bold ml-1">⚠️ Detail alamat wajib diisi</p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className={`w-full py-6 rounded-[32px] font-black text-sm tracking-[.25em] transition-all transform active:scale-95 shadow-2xl ${shippingCost === null
                                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
                                            : "bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white"
                                            }`}
                                        title={shippingCost === null ? "Hitung ongkos kirim terlebih dahulu" : ""}
                                    >
                                        LANJUT KE PEMBAYARAN
                                    </button>
                                    {shippingCost === null && (
                                        <p className="text-center text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                                            Hitung ongkos kirim untuk melanjutkan pembayaran
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* STEP 2: METODE PEMBAYARAN */}
                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-1">
                                        <h2 className="text-3xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">Metode Pembayaran</h2>
                                        <p className="text-slate-500 text-sm font-medium">Pilih bagaimana Anda ingin menyelesaikan pesanan ini.</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { id: 'Gateway', title: 'Bayar Sekarang (Online)', desc: 'VA, QRIS, E-Wallet, Kartu Kredit', icon: Wallet, color: 'indigo' },
                                            { id: 'COD', title: 'Bayar di Tempat (COD)', desc: 'Bayar saat barang sampai di tujuan', icon: Car, color: 'emerald' }
                                        ].map((m) => (
                                            <label key={m.id} className={`relative block cursor-pointer group p-8 border-2 rounded-[40px] transition-all duration-500 ${form.paymentMethod === m.id ? `border-${m.color}-500 bg-${m.color}-50/50 dark:bg-${m.color}-500/5 shadow-2xl skew-x-0 scale-[1.02]` : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.05]'}`}>
                                                <input type="radio" className="hidden" name="payment" value={m.id} checked={form.paymentMethod === m.id} onChange={() => setForm({ ...form, paymentMethod: m.id })} />
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${form.paymentMethod === m.id ? `bg-${m.color}-500 text-white rotate-6 shadow-lg shadow-${m.color}-500/30` : 'bg-white dark:bg-white/5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 border border-gray-100 dark:border-white/5'}`}>
                                                        <m.icon className="w-7 h-7" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className={`font-black text-xl mb-1 ${form.paymentMethod === m.id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{m.title}</h3>
                                                        <p className="text-slate-500 text-sm font-medium">{m.desc}</p>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${form.paymentMethod === m.id ? `border-${m.color}-500 bg-${m.color}-500` : 'border-gray-300 dark:border-white/10'}`}>
                                                        {form.paymentMethod === m.id && <CheckCircle className="w-5 h-5 text-white" />}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button type="button" onClick={() => setStep(1)} className="py-6 border-2 border-gray-200 dark:border-white/10 text-slate-500 dark:text-slate-400 rounded-[32px] font-black text-xs tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-all outline-none">
                                            KEMBALI
                                        </button>
                                        <button type="submit" className="py-6 bg-slate-900 dark:bg-white text-white dark:text-black rounded-[32px] font-black text-xs tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white transition-all shadow-2xl transform active:scale-95">
                                            LANJUT KE KONFIRMASI
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: KONFIRMASI FINAL */}
                            {step === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-1">
                                        <h2 className="text-3xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">Konfirmasi Pesanan</h2>
                                        <p className="text-slate-500 text-sm font-medium">Pastikan semua data sudah benar sebelum membuat pesanan.</p>
                                    </div>

                                    <div className="p-8 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-[40px] space-y-8">
                                        <div className="flex items-start gap-4 p-4 bg-white dark:bg-white/[0.03] rounded-3xl border border-gray-200 dark:border-white/5">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Alamat Pengiriman</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{form.name} ({form.phone})</p>
                                                <p className="text-xs font-medium text-slate-500 mt-1">{form.villageName}, {form.districtName}, {form.regencyName}, {form.provinceName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 bg-white dark:bg-white/[0.03] rounded-3xl border border-gray-200 dark:border-white/5">
                                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                                <CreditCardIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Metode Pembayaran</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{form.paymentMethod === 'Gateway' ? 'Bayar Langsung (Online)' : 'Bayar di Tempat (COD)'}</p>
                                                <p className="text-xs font-medium text-slate-500 mt-1">{form.paymentMethod === 'Gateway' ? 'VA, QRIS, E-Wallet, Card' : 'Bayar tunai saat barang diterima'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button type="button" onClick={() => setStep(2)} className="py-6 border-2 border-gray-200 dark:border-white/5 text-slate-500 dark:text-slate-400 rounded-[32px] font-black text-xs tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-all outline-none">
                                            KEMBALI
                                        </button>
                                        <button type="submit" disabled={submitting} className="py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xs tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 disabled:opacity-50">
                                            {submitting ? 'MEMPROSES...' : form.paymentMethod === 'Gateway' ? 'BAYAR SEKARANG' : 'BUAT PESANAN'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Sidebar: Summary Item & Total */}
                    <div className="lg:col-span-5">
                        <div className="bg-indigo-50 dark:bg-[#16161a] border border-indigo-200 dark:border-white/5 p-8 rounded-[40px] sticky top-12 shadow-3xl ring-1 ring-black/5 dark:ring-white/5 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Ringkasan</h2>
                                <span className="px-3 py-1 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-black rounded-lg border border-gray-100 dark:border-white/5">{checkoutItems.length} ITEM</span>
                            </div>

                            {/* Item List */}
                            <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {checkoutItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center group">
                                        <div className="w-16 h-16 bg-white dark:bg-white/[0.02] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 p-1 group-hover:border-indigo-500/30 transition-colors">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase">QTY: {item.quantity}</span>
                                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">Rp {item.price.toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cost Breakdown */}
                            <div className="space-y-4 pt-8 border-t border-indigo-200 dark:border-white/[0.03]">
                                <div className="flex justify-between items-center group">
                                    <span className="text-slate-500 text-sm font-medium tracking-wide">Subtotal</span>
                                    <span className="text-slate-900 dark:text-white font-bold">Rp {checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-slate-500 text-sm font-medium tracking-wide">Ongkos Kirim</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-black">Rp {(shippingCost || 0).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-slate-500 text-sm font-medium tracking-wide">Pajak (PPN 0%) & Admin</span>
                                    <span className="text-slate-900 dark:text-white font-bold">Rp 2.000</span>
                                </div>
                            </div>

                            {/* Grand Total */}
                            <div className="pt-8 border-t-2 border-dashed border-indigo-200 dark:border-white/10 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Bayar</p>
                                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm dark:drop-shadow-2xl">
                                        Rp {(checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (shippingCost || 0) + 2000).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-500 border border-emerald-500/20">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                orderId={currentOrder?.id || ''}
                amount={currentOrder?.amount || 0}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}

// Custom Scrollbar CSS (Utility classes not always available for scrollbars)
const scrollbarStyles = `
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.2); }
`;

