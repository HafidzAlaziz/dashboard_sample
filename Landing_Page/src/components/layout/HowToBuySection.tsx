"use client";

import { ShoppingBag, CreditCard, Truck, CheckCircle } from "lucide-react";

const steps = [
    {
        title: "Pilih Produk",
        description: "Cari dan pilih produk UMKM favorit Anda dari katalog pilihan kami.",
        icon: ShoppingBag,
    },
    {
        title: "Checkout",
        description: "Isi data pengiriman dan pilih metode pembayaran yang sesuai.",
        icon: CreditCard,
    },
    {
        title: "Konfirmasi",
        description: "Pesanan akan diteruskan via WhatsApp ke penjual langsung.",
        icon: CheckCircle,
    },
    {
        title: "Pengiriman",
        description: "Penjual akan memproses dan mengirimkan pesanan ke alamat Anda.",
        icon: Truck,
    },
];

export function HowToBuySection() {
    return (
        <section id="how-to-buy" className="py-20 bg-gray-50 dark:bg-gray-800/50 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Cara Belanja</h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Proses belanja yang mudah, transparan, dan langsung mendukung pengrajin lokal.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            {/* Connector Line (Desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors"></div>
                            )}

                            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col items-center text-center hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 transition-all">
                                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <step.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
