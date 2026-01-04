"use client";

import { useRef, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";
import { OrderData } from "@/lib/orderImageUtils";

interface OrderImageCanvasProps {
    orderData: OrderData;
    onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export function OrderImageCanvas({ orderData, onCanvasReady }: OrderImageCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = 800;
        canvas.height = 600 + (orderData.items.length * 80);

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header background
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(0, 0, canvas.width, 120);

        // Header text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('UMKM STORE', canvas.width / 2, 50);

        ctx.font = '20px Arial';
        ctx.fillText('INVOICE PESANAN', canvas.width / 2, 85);

        // Order ID and timestamp
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Order ID: ${orderData.orderId}`, 40, 160);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`Tanggal: ${orderData.timestamp}`, 40, 185);

        // Divider
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 210);
        ctx.lineTo(canvas.width - 40, 210);
        ctx.stroke();

        // Items header
        let yPos = 240;
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('DETAIL PESANAN', 40, yPos);

        // Items
        yPos += 30;
        ctx.font = '14px Arial';
        orderData.items.forEach((item, index) => {
            // Item number and name
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(`${index + 1}. ${item.name}`, 40, yPos);

            yPos += 25;
            ctx.font = '13px Arial';
            ctx.fillStyle = '#6b7280';
            ctx.fillText(`   Jumlah: ${item.quantity} pcs`, 40, yPos);

            // Price aligned right
            ctx.textAlign = 'right';
            ctx.fillStyle = '#1f2937';
            ctx.fillText(formatRupiah(item.price * item.quantity), canvas.width - 40, yPos);
            ctx.textAlign = 'left';

            yPos += 35;
        });

        // Divider
        yPos += 10;
        ctx.strokeStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.moveTo(40, yPos);
        ctx.lineTo(canvas.width - 40, yPos);
        ctx.stroke();

        // Summary
        yPos += 35;
        ctx.font = '14px Arial';
        ctx.fillStyle = '#6b7280';

        // Subtotal
        ctx.fillText('Subtotal Produk:', 40, yPos);
        ctx.textAlign = 'right';
        ctx.fillText(formatRupiah(orderData.subtotal), canvas.width - 40, yPos);
        ctx.textAlign = 'left';

        yPos += 30;
        ctx.fillText(`Ongkir (${orderData.destination}):`, 40, yPos);
        ctx.textAlign = 'right';
        ctx.fillText(formatRupiah(orderData.shippingCost), canvas.width - 40, yPos);
        ctx.textAlign = 'left';

        // Total divider
        yPos += 20;
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(40, yPos);
        ctx.lineTo(canvas.width - 40, yPos);
        ctx.stroke();

        // Grand Total
        yPos += 35;
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#1f2937';
        ctx.fillText('TOTAL PEMBAYARAN:', 40, yPos);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(formatRupiah(orderData.grandTotal), canvas.width - 40, yPos);
        ctx.textAlign = 'left';

        // Footer
        yPos += 60;
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Terima kasih telah berbelanja di UMKM Store', canvas.width / 2, yPos);
        ctx.fillText('Mohon kirim gambar ini beserta alamat lengkap ke WhatsApp kami', canvas.width / 2, yPos + 20);

        // Notify parent that canvas is ready
        if (onCanvasReady) {
            onCanvasReady(canvas);
        }
    }, [orderData, onCanvasReady]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full border border-gray-200 rounded-lg shadow-sm"
            style={{ maxWidth: '100%', height: 'auto' }}
        />
    );
}
