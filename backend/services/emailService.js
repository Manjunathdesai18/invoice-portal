const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: 'Invoice Portal <no-reply@invoiceportal.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || undefined,
      attachments: options.attachments || [],
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}`);
  } catch (error) {
    console.error('Email Error:', error);
    throw new Error('Failed to send email');
  }
};

exports.sendInvoiceEmail = async (clientEmail, invoiceUrl, pdfBuffer) => {
  await this.sendEmail({
    email: clientEmail,
    subject: 'New Invoice Received',
    message: `You have received a new invoice. You can view it here: ${invoiceUrl}`,
    html: `<p>You have received a new invoice.</p><p><a href="${invoiceUrl}">Click here to view it online</a></p>`,
    attachments: [
      {
        filename: 'invoice.pdf',
        content: pdfBuffer,
      }
    ]
  });
};
