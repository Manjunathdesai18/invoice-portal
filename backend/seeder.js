require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3307,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'invoice_portal',
  waitForConnections: true,
  connectionLimit: 10,
});

async function seed() {
  const conn = await pool.getConnection();
  console.log('✅ Connected to database.');

  try {
    await conn.beginTransaction();

    // ── TRUNCATE (reverse FK order) ───────────────────────────────────
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of [
      'notifications','audit_logs','inventory_logs',
      'purchases','payments','invoice_items','invoices',
      'products','categories','suppliers','clients','users',
    ]) {
      await conn.query(`TRUNCATE TABLE \`${t}\``);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🗑️  Tables truncated.');

    // ── USERS ─────────────────────────────────────────────────────────
    // Actual cols: id, name, email, password, company_name, company_logo,
    //              company_address, currency, tax_rate, created_at, updated_at
    const hash     = await bcrypt.hash('Admin@123', 10);
    const manjuHash = await bcrypt.hash('manju', 10);
    await conn.query(`
      INSERT INTO users (id, name, email, password, company_name, company_address, currency, tax_rate) VALUES
        (1,'Manjunath Desai','manjunathdesai920@gmail.com',?, 'TechCorp Solutions Pvt. Ltd.','42, MG Road, Bangalore 560001',  'INR', 18.00),
        (2,'Priya Mehta',   'priya@nexusbiz.in',           ?, 'Nexus Business Hub',          '15, Anna Salai, Chennai 600002', 'INR', 12.00),
        (3,'Rahul Verma',   'rahul@cloudventure.in',       ?, 'TechCorp Solutions Pvt. Ltd.','42, MG Road, Bangalore 560001',  'INR', 18.00),
        (4,'Sneha Patel',   'sneha@finflow.in',            ?, 'TechCorp Solutions Pvt. Ltd.','42, MG Road, Bangalore 560001',  'INR', 18.00)
    `, [manjuHash, hash, hash, hash]);
    console.log('👤 Users seeded (4).');

    // ── CLIENTS ───────────────────────────────────────────────────────
    // Actual cols: id, user_id, name, email, phone, address, company
    // (no status column in live DB)
    await conn.query(`
      INSERT INTO clients (id, user_id, name, email, phone, address, company) VALUES
        (1,  1,'Vikram Nair',       'vikram@infratech.in',   '9876543210','12, Brigade Road, Bangalore 560025',    'InfraTech Systems'),
        (2,  1,'Ananya Krishnan',   'ananya@globalsoft.in',  '9845123456','5, Nehru Street, Chennai 600036',       'GlobalSoft India'),
        (3,  1,'Rohit Sinha',       'rohit@deltaops.in',     '9123456780','78, Park Avenue, Hyderabad 500016',     'DeltaOps Technologies'),
        (4,  1,'Meera Joshi',       'meera@bluepeak.in',     '9654321098','9, Civil Lines, Jaipur 302006',         'BluePeak Analytics'),
        (5,  1,'Suresh Kumar',      'suresh@alphalogic.in',  '9887766554','33, Residency Road, Pune 411001',       'AlphaLogic Corp'),
        (6,  1,'Deepa Iyer',        'deepa@stellarweb.in',   '9765432109','21, MG Nagar, Kochi 682016',            'StellarWeb Solutions'),
        (7,  1,'Karan Malhotra',    'karan@quantumit.in',    '9011223344','66, Sector 18, Noida 201301',           'Quantum IT Services'),
        (8,  1,'Lavanya Subramani', 'lavanya@techprime.in',  '9922334455','14, T Nagar, Chennai 600017',           'TechPrime Pvt. Ltd.'),
        (9,  1,'Aditya Bhatt',      'aditya@nexacloud.in',   '9700112233','88, FC Road, Pune 411004',              'NexaCloud Innovations'),
        (10, 1,'Pooja Rao',         'pooja@databridge.in',   '9823344556','7, Cunningham Road, Bangalore 560052', 'DataBridge Analytics'),
        (11, 2,'Sanjay Desai',      'sanjay@optiflow.in',    '9944556677','19, LB Shastri Marg, Mumbai 400080',   'OptiFlow Enterprises'),
        (12, 2,'Rekha Menon',       'rekha@pixelcraft.in',   '9633445566','3, Church Street, Bangalore 560001',   'PixelCraft Studio')
    `);
    console.log('🏢 Clients seeded (12).');

    // ── CATEGORIES ────────────────────────────────────────────────────
    await conn.query(`
      INSERT INTO categories (id, user_id, name, description) VALUES
        (1, 1,'Software & Licenses',  'ERP, SaaS, and digital license products'),
        (2, 1,'Hardware & Devices',   'Laptops, servers, networking equipment'),
        (3, 1,'IT Services',          'Consulting, support, and managed services'),
        (4, 1,'Office Supplies',      'Stationery, furniture, and general office items'),
        (5, 1,'Cloud Infrastructure', 'Cloud storage, compute and hosting services'),
        (6, 2,'Marketing Services',   'SEO, ads and branding services'),
        (7, 2,'Consulting',           'Business strategy and advisory')
    `);
    console.log('📂 Categories seeded (7).');

    // ── SUPPLIERS ─────────────────────────────────────────────────────
    await conn.query(`
      INSERT INTO suppliers (id, user_id, name, contact_person, email, phone, address, status) VALUES
        (1, 1,'Dell Technologies India',    'Amit Khanna',   'sales@dell.in',       '1800-425-4041','12th Floor, DLF Cyber City, Gurugram 122002', 'ACTIVE'),
        (2, 1,'Lenovo India Pvt. Ltd.',     'Sonal Gupta',   'support@lenovo.in',   '1800-419-7555','8th Floor, Prestige Platina, Bangalore 560025','ACTIVE'),
        (3, 1,'Tata Consultancy Services',  'Neeraj Jha',    'proc@tcs.com',        '022-6778-9999','TCS House, Raveline Street, Mumbai 400001',    'ACTIVE'),
        (4, 1,'Microsoft India',            'Preethi Das',   'bizdev@microsoft.in', '1800-102-1100','Signature Island, BKC, Mumbai 400051',          'ACTIVE'),
        (5, 1,'Amazon Web Services India',  'Ravi Shankar',  'aws@amazon.in',       '1800-572-0585','Brigade WTC, Bangalore 560001',                 'ACTIVE'),
        (6, 1,'HP India Sales Pvt. Ltd.',   'Kavita Reddy',  'hp@hp.com',           '1800-108-4747','Salarpuria Tech Park, Bangalore 560037',        'ACTIVE'),
        (7, 1,'Synnex India Pvt. Ltd.',     'Gaurav Sethi',  'info@synnex.in',      '044-4567-8901','Old Mahabalipuram Road, Chennai 600119',        'INACTIVE'),
        (8, 2,'WPP Group India',            'Tanvi Shah',    'tanvi@wpp.in',        '022-6655-4433','One BKC, Mumbai 400051',                        'ACTIVE'),
        (9, 2,'Infosys BPM Ltd.',           'Manish Tiwari', 'bpm@infosys.com',     '080-2852-0261','Electronics City, Bangalore 560100',            'ACTIVE')
    `);
    console.log('🚚 Suppliers seeded (9).');

    // ── PRODUCTS ──────────────────────────────────────────────────────
    await conn.query(`
      INSERT INTO products
        (id, user_id, category_id, name, sku, description, price, cost_price, tax, discount, stock_quantity, status)
      VALUES
        (1,  1,1,'Microsoft Office 365 Business','SKU-MS-365',   'Annual subscription, up to 5 devices',  9999.00, 7500.00,18.00, 5.00,200,'ACTIVE'),
        (2,  1,1,'Adobe Creative Cloud',          'SKU-ADO-CC',   'Full suite – PS, Illustrator, Premiere',54999.00,42000.00,18.00,10.00, 80,'ACTIVE'),
        (3,  1,2,'Dell Inspiron 15 Laptop',       'SKU-DL-INS15', 'Intel i5 12th Gen, 16GB, 512GB SSD',   72999.00,58000.00,18.00, 8.00, 45,'ACTIVE'),
        (4,  1,2,'Lenovo ThinkPad E14',           'SKU-LN-E14',   'AMD Ryzen 5, 8GB RAM, 256GB SSD',      58999.00,46000.00,18.00, 5.00, 30,'ACTIVE'),
        (5,  1,2,'HP LaserJet Pro MFP',           'SKU-HP-LJP',   'Print/Scan/Copy, 30ppm, wireless',     24999.00,18500.00,18.00, 0.00, 20,'ACTIVE'),
        (6,  1,3,'Annual IT Support Contract',    'SKU-IT-SUP',   '12-month on-site and remote support',  84999.00,60000.00,18.00, 0.00,100,'ACTIVE'),
        (7,  1,3,'Network Infrastructure Setup',  'SKU-NET-INF',  'LAN/WAN design and deployment',       149999.00,110000.00,18.00,5.00, 50,'ACTIVE'),
        (8,  1,4,'Office Chair Ergonomic Pro',    'SKU-OFC-CHR',  'Lumbar support, adjustable armrests',   8999.00, 5500.00,12.00, 0.00, 75,'ACTIVE'),
        (9,  1,4,'Standing Desk 160cm',           'SKU-OFC-DSK',  'Height-adjustable, dual motor',        22999.00,16000.00,18.00, 5.00, 25,'ACTIVE'),
        (10, 1,5,'AWS EC2 Reserved Instance 1yr', 'SKU-AWS-EC2',  't3.medium, 1-year, Linux',             36000.00,30000.00,18.00, 0.00,500,'ACTIVE'),
        (11, 1,5,'Google Cloud Storage 1TB/yr',   'SKU-GCS-1TB',  'Standard class, multi-region',         12000.00, 9000.00,18.00, 0.00,999,'ACTIVE'),
        (12, 1,2,'Cisco Catalyst 2960 Switch',    'SKU-CISCO-SW', '24-port GigE managed switch',          34999.00,27000.00,18.00, 3.00, 15,'ACTIVE'),
        (13, 1,1,'Tally Prime Gold',              'SKU-TALLY-G',  'Multi-user accounting license',        27000.00,21000.00,18.00, 0.00, 60,'ACTIVE'),
        (14, 1,2,'Zebra ZT411 Barcode Printer',   'SKU-ZBR-ZT4',  'Industrial thermal transfer printer',  42500.00,33000.00,18.00, 5.00,  0,'OUT_OF_STOCK'),
        (15, 1,3,'Cybersecurity Audit Service',   'SKU-SEC-AUD',  'Full vulnerability assessment',        74999.00,55000.00,18.00, 0.00, 30,'ACTIVE')
    `);
    console.log('📦 Products seeded (15).');

    // ── INVOICES ──────────────────────────────────────────────────────
    // Live schema status ENUM: DRAFT, PENDING, PAID, OVERDUE  (no CANCELLED)
    // No currency column in live DB
    await conn.query(`
      INSERT INTO invoices
        (id, user_id, client_id, invoice_number, status, issue_date, due_date,
         subtotal, tax, discount, total, notes)
      VALUES
        (1,  1,1, 'INV-2025-001','PAID',    '2025-01-05','2025-01-20', 99990.00,17998.20, 5000.00,112988.20,'Thank you for your business.'),
        (2,  1,2, 'INV-2025-002','PAID',    '2025-01-12','2025-01-27', 58999.00,10619.82, 2950.00, 66668.82,'Net 15 days payment terms.'),
        (3,  1,3, 'INV-2025-003','PENDING', '2025-02-01','2025-02-16',149999.00,26999.82, 7500.00,169498.82,'Network setup project Phase 1.'),
        (4,  1,4, 'INV-2025-004','PAID',    '2025-02-10','2025-02-25', 84999.00,15299.82,    0.00,100298.82,'Annual IT support contract renewal.'),
        (5,  1,5, 'INV-2025-005','OVERDUE', '2025-02-18','2025-03-05', 72999.00,13139.82, 5840.00, 80298.82,'Laptop supply 1 unit.'),
        (6,  1,6, 'INV-2025-006','PENDING', '2025-03-01','2025-03-16', 54999.00, 9899.82,    0.00, 64898.82,'Adobe CC annual subscription.'),
        (7,  1,7, 'INV-2025-007','PAID',    '2025-03-10','2025-03-25', 36000.00, 6480.00,    0.00, 42480.00,'AWS reserved instance 1 year.'),
        (8,  1,8, 'INV-2025-008','PAID',    '2025-03-18','2025-04-02', 27000.00, 4860.00,    0.00, 31860.00,'Tally Prime Gold license.'),
        (9,  1,9, 'INV-2025-009','PENDING', '2025-04-01','2025-04-16', 74999.00,13499.82,    0.00, 88498.82,'Cybersecurity audit Q2 2025.'),
        (10, 1,10,'INV-2025-010','PAID',    '2025-04-08','2025-04-23', 34999.00, 6299.82, 1050.00, 40248.82,'Cisco switch supply.'),
        (11, 1,1, 'INV-2025-011','PAID',    '2025-04-20','2025-05-05', 22999.00, 4139.82, 1150.00, 25988.82,'Standing desk 1 unit.'),
        (12, 1,2, 'INV-2025-012','PENDING', '2025-05-01','2025-05-16',  9999.00, 1799.82,  500.00, 11298.82,'MS Office 365 1 user annual.'),
        (13, 1,3, 'INV-2025-013','OVERDUE', '2025-03-22','2025-04-06', 42500.00, 7650.00, 2125.00, 48025.00,'Zebra barcode printer.'),
        (14, 1,4, 'INV-2025-014','DRAFT',   '2025-05-05','2025-05-20', 12000.00, 2160.00,    0.00, 14160.00,'Google Cloud Storage draft.'),
        (15, 1,5, 'INV-2025-015','PAID',    '2025-05-06','2025-05-21',  8999.00, 1619.82,    0.00, 10618.82,'Ergonomic office chair.')
    `);
    console.log('🧾 Invoices seeded (15).');

    // ── INVOICE ITEMS ─────────────────────────────────────────────────
    // quantity is int in live DB
    await conn.query(`
      INSERT INTO invoice_items (invoice_id, description, quantity, price, total) VALUES
        (1, 'Dell Inspiron 15 Laptop',            1, 72999.00, 72999.00),
        (1, 'Microsoft Office 365 Business',      1,  9999.00,  9999.00),
        (1, 'Annual IT Support Contract',          1, 16992.00, 16992.00),
        (2, 'Lenovo ThinkPad E14',                1, 58999.00, 58999.00),
        (3, 'Network Infrastructure Setup',        1,149999.00,149999.00),
        (4, 'Annual IT Support Contract',          1, 84999.00, 84999.00),
        (5, 'Dell Inspiron 15 Laptop',             1, 72999.00, 72999.00),
        (6, 'Adobe Creative Cloud',               1, 54999.00, 54999.00),
        (7, 'AWS EC2 Reserved Instance 1yr',      1, 36000.00, 36000.00),
        (8, 'Tally Prime Gold',                   1, 27000.00, 27000.00),
        (9, 'Cybersecurity Audit Service',         1, 74999.00, 74999.00),
        (10,'Cisco Catalyst 2960 Switch',          1, 34999.00, 34999.00),
        (11,'Standing Desk 160cm',                1, 22999.00, 22999.00),
        (12,'Microsoft Office 365 Business',      1,  9999.00,  9999.00),
        (13,'Zebra ZT411 Barcode Printer',         1, 42500.00, 42500.00),
        (14,'Google Cloud Storage 1TB/yr',         1, 12000.00, 12000.00),
        (15,'Office Chair Ergonomic Pro',          1,  8999.00,  8999.00)
    `);
    console.log('📋 Invoice items seeded (17).');

    // ── PAYMENTS ──────────────────────────────────────────────────────
    // Live cols: id, invoice_id, amount, payment_date, payment_method, notes
    // (no transaction_id in live DB)
    await conn.query(`
      INSERT INTO payments (invoice_id, amount, payment_date, payment_method, notes) VALUES
        (1,  112988.20,'2025-01-18','Bank Transfer','Full payment received via NEFT'),
        (2,   66668.82,'2025-01-25','UPI',          'Paid via GPay'),
        (4,  100298.82,'2025-02-22','NEFT',         'Annual contract payment'),
        (7,   42480.00,'2025-03-22','Bank Transfer','AWS instance payment'),
        (8,   31860.00,'2025-03-30','Cheque',       'Cheque no. 004521'),
        (10,  40248.82,'2025-04-20','UPI',          'Paid via PhonePe'),
        (11,  25988.82,'2025-05-02','Bank Transfer','Full payment received'),
        (15,  10618.82,'2025-05-06','UPI',          'Instant UPI payment')
    `);
    console.log('💳 Payments seeded (8).');

    // ── PURCHASES ─────────────────────────────────────────────────────
    await conn.query(`
      INSERT INTO purchases (id, user_id, supplier_id, purchase_number, status, total, purchase_date) VALUES
        (1,  1,1,'PO-2025-001','RECEIVED', 580000.00,'2025-01-03'),
        (2,  1,2,'PO-2025-002','RECEIVED', 460000.00,'2025-01-15'),
        (3,  1,4,'PO-2025-003','RECEIVED',  84000.00,'2025-02-01'),
        (4,  1,5,'PO-2025-004','ORDERED',   90000.00,'2025-02-20'),
        (5,  1,3,'PO-2025-005','RECEIVED', 330000.00,'2025-03-05'),
        (6,  1,6,'PO-2025-006','RECEIVED', 185000.00,'2025-03-18'),
        (7,  1,1,'PO-2025-007','ORDERED',  290000.00,'2025-04-02'),
        (8,  1,4,'PO-2025-008','DRAFT',    210000.00,'2025-04-25'),
        (9,  1,5,'PO-2025-009','RECEIVED',  60000.00,'2025-05-01'),
        (10, 1,7,'PO-2025-010','CANCELLED',165000.00,'2025-03-10')
    `);
    console.log('🛒 Purchases seeded (10).');

    // ── INVENTORY LOGS ────────────────────────────────────────────────
    await conn.query(`
      INSERT INTO inventory_logs (product_id, user_id, change_type, quantity, previous_stock, new_stock, notes) VALUES
        (3,  1,'ADD',      50,  0, 50,'Initial stock – PO-2025-001'),
        (4,  1,'ADD',      30,  0, 30,'Initial stock – PO-2025-002'),
        (1,  1,'ADD',     200,  0,200,'License keys received from Microsoft'),
        (3,  1,'SUBTRACT',  5, 50, 45,'Sold to InfraTech – INV-2025-001'),
        (4,  1,'SUBTRACT',  1, 30, 29,'Sold to GlobalSoft – INV-2025-002'),
        (6,  1,'ADD',     100,  0,100,'Annual support plans loaded'),
        (10, 1,'ADD',     500,  0,500,'AWS instances (virtual) added'),
        (5,  1,'ADD',      20,  0, 20,'HP printers received – PO-2025-006'),
        (12, 1,'ADD',      15,  0, 15,'Cisco switches received – PO-2025-005'),
        (12, 1,'SUBTRACT',  1, 15, 14,'Sold to DataBridge – INV-2025-010')
    `);
    console.log('📊 Inventory logs seeded (10).');

    // ── NOTIFICATIONS ─────────────────────────────────────────────────
    await conn.query(`
      INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
        (1,'Invoice Overdue',        'INV-2025-005 from AlphaLogic Corp is 60+ days overdue.',           'WARNING',FALSE),
        (1,'Invoice Overdue',        'INV-2025-013 from DeltaOps Technologies is 31 days overdue.',      'WARNING',FALSE),
        (1,'Payment Received',       'Payment of Rs.10618.82 received for INV-2025-015.',               'SUCCESS',TRUE),
        (1,'Low Stock Alert',        'Zebra ZT411 Barcode Printer is OUT OF STOCK. Reorder required.',   'ERROR',  FALSE),
        (1,'Purchase Order Updated', 'PO-2025-004 from Amazon Web Services is now ORDERED.',             'INFO',   TRUE),
        (1,'New Client Added',       'DataBridge Analytics has been added to your client list.',         'INFO',   TRUE),
        (1,'Payment Received',       'Full payment received for INV-2025-011 from InfraTech Systems.',   'SUCCESS',TRUE),
        (1,'Invoice Created',        'Draft invoice INV-2025-014 created for BluePeak Analytics.',       'INFO',   FALSE),
        (2,'Payment Received',       'OptiFlow Enterprises paid invoice on time.',                       'SUCCESS',FALSE),
        (2,'Low Stock Alert',        'Consulting service slots filling up fast.',                        'WARNING',FALSE)
    `);
    console.log('🔔 Notifications seeded (10).');

    // ── AUDIT LOGS ────────────────────────────────────────────────────
    await conn.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES
        (1,'CREATE','invoice', 1, 'Created INV-2025-001 for InfraTech Systems',   '192.168.1.10'),
        (1,'UPDATE','invoice', 1, 'Status changed PENDING to PAID',               '192.168.1.10'),
        (1,'CREATE','client', 10,'Added new client DataBridge Analytics',         '192.168.1.10'),
        (1,'CREATE','purchase',1,'Created PO-2025-001 from Dell Technologies',    '192.168.1.10'),
        (1,'UPDATE','invoice', 5,'INV-2025-005 marked as OVERDUE',               '10.0.0.5'),
        (1,'CREATE','product',15,'Added product: Cybersecurity Audit Service',    '192.168.1.10'),
        (1,'UPDATE','invoice', 6,'INV-2025-006 status updated',                   '192.168.1.11'),
        (2,'CREATE','client', 11,'Added new client OptiFlow Enterprises',         '10.0.0.8'),
        (3,'UPDATE','product',14,'Zebra printer marked OUT_OF_STOCK',            '10.0.0.9'),
        (4,'CREATE','invoice',12,'Created INV-2025-012 for GlobalSoft India',    '192.168.1.12')
    `);
    console.log('📝 Audit logs seeded (10).');

    await conn.commit();

    console.log('\n🎉 ALL SEED DATA INSERTED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════');
    console.log('  Users          : 4');
    console.log('  Clients        : 12');
    console.log('  Categories     : 7');
    console.log('  Suppliers      : 9');
    console.log('  Products       : 15');
    console.log('  Invoices       : 15');
    console.log('  Invoice Items  : 17');
    console.log('  Payments       : 8');
    console.log('  Purchases      : 10');
    console.log('  Inventory Logs : 10');
    console.log('  Notifications  : 10');
    console.log('  Audit Logs     : 10');
    console.log('═══════════════════════════════════════════');
    console.log('  Login → manjunathdesai920@gmail.com / manju');
    console.log('═══════════════════════════════════════════\n');

  } catch (err) {
    await conn.rollback();
    console.error('\n❌ Seeding FAILED:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
