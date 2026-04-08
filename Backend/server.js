// ================= IMPORTS =================
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { initMQTT } = require("./services/mqttService");
const { initMQTTClient } = require("./services/mqtt.service");
const userRoutes = require("./routes/userRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const adminRoutes = require("./routes/adminRoutes");

// ================= APP INIT =================
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// ================= DATABASE CONNECT =================
connectDB();

// ================= ROUTES =================
app.use("/api/users", userRoutes);
app.use("/api/devices", deviceRoutes); 
app.use("/api/admin", adminRoutes); 

// Home route
app.get("/", (req, res) => {
  res.send("IoT Backend API Running 🚀");
});

// ================= SERVER & MQTT START =================
const PORT = process.env.PORT || 5000;

initMQTT(); // Start Internal MQTT Broker
initMQTTClient(); // Connect to Public MQTT Broker (Step 1)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});