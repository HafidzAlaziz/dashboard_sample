const supabase = require('../config/supabaseClient');
const fs = require('fs');

function debugLog(msg, data) {
    const entry = `${new Date().toISOString()} [DEBUG] ${msg} ${JSON.stringify(data, null, 2)}\n`;
    try {
        fs.appendFileSync('debug.log', entry);
    } catch (e) { console.error("Log failed", e); }
}

const createOrder = async (req, res) => {
    debugLog("Order creation request received", req.body);
    const { customer, products, amount, payment_method } = req.body;
    try {
        const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    id: orderId,
                    customer,
                    products,
                    amount,
                    status: 'Pending',
                    payment_method,
                    date: new Date().toLocaleDateString('id-ID'),
                    date_obj: new Date()
                }
            ])
            .select();

        debugLog("Insert result", { data, error });
        if (error) throw error;

        // Return order with a dummy payment token/url if it's a gateway payment
        res.status(201).json({
            ...data[0],
            payment_url: `https://mock-gateway.com/pay/${orderId}`
        });
    } catch (error) {
        debugLog("Order creation error catch", error.message);
        console.error("Order creation error:", error);
        res.status(500).json({ error: error.message });
    }
};

const simulatePaymentSuccess = async (req, res) => {
    const { orderId } = req.params;
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({
                status: 'Processing', // Auto move to processing after payment
                payment_status: 'Paid'
            })
            .eq('id', orderId)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: "Order not found" });

        res.status(200).json({ message: "Payment successful", order: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const requestCancellation = async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;

    try {
        const { data, error } = await supabase
            .from('orders')
            .update({
                status: 'Cancellation Requested', // Standardized English status
                cancellation_reason: reason
            })
            .eq('id', orderId)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: "Order not found" });

        res.status(200).json({ message: "Cancellation requested successfully", order: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status, rejection_reason } = req.body;

    try {
        const updatePayload = { status };
        if (rejection_reason) {
            updatePayload.rejection_reason = rejection_reason;
        }

        // Auto move to 'Paid' if status is 'Delivered' (Selesai in frontend)
        // This is helpful for COD orders being marked as completed.
        if (status === 'Delivered') {
            updatePayload.payment_status = 'Paid';
        }

        const { data, error } = await supabase
            .from('orders')
            .update(updatePayload)
            .eq('id', orderId)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: "Order not found" });

        res.status(200).json({ message: "Order status updated", order: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    simulatePaymentSuccess,
    requestCancellation,
    updateOrderStatus
};
