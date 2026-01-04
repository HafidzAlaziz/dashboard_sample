const supabase = require('../config/supabaseClient');

const getCustomers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('customers')
            .select('*');

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const registerCustomer = async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        const { data, error } = await supabase
            .from('customers')
            .insert([
                {
                    id: `CUST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    name,
                    email,
                    phone,
                    segment: 'New',
                    join_date: new Date()
                }
            ])
            .select();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getCustomers,
    registerCustomer
};
