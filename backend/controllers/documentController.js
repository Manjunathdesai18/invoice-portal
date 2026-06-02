const dbPool = require('../config/db');
const documentService = require('../services/documentService');
const emailService = require('../services/emailService');

exports.downloadInvoicePDF = async (req, res) => {
  try {
    const [invoices] = await dbPool.query(`
        SELECT i.*, c.name as client_name, c.email as client_email, c.address as client_address
        FROM invoices i
        JOIN clients c ON i.client_id = c.id
        WHERE i.id = ? AND i.user_id = ?
    `, [req.params.id, req.user.id]);

    if (invoices.length === 0) return res.status(404).json({ message: 'Invoice not found' });

    const [items] = await dbPool.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [req.params.id]);

    const pdfBuffer = await documentService.generateInvoicePDF(invoices[0], items);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoices[0].invoice_number}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.emailInvoice = async (req, res) => {
  try {
    const [invoices] = await dbPool.query(`
        SELECT i.*, c.name as client_name, c.email as client_email, c.address as client_address
        FROM invoices i
        JOIN clients c ON i.client_id = c.id
        WHERE i.id = ? AND i.user_id = ?
    `, [req.params.id, req.user.id]);

    if (invoices.length === 0) return res.status(404).json({ message: 'Invoice not found' });

    const [items] = await dbPool.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [req.params.id]);

    const pdfBuffer = await documentService.generateInvoicePDF(invoices[0], items);
    const invoiceUrl = `${process.env.FRONTEND_URL}/public-invoice/${req.params.id}`;

    await emailService.sendInvoiceEmail(invoices[0].client_email, invoiceUrl, pdfBuffer);
    
    // Log activity
    await dbPool.query('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)', [
        req.user.id, 'EMAILED_INVOICE', 'INVOICE', req.params.id, `Emailed invoice to ${invoices[0].client_email}`
    ]);

    res.json({ message: 'Invoice emailed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportReports = async (req, res) => {
    const { type } = req.query;
    try {
        const [invoices] = await dbPool.query(`
            SELECT i.issue_date as date, i.invoice_number, c.name as client, i.status, i.total
            FROM invoices i
            JOIN clients c ON i.client_id = c.id
            WHERE i.user_id = ?
            ORDER BY i.issue_date DESC
        `, [req.user.id]);

        if (type === 'excel') {
            const buffer = await documentService.generateReportsExcel(invoices);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=reports.xlsx');
            return res.send(buffer);
        } else if (type === 'csv') {
            const csv = documentService.generateReportsCSV(invoices);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=reports.csv');
            return res.send(csv);
        } else if (type === 'pdf') {
            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=reports.pdf');
                res.send(pdfData);
            });
            doc.fontSize(20).text('Financial Report', { align: 'center' });
            doc.moveDown(2);
            invoices.forEach(inv => {
                doc.fontSize(12).text(`Date: ${new Date(inv.date).toLocaleDateString()} | Invoice: ${inv.invoice_number} | Client: ${inv.client} | Total: $${inv.total} | Status: ${inv.status}`);
                doc.moveDown(0.5);
            });
            doc.end();
        } else {
            res.status(400).json({ message: 'Invalid export type' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
