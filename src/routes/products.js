const express = require('express');
const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllProducts);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;