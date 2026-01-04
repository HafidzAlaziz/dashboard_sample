export const STORAGE_KEY = "umkm_dashboard_orders";

export const PRODUCTS = [
    "Kopi Susu Gula Aren", "Americano Expresso", "Latte Macchiato",
    "Nasi Goreng Spesial", "Mie Goreng Jawa", "Roti Bakar Coklat",
    "Es Teh Manis Jumbo", "Matcha Latte", "Croissant Butter", "Paket Hemat A"
];

export const CUSTOMERS = [
    "Budi Santoso", "Siti Aminah", "Ahmad Rizky", "Dewi Lestari", "Eko Prasetyo",
    "Fajar Nugroho", "Gita Pertiwi", "Hendra Gunawan", "Indah Sari", "Joko Widodo",
    "Kartini Supratman", "Lukman Hakim", "Maya Safitri", "Nanda Putra", "Olivia Wijaya"
];

export const STATUSES = ["Menunggu", "Diproses", "Dikirim", "Selesai", "Dibatalkan", "Menunggu Pembatalan"] as const;

export type OrderStatus = typeof STATUSES[number];

export type Order = {
    id: string;
    customer: string;
    products: string;
    date: string;
    dateObj: Date;
    amount: number;
    status: OrderStatus;
    paymentStatus: "Paid" | "Unpaid";
    paymentMethod: "QRIS" | "Transfer" | "Tunai";
    cancellationReason?: string;
    rejectionReason?: string;
};

export const parseOrders = (jsonString: string): Order[] => {
    try {
        const data = JSON.parse(jsonString);
        return data.map((order: any) => ({
            ...order,
            dateObj: new Date(order.dateObj)
        }));
    } catch (e) {
        return [];
    }
};

export const generateOrders = (): Order[] => {
    const orders: Order[] = [];
    const now = new Date();

    for (let i = 0; i < 200; i++) {
        const id = `#ORD-${(1000 + i).toString().padStart(4, '0')}`;
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        const amount = (Math.floor(Math.random() * 20) + 1) * 5000 + 10000;

        const dateObj = new Date(now);
        if (i < 20) {
            dateObj.setHours(dateObj.getHours() - (i * 3));
        } else if (i < 50) {
            dateObj.setDate(dateObj.getDate() - Math.floor(Math.random() * 30));
        } else if (i < 100) {
            dateObj.setMonth(dateObj.getMonth() - Math.floor(Math.random() * 6));
        } else {
            const yearOffset = Math.floor(Math.random() * 5);
            dateObj.setFullYear(dateObj.getFullYear() - yearOffset);
            dateObj.setMonth(Math.floor(Math.random() * 12));
            dateObj.setDate(Math.floor(Math.random() * 28) + 1);
        }

        const date = dateObj.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const paymentMethod = Math.random() > 0.6 ? "QRIS" : Math.random() > 0.3 ? "Tunai" : "Transfer";
        // Logic: Tunai -> Unpaid, Others -> Paid. But for randomness, we allow some flexibility or strictness.
        // Requested logic: Tunai = Belum Bayar (Unpaid), Others = Lunas (Paid).
        const paymentStatus = paymentMethod === "Tunai" ? "Unpaid" : "Paid";

        orders.push({
            id,
            customer: CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)],
            products: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
            date,
            dateObj,
            amount,
            status,
            paymentStatus,
            paymentMethod
        });

    }

    return orders.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
};

export const calculateStats = (orders: Order[]) => {
    const totalOrders = orders.length;
    const lunasOrders = orders.filter(o => o.status === "Selesai" || o.status === "Dikirim");
    const totalRevenue = lunasOrders.reduce((acc, curr) => acc + curr.amount, 0);
    const pendingOrders = orders.filter(o => o.status === "Menunggu").length;
    const cancelledOrders = orders.filter(o => o.status === "Dibatalkan").length;

    // Monthly stats for change percentage
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const currentMonthOrders = lunasOrders.filter(o => o.dateObj.getMonth() === thisMonth && o.dateObj.getFullYear() === thisYear);
    const lastMonthOrders = lunasOrders.filter(o => o.dateObj.getMonth() === lastMonth && o.dateObj.getFullYear() === lastMonthYear);

    const currentMonthRevenue = currentMonthOrders.reduce((acc, curr) => acc + curr.amount, 0);
    const lastMonthRevenue = lastMonthOrders.reduce((acc, curr) => acc + curr.amount, 0);

    const revenueChange = lastMonthRevenue === 0 ? 100 : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    const salesChange = lastMonthOrders.length === 0 ? 100 : ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100;

    // Daily Trend for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const orderTrend = last7Days.map(dateStr => {
        const dayOrders = orders.filter(o => o.dateObj.toISOString().split('T')[0] === dateStr);
        const dayRevenue = dayOrders
            .filter(o => o.status === "Selesai" || o.status === "Dikirim")
            .reduce((acc, curr) => acc + curr.amount, 0);

        return {
            name: new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short' }),
            orders: dayOrders.length,
            revenue: dayRevenue
        };
    });

    // Top Products Distribution (simple count from orders)
    const productMap: Record<string, number> = {};
    orders.forEach(o => {
        const items = o.products.split(',').map(i => i.split('(')[0].trim());
        items.forEach(item => {
            if (item) productMap[item] = (productMap[item] || 0) + 1;
        });
    });

    const topProducts = Object.entries(productMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        cancelledOrders,
        thisMonthSales: currentMonthOrders.length,
        revenueChange: revenueChange.toFixed(1),
        salesChange: salesChange.toFixed(1),
        averageTransaction: totalOrders > 0 ? Math.round(totalRevenue / (lunasOrders.length || 1)) : 0,
        orderTrend,
        topProducts
    };
};
