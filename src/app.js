const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Agregar tu IP local
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

module.exports = app;