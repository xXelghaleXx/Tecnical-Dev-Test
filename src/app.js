const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const webRoutes = require('./routes/web');

const app = express();

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sesiones
app.use(session({
    secret: process.env.JWT_SECRET || 'tu_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://127.0.0.1:5173', 
        'http://192.168.18.94:3000',  // Tu IP
        'http://localhost:3000',      // Puerto de tu API
        'http://127.0.0.1:3000',      // Localhost API
        'http://localhost:3001',      // Flutter Web puerto común
        'http://127.0.0.1:3001',      // Flutter Web localhost
        'http://localhost:8080',      // Flutter Web puerto alternativo
        'http://127.0.0.1:8080',      // Flutter Web localhost alternativo
        'http://localhost:8000',      // Otro puerto común
        'http://127.0.0.1:8000',      // Otro puerto localhost
        'http://192.168.18.94:3001',  // Tu IP con Flutter Web
        'http://192.168.18.94:8080',  // Tu IP con puerto alternativo
        'http://192.168.18.94:8000',  // Tu IP con otro puerto
        '*'  // Permitir todas (solo para desarrollo)
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Allow-Origin'
    ],
    optionsSuccessStatus: 200
}));
// Middleware
app.use(cors({
    origin: ['http://localhost:5132/', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para formularios

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/', webRoutes); // Rutas web

// Health check
app.get('/api/health', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

module.exports = app;