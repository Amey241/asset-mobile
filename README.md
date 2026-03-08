# Asset Management System

A comprehensive asset management solution featuring a mobile frontend, a Node.js management backend, and a FastAPI service for advanced processing.

## 🚀 Project Overview

This project consists of three main components:
1.  **Frontend (Mobile)**: Built with Expo/React Native.
2.  **Management Backend**: Node.js/Express service for core business logic and user management.
3.  **Processing Service**: FastAPI service for specialized data processing and PDF generation.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Expo / React Native
- **Navigation**: React Navigation
- **UI Components**: React Native Paper, SVG, Charts
- **State Management**: React Context API
- **API Client**: Axios

### Management Backend (Node.js)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT, BcryptJS

### Processing Service (FastAPI)
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Motor)
- **Utilities**: PDF Generation

---

## 📂 Project Structure

```text
asset/
├── AssetManagementMobile/   # Expo Mobile Frontend
├── backend/                # Node.js Express Backend
├── fastapi-backend/        # Python FastAPI Processing Service
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

### 2. Management Backend (Node.js)
```bash
cd backend
npm install
# Configure .env file
npm run dev
```

### 3. Processing Service (FastAPI)
```bash
cd fastapi-backend
# Set up virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Install requirements (ensure you have fastapi, uvicorn, motor, etc.)
pip install fastapi uvicorn motor pydantic
# Run the server
uvicorn main:app --reload
```

---

## 📝 Features
- **Asset Scanning**: Integrated QR/Barcode scanning for assets.
- **Dashboard**: Real-time asset statistics and charts.
- **Investment Tracking**: Manage and monitor asset investments.
- **User Management**: Secure authentication and profile management.
- **PDF Reports**: Automated generation of asset reports.
