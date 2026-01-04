import { CartItem } from "@/store/useCartStore";

export const generateOrderId = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
};

export const downloadImage = (canvas: HTMLCanvasElement, orderId: string) => {
    canvas.toBlob((blob) => {
        if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${orderId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }, 'image/png');
};

export const copyImageToClipboard = async (canvas: HTMLCanvasElement): Promise<boolean> => {
    try {
        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/png');
        });

        if (!blob) {
            throw new Error('Failed to create blob from canvas');
        }

        await navigator.clipboard.write([
            new ClipboardItem({
                'image/png': blob
            })
        ]);

        return true;
    } catch (error) {
        console.error('Failed to copy image to clipboard:', error);
        return false;
    }
};

export const shareImage = async (canvas: HTMLCanvasElement, orderId: string): Promise<boolean> => {
    try {
        // Check if Web Share API is supported
        if (!navigator.share || !navigator.canShare) {
            return false;
        }

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/png');
        });

        if (!blob) {
            throw new Error('Failed to create blob from canvas');
        }

        const file = new File([blob], `${orderId}.png`, { type: 'image/png' });

        // Check if we can share files
        if (!navigator.canShare({ files: [file] })) {
            return false;
        }

        await navigator.share({
            files: [file],
            title: 'Invoice Pesanan - UMKM Store',
            text: `Invoice pesanan ${orderId}`
        });

        return true;
    } catch (error) {
        // User cancelled or error occurred
        console.error('Failed to share image:', error);
        return false;
    }
};

export interface OrderData {
    orderId: string;
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    destination: string;
    grandTotal: number;
    timestamp: string;
}

export const formatOrderData = (
    items: CartItem[],
    subtotal: number,
    shippingCost: number,
    destination: string
): OrderData => {
    return {
        orderId: generateOrderId(),
        items,
        subtotal,
        shippingCost,
        destination,
        grandTotal: subtotal + shippingCost,
        timestamp: new Date().toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
    };
};
