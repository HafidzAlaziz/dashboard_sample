import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const getProductById = async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export const createOrder = async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

export const login = async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

// Wilayah Helpers
export const getProvinces = async () => {
    const response = await api.get('/wilayah/provinces');
    return response.data;
};

export const getRegencies = async (provinceId: string) => {
    const response = await api.get(`/wilayah/regencies/${provinceId}`);
    return response.data;
};

export const getDistricts = async (regencyId: string) => {
    const response = await api.get(`/wilayah/districts/${regencyId}`);
    return response.data;
};

export const getVillages = async (districtId: string) => {
    const response = await api.get(`/wilayah/villages/${districtId}`);
    return response.data;
};

export const simulatePaymentSuccess = async (orderId: string) => {
    const response = await api.post(`/orders/simulate-success/${orderId}`);
    return response.data;
};

export default api;
