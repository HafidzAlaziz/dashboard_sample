"use client";

import { useCartStore } from "@/store/useCartStore";
import { MessageCircle, Download, Copy, Image as ImageIcon, Check } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { useState, useCallback } from "react";
import { OrderImageCanvas } from "./OrderImageCanvas";
import { formatOrderData, downloadImage, copyImageToClipboard } from "@/lib/orderImageUtils";

interface WhatsAppCheckoutProps {
    shippingCost: number;
    destination: string;
}

export function WhatsAppCheckout({ shippingCost, destination }: WhatsAppCheckoutProps) {
    const { items, totalPrice } = useCartStore();
    const [showImageGenerator, setShowImageGenerator] = useState(false);
    const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);

    const isDisabled = shippingCost <= 0;
    const finalDestination = destination || "Konfirmasi Admin";

    const orderData = formatOrderData(items, totalPrice(), shippingCost, finalDestination);

    const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
        setCanvasElement(canvas);
    }, []);

    const handleDownload = () => {
        if (!canvasElement) return;
        downloadImage(canvasElement, orderData.orderId);
        setIsDownloaded(true);
        setTimeout(() => setIsDownloaded(false), 3000);
    };

    const handleCopy = async () => {
        if (!canvasElement) return;
        const success = await copyImageToClipboard(canvasElement);
        if (success) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        }
    };

    const handleOpenWhatsApp = () => {
        const message = `🛒 *PESANAN BARU - UMKM STORE*\n\n` +
            `Order ID: ${orderData.orderId}\n` +
            `Total Tagihan: ${formatRupiah(orderData.grandTotal)}\n\n` +
            `Halo Admin, saya ingin memesan produk.\n` +
            `Saya sudah download invoice pesanan.\n` +
            `Berikut saya kirimkan gambarnya dan alamat lengkap saya:`;

        const phone = "62895613114028";
        const link = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
        window.open(link, '_blank');
    };

    if (showImageGenerator) {
        return (
            <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                        📸 Invoice siap! Silakan download gambar, lalu kirimkan ke WhatsApp Admin.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 max-h-[500px] overflow-y-auto scrollbar-custom">
                    <OrderImageCanvas orderData={orderData} onCanvasReady={handleCanvasReady} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={!canvasElement}
                        className={cn(
                            "py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95",
                            isDownloaded ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
                        )}
                    >
                        {isDownloaded ? <Check className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                        {isDownloaded ? "Berhasil!" : "Download"}
                    </button>
                    <button
                        onClick={handleCopy}
                        disabled={!canvasElement}
                        className={cn(
                            "py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95",
                            isCopied ? "bg-green-600" : "bg-gray-600 hover:bg-gray-700"
                        )}
                    >
                        {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {isCopied ? "Ter-copy!" : "Copy Image"}
                    </button>
                </div>

                <button
                    onClick={handleOpenWhatsApp}
                    className="w-full py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <MessageCircle className="w-5 h-5" />
                    Buka WhatsApp Admin
                </button>

                <button
                    onClick={() => setShowImageGenerator(false)}
                    className="w-full py-2 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200"
                >
                    ← Kembali ke Detail Keranjang
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {isDisabled && (
                <p className="text-[10px] text-red-500 font-medium text-center animate-pulse">
                    *Hitung ongkir dlu sebelum checkout ya!
                </p>
            )}
            <button
                onClick={() => setShowImageGenerator(true)}
                disabled={isDisabled}
                className={cn(
                    "w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95",
                    isDisabled
                        ? "bg-gray-400 cursor-not-allowed opacity-70 border border-gray-300 shadow-none"
                        : "bg-green-500 shadow-green-200 hover:bg-green-600 hover:shadow-green-300"
                )}
            >
                <ImageIcon className="w-5 h-5" />
                Buat Invoice & Checkout
            </button>
        </div>
    );
}
