const dbPool = require('../config/db');

const getInvoices = async (req, res) => {
    try {
        const [invoices] = await dbPool.query(`
            SELECT i.*, c.name as client_name, c.email as client_email
            FROM invoices i
            JOIN clients c ON i.client_id = c.id
            WHERE i.user_id = ?
            ORDER BY i.created_at DESC
        `, [req.user.id]);
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInvoiceById = async (req, res) => {
    try {
        const [invoices] = await dbPool.query(`
            SELECT i.*, c.name as client_name, c.email as client_email, c.address as client_address
            FROM invoices i
            JOIN clients c ON i.client_id = c.id
            WHERE i.id = ? AND i.user_id = ?
        `, [req.params.id, req.user.id]);

        if (invoices.length === 0) return res.status(404).json({ message: 'Invoice not found' });

        const [items] = await dbPool.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [req.params.id]);

        res.json({ ...invoices[0], items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createInvoice = async (req, res) => {
    const { client_id, invoice_number, issue_date, due_date, subtotal, tax, discount, total, notes } = req.body;
    let items = req.body.items || [];
    
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO invoices (user_id, client_id, invoice_number, issue_date, due_date, subtotal, tax, discount, total, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, client_id, invoice_number, issue_date, due_date, subtotal, tax, discount, total, notes]
        );

        const invoiceId = result.insertId;

        for (const item of items) {
            await connection.query(
                'INSERT INTO invoice_items (invoice_id, description, quantity, price, total) VALUES (?, ?, ?, ?, ?)',
                [invoiceId, item.description, item.quantity, item.price, item.total]
            );
        }

        // Log activity
        await connection.query('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)', [
            req.user.id, 'CREATED_INVOICE', 'INVOICE', invoiceId, `Created invoice ${invoice_number}`
        ]);

        await connection.commit();

        if (req.io) {
            req.io.emit('invoice_updated', { message: 'New invoice created' });
        }

        res.status(201).json({ id: invoiceId, message: 'Invoice created successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

const updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await dbPool.query('UPDATE invoices SET status = ? WHERE id = ? AND user_id = ?', [status, req.params.id, req.user.id]);

        await dbPool.query('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)', [
            req.user.id, 'UPDATED_INVOICE_STATUS', 'INVOICE', req.params.id, `Updated invoice status to ${status}`
        ]);

        if (req.io) {
            req.io.emit('invoice_updated', { message: 'Invoice status updated' });
        }

        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteInvoice = async (req, res) => {
    try {
        await dbPool.query('DELETE FROM invoices WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        
        await dbPool.query('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)', [
            req.user.id, 'DELETED_INVOICE', 'INVOICE', req.params.id, `Deleted invoice ID ${req.params.id}`
        ]);

        if (req.io) {
            req.io.emit('invoice_updated', { message: 'Invoice deleted' });
        }

        res.json({ message: 'Invoice deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getInvoices, getInvoiceById, createInvoice, updateInvoiceStatus, deleteInvoice };
