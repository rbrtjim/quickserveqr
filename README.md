# QuickServe QR 🍽️

A QR-based restaurant ordering platform.

- **Frontend**: Next.js 14 · TypeScript · Tailwind CSS
- **Backend**: ASP.NET Core 8 Web API · SignalR
- **Database**: SQLite (zero-config, file-based)

## Quick Start

### 1. Start Backend
```bash
cd backend/QuickServeQR.API
dotnet restore
dotnet run
```
API runs at **http://localhost:5139** | Swagger at **http://localhost:5139/swagger**

### 2. Start Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
App runs at **http://localhost:3000**

## Default Credentials

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@quickserve.com     | Admin123!   |
| Kitchen | kitchen@quickserve.com   | Kitchen123! |

## Features

- ✅ QR Table Scanning
- ✅ Digital Menu with categories, search, tags
- ✅ Cart & Ordering with special instructions
- ✅ Real-time Kitchen Dashboard (SignalR)
- ✅ Order Status Tracking (live updates)
- ✅ Admin Dashboard with Analytics
- ✅ Payment Processing
- ✅ Menu Management (CRUD)
- ✅ Table Management

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
