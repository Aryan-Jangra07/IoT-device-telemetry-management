# IoT Project - Code Navigation


## 💻 Frontend (React Dashboard)

### Core Files
- [App.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/App.jsx) (Routes & Layout configuration)
- [main.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/main.jsx) (App Entry Point)
- [index.css](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/index.css) (Tailwind base)

### Pages
- [Login.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/pages/Login.jsx)
- [Register.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/pages/Register.jsx)
- [Dashboard.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/pages/Dashboard.jsx)
- [AdminPanel.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/pages/AdminPanel.jsx)
- [Analytics.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/pages/Analytics.jsx)
- [MyDevices.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/pages/MyDevices.jsx)
- [Settings.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/pages/Settings.jsx)

### Components
- [Sidebar.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/components/Sidebar.jsx)
- [Navbar.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/components/Navbar.jsx)
- [DeviceCard.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/components/DeviceCard.jsx)
- [DeviceTable.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/components/DeviceTable.jsx)
- [TelemetryChart.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/components/TelemetryChart.jsx)
- [SummaryCard.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/components/SummaryCard.jsx)
- [ProtectedRoute.jsx](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/components/ProtectedRoute.jsx)

### Services & State (Zustand)
- [api.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/services/api.js) (Axios frontend requests)
- [socket.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/services/socket.js) (Real-time telemetry client)
- [deviceStore.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/store/deviceStore.js) (Zustand Global State)
- [auth.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Frontend/src/utils/auth.js) (JWT tokens localstorage logic)

---

## ⚙️ Backend (Node.js & Express)

### Server Entry
- [server.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/server.js) (Express Server & HTTP)

### Controllers (API Logic)
- [deviceController.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/controllers/deviceController.js) (Device CRUD & Influx querying)
- [userController.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/controllers/userController.js) (Auth & Admin endpoints)

### Routes
- [adminRoutes.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/routes/adminRoutes.js)
- [deviceRoutes.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/routes/deviceRoutes.js)
- [userRoutes.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/routes/userRoutes.js)

### Security & Middlewares
- [auth.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/middleware/auth.js) (JWT Verifier Middleware)
- [errorMiddleware.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/middleware/errorMiddleware.js)
- [validation.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/middleware/validation.js) (Zod object validation)

### Database Models & Connections
- [db.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/config/db.js) (MongoDB Connection)
- [influx.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/config/influx.js) (InfluxDB Setup)
- [device.js (Model)](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/models/device.js) (Mongoose Schema)
- [User.js (Model)](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/models/User.js) (Mongoose user schema)

### 📡 Core Services (MQTT, Sockets & Simulation)
- [broker.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/mqtt/broker.js) (Aedes built-in MQTT Broker config)
- [mqttService.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/services/mqttService.js) (Handles topics & saves telemetry to Influx)
- [simulationService.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/services/simulationService.js) (Background simulation logic generating sensor data)
- [publishingService.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/services/publishingService.js) (Pushes MQTT payload correctly)
- [influxService.js](file:///c:/Users/aryan/OneDrive/Desktop/IoT_Project/Backend/services/influxService.js) (Writes raw sensor points to Timeseries DB)
