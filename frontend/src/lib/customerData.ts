export const CUSTOMER_STORAGE_KEY = "umkm_dashboard_customers";

export type CustomerSegment = "Baru" | "Reguler" | "VIP" | "Loyal";

export type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpend: number;
    lastOrderDate: string;
    segment: CustomerSegment;
    avatar?: string;
    joinDate: string;
};

export const INITIAL_CUSTOMERS: Customer[] = [
    {
        id: "CUST-001",
        name: "Budi Santoso",
        email: "budi.santoso@email.com",
        phone: "081234567890",
        totalOrders: 12,
        totalSpend: 450000,
        lastOrderDate: "2023-12-25",
        segment: "VIP",
        joinDate: "2023-01-15"
    },
    {
        id: "CUST-002",
        name: "Siti Aminah",
        email: "siti.aminah@email.com",
        phone: "081298765432",
        totalOrders: 5,
        totalSpend: 125000,
        lastOrderDate: "2023-12-20",
        segment: "Reguler",
        joinDate: "2023-05-10"
    },
    {
        id: "CUST-003",
        name: "Ahmad Rizky",
        email: "ahmad.rizky@email.com",
        phone: "085612345678",
        totalOrders: 1,
        totalSpend: 25000,
        lastOrderDate: "2023-12-28",
        segment: "Baru",
        joinDate: "2023-12-28"
    },
    {
        id: "CUST-004",
        name: "Dewi Lestari",
        email: "dewi.lestari@email.com",
        phone: "087812345674",
        totalOrders: 25,
        totalSpend: 1200000,
        lastOrderDate: "2023-12-27",
        segment: "Loyal",
        joinDate: "2022-11-20"
    },
    {
        id: "CUST-005",
        name: "Eko Prasetyo",
        email: "eko.prasetyo@email.com",
        phone: "081312345678",
        totalOrders: 8,
        totalSpend: 230000,
        lastOrderDate: "2023-12-15",
        segment: "Reguler",
        joinDate: "2023-03-05"
    }
];

export const parseCustomers = (jsonString: string): Customer[] => {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return [];
    }
};
