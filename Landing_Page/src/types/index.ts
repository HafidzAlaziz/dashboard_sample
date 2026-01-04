export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: string;
    image: string;
    description?: string;
    weight: number;
    sales_count?: number;
    reviews?: Review[];
}

export interface Review {
    id: string;
    product_id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

export interface Order {
    id: string;
    customer: string;
    products: string; // JSON string of products
    amount: number;
    status: string;
    date: string;
}
