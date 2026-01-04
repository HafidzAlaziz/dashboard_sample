const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wilayah', require('./routes/wilayah'));

app.get('/', (req, res) => {
    res.json({ message: 'UMKM Dashboard API is running' });
});

// Error handling middleware
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    try {
        require('fs').appendFileSync('error.log', new Date().toISOString() + ' ' + err.stack + '\n');
    } catch (e) { console.error("Failed to write to log file", e); }
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
