const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');

exports.generateInvoicePDF = async (invoiceData, itemsData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text('INVOICE', { align: 'right' });
      doc.fontSize(10).text(`Invoice Number: ${invoiceData.invoice_number}`, { align: 'right' });
      doc.text(`Date: ${new Date(invoiceData.issue_date).toLocaleDateString()}`, { align: 'right' });
      doc.text(`Due Date: ${new Date(invoiceData.due_date).toLocaleDateString()}`, { align: 'right' });

      doc.moveDown();
      doc.fontSize(12).text('Bill To:');
      doc.fontSize(10).text(invoiceData.client_name || 'Client');
      if (invoiceData.client_email) doc.text(invoiceData.client_email);
      if (invoiceData.client_address) doc.text(invoiceData.client_address);

      doc.moveDown(2);
      
      // Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Description', 50, tableTop);
      doc.text('Quantity', 280, tableTop, { width: 90, align: 'right' });
      doc.text('Price', 370, tableTop, { width: 90, align: 'right' });
      doc.text('Total', 470, tableTop, { width: 90, align: 'right' });
      
      doc.moveTo(50, tableTop + 15).lineTo(560, tableTop + 15).stroke();
      doc.font('Helvetica');

      // Table Rows
      let y = tableTop + 25;
      itemsData.forEach(item => {
        doc.text(item.description, 50, y);
        doc.text(item.quantity.toString(), 280, y, { width: 90, align: 'right' });
        doc.text(`$${parseFloat(item.price).toFixed(2)}`, 370, y, { width: 90, align: 'right' });
        doc.text(`$${parseFloat(item.total).toFixed(2)}`, 470, y, { width: 90, align: 'right' });
        y += 20;
      });

      doc.moveTo(50, y + 5).lineTo(560, y + 5).stroke();

      // Totals
      doc.moveDown(2);
      doc.font('Helvetica-Bold');
      doc.text(`Subtotal: $${parseFloat(invoiceData.subtotal).toFixed(2)}`, { align: 'right' });
      if (invoiceData.tax > 0) doc.text(`Tax: $${parseFloat(invoiceData.tax).toFixed(2)}`, { align: 'right' });
      if (invoiceData.discount > 0) doc.text(`Discount: -$${parseFloat(invoiceData.discount).toFixed(2)}`, { align: 'right' });
      doc.fontSize(14).text(`Total: $${parseFloat(invoiceData.total).toFixed(2)}`, { align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

exports.generateReportsExcel = async (reportsData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Financial Report');

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Invoice Number', key: 'invoice_number', width: 20 },
    { header: 'Client', key: 'client', width: 30 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Total', key: 'total', width: 15 },
  ];

  reportsData.forEach(data => {
    worksheet.addRow(data);
  });

  return await workbook.xlsx.writeBuffer();
};

exports.generateReportsCSV = (reportsData) => {
  try {
    const fields = ['date', 'invoice_number', 'client', 'status', 'total'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(reportsData);
    return csv;
  } catch (err) {
    console.error('CSV Generation Error:', err);
    throw err;
  }
};
