const dbPool = require('../config/db');

const getClients = async (req, res) => {
    try {
        const [clients] = await dbPool.query('SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createClient = async (req, res) => {
    const { name, email, phone, address, company } = req.body;
    try {
        const [result] = await dbPool.query(
            'INSERT INTO clients (user_id, name, email, phone, address, company) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, name, email, phone, address, company]
        );
        res.status(201).json({ id: result.insertId, user_id: req.user.id, name, email, phone, address, company });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateClient = async (req, res) => {
    const { name, email, phone, address, company } = req.body;
    try {
        await dbPool.query(
            'UPDATE clients SET name=?, email=?, phone=?, address=?, company=? WHERE id=? AND user_id=?',
            [name, email, phone, address, company, req.params.id, req.user.id]
        );
        res.json({ message: 'Client updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteClient = async (req, res) => {
    try {
        await dbPool.query('DELETE FROM clients WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
        res.json({ message: 'Client removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getClients, createClient, updateClient, deleteClient };
