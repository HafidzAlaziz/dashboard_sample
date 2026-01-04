const express = require('express');
const router = express.Router();

// Base URL for EMSIFA API (Stable)
const BASE_URL = 'https://emsifa.github.io/api-wilayah-indonesia/api';

// Proxy Provinces
router.get('/provinces', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/provinces.json`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching provinces:', error);
        res.status(500).json({ error: 'Failed to fetch provinces' });
    }
});

// Proxy Regencies
router.get('/regencies/:id', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/regencies/${req.params.id}.json`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching regencies:', error);
        res.status(500).json({ error: 'Failed to fetch regencies' });
    }
});

// Proxy Districts
router.get('/districts/:id', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/districts/${req.params.id}.json`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({ error: 'Failed to fetch districts' });
    }
});

// Proxy Villages
router.get('/villages/:id', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/villages/${req.params.id}.json`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching villages:', error);
        res.status(500).json({ error: 'Failed to fetch villages' });
    }
});

module.exports = router;
