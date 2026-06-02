const aiService = require('../services/aiService');
const dbPool = require('../config/db');

exports.generateDescription = async (req, res) => {
  try {
    const { prompt } = req.body;
    const description = await aiService.generateInvoiceDescription(prompt);
    res.json({ description });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPredictiveInsights = async (req, res) => {
  try {
    const [revenueData] = await dbPool.query(`
      SELECT DATE_FORMAT(issue_date, '%Y-%m') as month, SUM(total) as revenue 
      FROM invoices 
      WHERE user_id = ? AND status = 'PAID'
      GROUP BY month 
      ORDER BY month ASC
    `, [req.user.id]);
    
    const prediction = await aiService.predictRevenue(revenueData);
    res.json({ prediction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSmartAdvice = async (req, res) => {
  try {
    const [stats] = await dbPool.query(`
      SELECT 
        SUM(CASE WHEN status = 'OVERDUE' THEN total ELSE 0 END) as overdue_amount,
        SUM(CASE WHEN status = 'PAID' THEN total ELSE 0 END) as paid_amount,
        SUM(CASE WHEN status = 'PENDING' THEN total ELSE 0 END) as pending_amount
      FROM invoices WHERE user_id = ?
    `, [req.user.id]);

    const advice = await aiService.getSmartInsights(stats[0]);
    res.json({ advice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInventoryInsights = async (req, res) => {
  try {
    const [products] = await dbPool.query(`
      SELECT name, stock_quantity, status 
      FROM products 
      WHERE user_id = ? AND status = 'ACTIVE'
    `, [req.user.id]);
    
    if (products.length === 0) return res.json({ prediction: "Not enough inventory data to generate insights." });
    
    const prediction = await aiService.predictInventory(products);
    res.json({ prediction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
