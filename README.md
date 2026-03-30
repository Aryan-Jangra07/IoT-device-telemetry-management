# 🚀 IoT Device Telemetry Management

A comprehensive full-stack IoT device telemetry management system. This application provides a platform to manage connected IoT devices, collect real-time telemetry data via MQTT, store it securely, and visualize it on a modern React dashboard.

## 🔥 Features

### Backend (Node.js)
- **Real-time MQTT Broker**: Integrated Aedes MQTT broker for device telemetry ingestion.
- **RESTful API**: Complete REST API for device metadata and user management (Swagger documented).
- **Secure Authentication**: JWT-based user authentication and Role-Based Access Control (RBAC).
- **Dual Database Architecture**: 
  - MongoDB for structured data (device metadata, users).
  - InfluxDB for high-speed time-series telemetry data (temperature, humidity, etc.).
- **Security**: Rate limiting, Helmet for HTTP headers, and CORS enabled.

### Frontend (React + Vite)
- **Modern Dashboard**: Visually appealing UI built with Tailwind CSS and React.
- **Real-time Data Visualization**: Dynamic charts using Recharts.
- **Responsive Design**: Fully responsive layout optimized for all device sizes.
- **Client-Side Routing**: Handled seamlessly via React Router.
- **Authentication Flow**: Secure login, registration, and protected routes.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **IoT Protocol**: MQTT (Aedes, MQTT.js)
- **Databases**: 
  - MongoDB (via Mongoose)
  - InfluxDB (via `@influxdata/influxdb-client`)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **API Documentation**: Swagger (OpenAPI)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance running
- InfluxDB instance running

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd IoT-device-telemetry-management
   ```

2. **Setup Backend:**
   ```bash
   cd Backend
   npm install
   # Create a .env file based on environment variables needed (MongoDB URI, InfluxDB details, JWT Secret, etc.)
   npm start
   ```

3. **Setup Frontend:**
   ```bash
   cd ../Frontend
   npm install
   # Configure environment variables if needed (e.g., API base URL)
   npm run dev
   ```

---

## 📡 Key Endpoints & Services

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **Swagger Documentation**: `http://localhost:5000/api-docs`
- **MQTT Broker**: Typically runs on `mqtt://localhost:1883`

*(Note: Adjust ports based on your specific `.env` configuration)*