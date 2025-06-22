const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Verificar si el usuario ya existe
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );
        
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Usuario ya existe' });
        }
        
        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Crear usuario
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, passwordHash]
        );
        
        // Generar JWT
        const token = jwt.sign(
            { userId: newUser.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            token,
            user: newUser.rows[0]
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Buscar usuario
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        
        // Verificar password
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        
        if (!validPassword) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        
        // Generar JWT
        const token = jwt.sign(
            { userId: user.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.rows[0].id,
                username: user.rows[0].username,
                email: user.rows[0].email
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { register, login };