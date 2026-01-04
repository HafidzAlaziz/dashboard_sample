import { CartItem } from "@/store/useCartStore";
import { formatRupiah } from "./utils";

export const generateWhatsAppLink = (
    items: CartItem[],
    totalPrice: number,
    shippingCost: number,
    destination: string,
    customerName: string = "Pelanggan"
) => {
    const phone = "62895613114028"; // UMKM Store WhatsApp
    const grandTotal = totalPrice + shippingCost;

    let message = `🛒 *PESANAN BARU - UMKM STORE*\n\n`;
    message += `Halo Admin, saya ingin memesan:\n\n`;

    message += `📦 *DETAIL PESANAN:*\n`;
    items.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   • Jumlah: ${item.quantity} pcs\n`;
        message += `   • Harga: ${formatRupiah(item.price * item.quantity)}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `💰 *RINCIAN BIAYA:*\n`;
    message += `• Subtotal Produk: ${formatRupiah(totalPrice)}\n`;
    message += `• Ongkir (${destination}): ${formatRupiah(shippingCost)}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `• *TOTAL PEMBAYARAN: ${formatRupiah(grandTotal)}*\n\n`;
    message += `📍 *Alamat Pengiriman:*\n`;
    message += `(Mohon lengkapi alamat detail Anda di sini)\n\n`;
    message += `Terima kasih! 🙏`;

    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
};
