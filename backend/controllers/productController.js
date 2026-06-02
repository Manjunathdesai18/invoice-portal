const dbPool = require('../config/db');

exports.getProducts = async (req, res) => {
    try {
        const [products] = await dbPool.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.user_id = ? 
            ORDER BY p.created_at DESC
        `, [req.user.id]);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const [products] = await dbPool.query('SELECT * FROM products WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (products.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(products[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    const { name, category_id, sku, barcode, description, price, cost_price, stock_quantity, status } = req.body;
    try {
        const [result] = await dbPool.query(
            `INSERT INTO products 
            (user_id, category_id, name, sku, barcode, description, price, cost_price, stock_quantity, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, category_id || null, name, sku || null, barcode || null, description || null, price || 0, cost_price || 0, stock_quantity || 0, status || 'ACTIVE']
        );
        res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    const { name, category_id, sku, barcode, description, price, cost_price, stock_quantity, status } = req.body;
    try {
        const [result] = await dbPool.query(
            `UPDATE products SET 
            category_id=?, name=?, sku=?, barcode=?, description=?, price=?, cost_price=?, stock_quantity=?, status=? 
            WHERE id=? AND user_id=?`,
            [category_id || null, name, sku || null, barcode || null, description || null, price, cost_price, stock_quantity, status, req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const [result] = await dbPool.query('DELETE FROM products WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const [categories] = await dbPool.query('SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC', [req.user.id]);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        const [result] = await dbPool.query(
            'INSERT INTO categories (user_id, name, description) VALUES (?, ?, ?)',
            [req.user.id, name, description || null]
        );
        res.status(201).json({ id: result.insertId, name, description });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
