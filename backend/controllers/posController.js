const dbPool = require('../config/db');

exports.processCheckout = async (req, res) => {
    const { client_id, items, subtotal, tax, discount, total, payment_method } = req.body;
    
    // Start a transaction because we touch multiple tables
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Create Invoice
        const invoiceNumber = `POS-${Date.now().toString().slice(-6)}`;
        const [invResult] = await connection.query(
            `INSERT INTO invoices 
            (user_id, client_id, invoice_number, status, issue_date, due_date, subtotal, tax, discount, total, notes) 
            VALUES (?, ?, ?, 'PAID', CURDATE(), CURDATE(), ?, ?, ?, ?, 'POS Sale')`,
            [req.user.id, client_id || 1, invoiceNumber, subtotal, tax, discount, total]
        );
        const invoiceId = invResult.insertId;

        // 2. Insert Items and Deduct Stock
        for (let item of items) {
            // Insert into invoice_items
            await connection.query(
                `INSERT INTO invoice_items (invoice_id, description, quantity, price, total) 
                VALUES (?, ?, ?, ?, ?)`,
                [invoiceId, item.name, item.quantity, item.price, item.quantity * item.price]
            );

            // Deduct stock from products
            await connection.query(
                `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND user_id = ?`,
                [item.quantity, item.product_id, req.user.id]
            );

            // Log inventory change
            await connection.query(
                `INSERT INTO inventory_logs (product_id, user_id, change_type, quantity, previous_stock, new_stock, notes) 
                VALUES (?, ?, 'SUBTRACT', ?, (SELECT stock_quantity + ? FROM products WHERE id = ?), (SELECT stock_quantity FROM products WHERE id = ?), 'POS Sale')`,
                [item.product_id, req.user.id, item.quantity, item.quantity, item.product_id, item.product_id]
            );
        }

        // 3. Record Payment
        await connection.query(
            `INSERT INTO payments (invoice_id, amount, payment_date, payment_method, notes) 
            VALUES (?, ?, CURDATE(), ?, 'POS Checkout')`,
            [invoiceId, total, payment_method || 'CASH']
        );

        await connection.commit();
        
        if (req.io) {
            req.io.emit('notification', {
                title: 'New Sale Completed',
                message: `Invoice ${invoiceNumber} created for $${total.toFixed(2)}`,
                type: 'success'
            });
        }
        
        res.status(201).json({ message: 'Checkout successful', invoice_id: invoiceId });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};
