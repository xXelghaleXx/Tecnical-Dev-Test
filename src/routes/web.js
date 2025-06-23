const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const router = express.Router();

// Middleware para verificar autenticación web
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// Página principal (redirige según estado de autenticación)
router.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// Página de login
router.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null });
});

// Procesar login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (user.rows.length === 0) {
            return res.render('login', { error: 'Credenciales inválidas' });
        }
        
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        
        if (!validPassword) {
            return res.render('login', { error: 'Credenciales inválidas' });
        }
        
        req.session.userId = user.rows[0].id;
        req.session.username = user.rows[0].username;
        req.session.email = user.rows[0].email;
        
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error en login web:', error);
        res.render('login', { error: 'Error interno del servidor' });
    }
});

// Página de registro
router.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('register', { error: null, success: null });
});

// Procesar registro
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );
        
        if (userExists.rows.length > 0) {
            return res.render('register', { 
                error: 'Usuario ya existe', 
                success: null 
            });
        }
        
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
            [username, email, passwordHash]
        );
        
        res.render('register', { 
            error: null, 
            success: 'Usuario creado exitosamente. Puedes iniciar sesión ahora.' 
        });
    } catch (error) {
        console.error('Error en registro web:', error);
        res.render('register', { 
            error: 'Error interno del servidor', 
            success: null 
        });
    }
});

// Dashboard (requiere autenticación)
router.get('/dashboard', requireAuth, async (req, res) => {
    try {
        const products = await pool.query(
            'SELECT p.*, u.username FROM products p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC'
        );
        
        const userProducts = await pool.query(
            'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC',
            [req.session.userId]
        );
        
        res.render('dashboard', {
            user: {
                id: req.session.userId,
                username: req.session.username,
                email: req.session.email
            },
            products: products.rows,
            userProducts: userProducts.rows
        });
    } catch (error) {
        console.error('Error en dashboard:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Crear producto
router.post('/products', requireAuth, async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        
        await pool.query(
            'INSERT INTO products (name, description, price, stock, user_id) VALUES ($1, $2, $3, $4, $5)',
            [name, description, parseFloat(price), parseInt(stock), req.session.userId]
        );
        
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).send('Error creando producto');
    }
});

// Eliminar producto
router.post('/products/:id/delete', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.query(
            'DELETE FROM products WHERE id = $1 AND user_id = $2',
            [id, req.session.userId]
        );
        
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).send('Error eliminando producto');
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        res.redirect('/login');
    });
});

module.exports = router;