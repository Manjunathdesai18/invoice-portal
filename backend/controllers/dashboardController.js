const dbPool = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Total revenue (paid invoices)
        const [revenueRes] = await dbPool.query("SELECT SUM(total) as total_revenue FROM invoices WHERE user_id = ? AND status = 'PAID'", [userId]);
        
        // Pending amount
        const [pendingRes] = await dbPool.query("SELECT SUM(total) as total_pending FROM invoices WHERE user_id = ? AND status = 'PENDING'", [userId]);

        // Invoice counts
        const [countsRes] = await dbPool.query("SELECT status, COUNT(*) as count FROM invoices WHERE user_id = ? GROUP BY status", [userId]);
        
        // Recent invoices
        const [recentInvoices] = await dbPool.query(`
            SELECT i.id, i.invoice_number, c.name as client_name, i.total, i.status, i.issue_date 
            FROM invoices i JOIN clients c ON i.client_id = c.id 
            WHERE i.user_id = ? ORDER BY i.created_at DESC LIMIT 5
        `, [userId]);

        // Chart data
        const [chartData] = await dbPool.query(`
            SELECT DATE_FORMAT(issue_date, '%b') as name, SUM(total) as revenue 
            FROM invoices 
            WHERE user_id = ? AND issue_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY name, MONTH(issue_date)
            ORDER BY MONTH(issue_date) ASC
        `, [userId]);

        res.json({
            total_revenue: revenueRes[0].total_revenue || 0,
            total_pending: pendingRes[0].total_pending || 0,
            invoice_counts: countsRes,
            recent_invoices: recentInvoices,
            chart_data: chartData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
