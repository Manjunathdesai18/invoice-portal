# Smart Invoice & Billing Portal - Enterprise Edition

![SmartInvoice](https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)

# 🧾 Invoicex — Enterprise AI-Powered Billing & Financial Portal

<div align="center">

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A scalable, multi-tenant billing management platform engineered with React, Express, and MySQL. Features dynamic PDF generation, automated email delivery, real-time analytics, and OpenAI GPT-4 assisted financial intelligence.

</div>

---

## ✨ Core Capabilities

### 💼 Invoicing & Client Operations
- **Interactive Invoice Builder**: Real-time tax math, discounts, unit quantities, and multi-currency formats.
- **Client Directory**: Manage customer contacts, billing addresses, and payment records.
- **PDF Generation Engine**: Programmatic vector PDF invoices generated on-the-fly using `PDFKit`.
- **Automated Dispatch**: Instant customer invoice delivery via `Nodemailer` with customizable HTML email templates.
- **Data Exporting**: One-click download of billing records in Excel (`.xlsx`) via `ExcelJS` and CSV via `json2csv`.

### 🤖 AI Financial Co-Pilot (OpenAI)
- **Smart Item Description**: Autogenerates work summaries and itemized invoice descriptions from brief prompts.
- **Revenue Prediction**: Analyzes historic invoice cash flow to predict next quarter's revenue trajectory.

---

## ⚙️ Environment Variables

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=invoice_portal
DB_PORT=3306

# Authentication
JWT_SECRET=super_secret_jwt_random_key_64_chars
JWT_EXPIRES_IN=30d

# SMTP Settings
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_pass

# OpenAI Integration
OPENAI_API_KEY=sk-your_openai_api_key

FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Installation & Local Setup

### 1. Initialize Database
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS invoice_portal;"
mysql -u root -p invoice_portal < backend/database.sql
```

### 2. Start Backend
```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:5000
```

### 3. Start Frontend
```bash
cd ../frontend
npm install
npm run dev
# Client running at http://localhost:5173
```

---

## 📡 REST API Documentation

### Auth & User (`/api/auth`)
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/auth/register` | Register new organization user |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Retrieve authenticated profile |

### Invoices (`/api/invoices`)
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/invoices` | List invoices with pagination & status filters |
| `POST` | `/api/invoices` | Create invoice with dynamic line items |
| `GET` | `/api/invoices/:id/pdf` | Stream or download rendered PDF file |
| `POST` | `/api/invoices/:id/email` | Trigger automated email with attached PDF |

### AI Financial Assistant (`/api/ai`)
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/ai/generate-description` | Autogenerate line-item scope with GPT-4 |
| `GET` | `/api/ai/predict-revenue` | Compute forecast modeling on past invoices |

---

## 👨‍💻 Author

**Manjunath Desai**
- GitHub: [@Manjunathdesai18](https://github.com/Manjunathdesai18)
- Email: manjunathdesai920@gmail.com

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
