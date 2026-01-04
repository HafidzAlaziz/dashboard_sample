export const PRODUCT_STORAGE_KEY = "umkm_dashboard_products";

export const CATEGORIES = ["Makanan", "Minuman", "Snack", "Paket"] as const;
export type ProductCategory = typeof CATEGORIES[number];

export type ProductStatus = "Tersedia" | "Stok Habis";

export type Product = {
    id: string;
    name: string;
    category: ProductCategory;
    price: number;
    stock: number;
    status: ProductStatus;
    image?: string;
    description?: string;
};

export const INITIAL_PRODUCTS: Product[] = [
    { id: "PRD-001", name: "Kopi Susu Gula Aren", category: "Minuman", price: 18000, stock: 50, status: "Tersedia" },
    { id: "PRD-002", name: "Americano Expresso", category: "Minuman", price: 15000, stock: 30, status: "Tersedia" },
    { id: "PRD-003", name: "Latte Macchiato", category: "Minuman", price: 22000, stock: 25, status: "Tersedia" },
    { id: "PRD-004", name: "Nasi Goreng Spesial", category: "Makanan", price: 25000, stock: 15, status: "Tersedia" },
    { id: "PRD-005", name: "Mie Goreng Jawa", category: "Makanan", price: 22000, stock: 20, status: "Tersedia" },
    { id: "PRD-006", name: "Roti Bakar Coklat", category: "Snack", price: 15000, stock: 10, status: "Tersedia" },
    { id: "PRD-007", name: "Es Teh Manis Jumbo", category: "Minuman", price: 8000, stock: 100, status: "Tersedia" },
    { id: "PRD-008", name: "Matcha Latte", category: "Minuman", price: 20000, stock: 0, status: "Stok Habis" },
    { id: "PRD-009", name: "Croissant Butter", category: "Snack", price: 18000, stock: 5, status: "Tersedia" },
    { id: "PRD-010", name: "Paket Hemat A", category: "Paket", price: 45000, stock: 12, status: "Tersedia" },
];

export const parseProducts = (jsonString: string): Product[] => {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return [];
    }
};
