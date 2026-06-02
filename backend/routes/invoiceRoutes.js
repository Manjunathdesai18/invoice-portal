const express = require('express');
const { getInvoices, getInvoiceById, createInvoice, updateInvoiceStatus, deleteInvoice } = require('../controllers/invoiceController');
const { downloadInvoicePDF, emailInvoice } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getInvoices)
    .post(createInvoice);

router.route('/:id')
    .get(getInvoiceById)
    .put(updateInvoiceStatus)
    .delete(deleteInvoice);

router.get('/:id/pdf', downloadInvoicePDF);
router.post('/:id/email', emailInvoice);

module.exports = router;
