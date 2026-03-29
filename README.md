# Asset Management System

A comprehensive asset management solution featuring a mobile frontend and a unified Node.js backend.

## 🚀 Project Overview

This project consists of two main components:
1.  **Frontend (Mobile)**: Built with Expo/React Native.
2.  **Unified Backend**: Node.js/Express service for core business logic, user management, and specialized data processing (PDFs/Trading).

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Expo / React Native
- **Navigation**: React Navigation
- **UI Components**: React Native Paper, SVG, Charts
- **State Management**: React Context API
- **API Client**: Axios

### Unified Backend (Node.js)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT, BcryptJS
- **Services**: PDF Generation (pdfkit), Market Data (CoinGecko API)

---

## 📂 Project Structure

```text
asset/
├── AssetManagementMobile/   # Expo Mobile Frontend
├── backend/                # Unified Node.js Express Backend
└── README.md              # Project Documentation
```

---

## ⚙️ Setup Instructions

### 1. Frontend Setup
```bash
cd AssetManagementMobile
npm install
npm start
```

### 2. Backend Setup (Node.js)
```bash
cd backend
npm install
# Configure .env file
npm run dev
```

---

## 📝 Features
- **Asset Scanning**: Integrated QR/Barcode scanning for assets.
- **Dashboard**: Real-time asset statistics, depreciation tracking, and charts.
- **Investment Tracking**: Manage and monitor asset investments with live market data.
- **Wallet System**: Deposit funds and execute simulator trades.
- **User Management**: Secure authentication and profile management.
- **Financial Reports**: Automated PDF report generation with AI insights.
