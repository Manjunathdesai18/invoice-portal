# Smart Invoice & Billing Portal - Enterprise Edition

![SmartInvoice](https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)

A professional, industry-level SaaS application for business invoice and billing management. Built with modern web technologies to deliver a premium user experience, enterprise-grade architecture, and advanced AI-powered analytics. Designed as an **A+ Grade Final Year Project**.

## 🚀 Features

- **Premium UI/UX:** Glassmorphism, modern gradients, Framer Motion animations, dark mode, and responsive layout.
- **AI Integration (OpenAI API):** Smart invoice line item description generator, predictive revenue analytics, and personalized financial insights.
- **Advanced Document Generation:** Generate, download, and email PDF invoices directly. Export reports to Excel and CSV.
- **Real-Time Dashboards:** Interactive Recharts graphics, KPI tracking, and Socket.io powered live notifications.
- **Robust Security:** JWT authentication, Helmet.js for HTTP headers, express-rate-limit, express-mongo-sanitize, XSS protection, and role-based access control.
- **Automated Workflows:** Send professional invoice emails directly to clients using Nodemailer.
- **Comprehensive Audit Logs:** Tracks and stores all activity logs for enhanced traceability and accountability.

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, React Hook Form, Zod.
- **Backend:** Node.js, Express.js, Socket.io, PDFKit, ExcelJS, OpenAI, Nodemailer.
- **Database:** MySQL.
- **DevOps:** Docker ready, Deployment ready for Vercel, Render/Railway.

## 📁 Project Structure
```
.
├── backend/            # Express REST API
│   ├── config/         # Database connection
│   ├── controllers/    # Request handlers (auth, ai, document, etc.)
│   ├── middleware/     # Auth & validation
│   ├── models/         # (If using ORM, otherwise schemas)
│   ├── routes/         # API endpoints
│   ├── services/       # AI, Email, Document logic
│   ├── .env            # Environment variables
│   ├── database.sql    # MySQL Schema
│   └── server.js       # Server entry point
│
└── frontend/           # React + Vite Application
    ├── src/
    │   ├── components/ # Reusable UI elements
    │   ├── context/    # Global state (AuthContext)
    │   ├── layouts/    # DashboardLayout
    │   ├── pages/      # Views (Dashboard, Invoices, Clients, LandingPage, Reports)
    │   ├── services/   # Axios API configurations
    │   ├── App.jsx     # Main React router setup
    │   └── main.jsx    # React DOM entry
    ├── tailwind.config.js
    └── index.css       # Global styles with CSS variables
```

## 📦 Environment Setup

### Backend Environment Variables (`backend/.env`)
Create a `.env` file in the `backend` directory:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=invoice_portal
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=sk-your_openai_api_key
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_pass
```

### Frontend Environment Variables (`frontend/.env`)
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

## 🏗️ Installation & Running Locally

1. **Database Setup**
   - Create a MySQL database named `invoice_portal`.
   - Run the SQL queries found in `backend/database.sql` to generate the schema.

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm start
   # Server runs on http://localhost:5000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   # App runs on http://localhost:5173
   ```

## 📖 REST API Documentation

### Authentication endpoints
- `POST /api/auth/register`: Register a new user (admin/staff/accountant).
- `POST /api/auth/login`: Authenticate and receive JWT token.
- `GET /api/auth/me`: Get current logged in user details.

### Client endpoints (Requires Auth)
- `GET /api/clients`: Retrieve all clients.
- `POST /api/clients`: Add a new client.
- `PUT /api/clients/:id`: Update client details.
- `DELETE /api/clients/:id`: Delete a client.

### Invoice & Document endpoints (Requires Auth)
- `GET /api/invoices`: Retrieve all invoices.
- `GET /api/invoices/:id`: Get a specific invoice by ID.
- `POST /api/invoices`: Create a new invoice with line items.
- `PUT /api/invoices/:id`: Update invoice status.
- `DELETE /api/invoices/:id`: Delete an invoice.
- `GET /api/invoices/:id/pdf`: Download the invoice as a PDF document.
- `POST /api/invoices/:id/email`: Send the PDF invoice via email to the client.

### Dashboard & Analytics (Requires Auth)
- `GET /api/dashboard/stats`: Retrieve KPI statistics, pending amounts, and recent activity.

### AI Endpoints (Requires Auth)
- `POST /api/ai/generate-description`: Generate invoice item descriptions using GPT-4.
- `GET /api/ai/predict-revenue`: Predict next month's revenue based on historical data.
- `GET /api/ai/smart-advice`: Fetch actionable financial insights using AI.

## 🚀 Deployment Guide

### Database (PlanetScale / Railway / Aiven)
1. Create a managed MySQL database instance.
2. Execute the `backend/database.sql` script to initialize the schema.
3. Obtain the connection string.

### Backend (Render / Railway)
1. Create a new Web Service.
2. Connect your GitHub repository and point to the `backend` folder as the root directory.
3. Set the build command: `npm install`
4. Set the start command: `npm start`
5. Configure all necessary Environment Variables in the platform's dashboard.

### Frontend (Vercel)
1. Create a new project on Vercel.
2. Connect your repository and select the `frontend` folder as the Root Directory.
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add the `VITE_API_URL` environment variable pointing to your deployed Backend URL.

---
*Built with ❤️ for a modern enterprise-grade experience.*
