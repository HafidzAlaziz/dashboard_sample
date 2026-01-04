const supabase = require('../config/supabaseClient');

const getAllProducts = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*');

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch product details
        const { data: product, error: pError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (pError) throw pError;

        // Fetch product reviews
        const { data: reviews, error: rError } = await supabase
            .from('product_reviews')
            .select('*')
            .eq('product_id', id)
            .order('created_at', { ascending: false });

        if (rError) {
            console.error('Error fetching reviews:', rError);
            // Don't fail the whole request if only reviews fail
        }

        res.status(200).json({
            ...product,
            reviews: reviews || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById
};
