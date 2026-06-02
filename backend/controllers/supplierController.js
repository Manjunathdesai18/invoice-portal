const dbPool = require('../config/db');

// Suppliers
exports.getSuppliers = async (req, res) => {
    try {
        const [suppliers] = await dbPool.query('SELECT * FROM suppliers WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSupplier = async (req, res) => {
    const { name, contact_person, email, phone, address, status } = req.body;
    try {
        const [result] = await dbPool.query(
            'INSERT INTO suppliers (user_id, name, contact_person, email, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, name, contact_person || null, email || null, phone || null, address || null, status || 'ACTIVE']
        );
        res.status(201).json({ id: result.insertId, message: 'Supplier created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        const [result] = await dbPool.query('DELETE FROM suppliers WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Supplier not found' });
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Purchases
exports.getPurchases = async (req, res) => {
    try {
        const [purchases] = await dbPool.query(`
            SELECT p.*, s.name as supplier_name 
            FROM purchases p 
            JOIN suppliers s ON p.supplier_id = s.id 
            WHERE p.user_id = ? 
            ORDER BY p.created_at DESC
        `, [req.user.id]);
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createPurchase = async (req, res) => {
    const { supplier_id, total, items } = req.body;
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();
        
        const purchaseNumber = `PO-${Date.now().toString().slice(-6)}`;
        
        const [purchaseResult] = await connection.query(
            'INSERT INTO purchases (user_id, supplier_id, purchase_number, status, total, purchase_date) VALUES (?, ?, ?, ?, ?, CURDATE())',
            [req.user.id, supplier_id, purchaseNumber, 'RECEIVED', total]
        );
        
        const purchaseId = purchaseResult.insertId;

        // items [{product_id, quantity, cost}]
        for (let item of items) {
            await connection.query(
                `UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ? AND user_id = ?`,
                [item.quantity, item.product_id, req.user.id]
            );
            
            await connection.query(
                `INSERT INTO inventory_logs (product_id, user_id, change_type, quantity, previous_stock, new_stock, notes) 
                VALUES (?, ?, 'ADD', ?, (SELECT stock_quantity - ? FROM products WHERE id = ?), (SELECT stock_quantity FROM products WHERE id = ?), ?)`,
                [item.product_id, req.user.id, item.quantity, item.quantity, item.product_id, item.product_id, `Purchase Order: ${purchaseNumber}`]
            );
        }

        await connection.commit();
        if (req.io) {
            req.io.emit('notification', {
                title: 'Inventory Restocked',
                message: `Purchase Order ${purchaseNumber} completed. Items added to stock.`,
                type: 'info'
            });
        }
        res.status(201).json({ message: 'Purchase recorded and stock updated', purchase_id: purchaseId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};
