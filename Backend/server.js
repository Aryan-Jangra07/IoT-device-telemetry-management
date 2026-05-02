// ================= IMPORTS =================
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");

const connectDB = require("./config/db");
const { initMQTT } = require("./services/mqttService");
const { setIoInstance } = require("./services/publishingService");
const { startAllActiveDevices } = require("./services/simulationService");

const userRoutes = require("./routes/userRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorHandler = require("./middleware/errorMiddleware");

// ================= APP INIT =================
const app = express();
const server = http.createServer(app);

// Production-ready CORS
// If FRONTEND_URL is not set, use 'true' to dynamically reflect the requested origin.
// Using '*' with credentials=true causes browsers to block the request.
const allowedOrigin = process.env.FRONTEND_URL || true; 
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

// Explicit Request Tracing for Production Debugging
app.use((req, res, next) => {
  console.log(`[API TRACE] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api/", limiter);

// ================= DATABASE CONNECT =================
connectDB().then(() => {
  // After DB connects, bootstrap simulations
  startAllActiveDevices();
});

// ================= ROUTES =================
app.use("/api/users", userRoutes);
app.use("/api/devices", deviceRoutes); 
app.use("/api/admin", adminRoutes); 

// Home route
app.get("/", (req, res) => {
  res.send("IoT Backend API Running");
});

// ================= ERROR HANDLING =================
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Set the global IO instance for the backend publishing service
setIoInstance(io);

// Initialize MQTT with Socket.io instance
initMQTT(1883, io);

server.listen(PORT, () => {
  console.log(`[INFO] Server running on port ${PORT}`);
  console.log(`[INFO] WebSocket enabled and listening`);
});