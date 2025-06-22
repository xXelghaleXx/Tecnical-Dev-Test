const pool = require('../config/database');

const getAllProducts = async (req, res) => {
    try {
        const products = await pool.query(
            'SELECT p.*, u.username FROM products p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC'
        );
        res.json(products.rows);
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        const userId = req.user.userId;
        
        const newProduct = await pool.query(
            'INSERT INTO products (name, description, price, stock, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, price, stock, userId]
        );
        
        res.status(201).json({
            message: 'Producto creado exitosamente',
            product: newProduct.rows[0]
        });
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock } = req.body;
        const userId = req.user.userId;
        
        const updatedProduct = await pool.query(
            'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6 RETURNING *',
            [name, description, price, stock, id, userId]
        );
        
        if (updatedProduct.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado o no autorizado' });
        }
        
        res.json({
            message: 'Producto actualizado exitosamente',
            product: updatedProduct.rows[0]
        });
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        
        const deletedProduct = await pool.query(
            'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        
        if (deletedProduct.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado o no autorizado' });
        }
        
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct
};