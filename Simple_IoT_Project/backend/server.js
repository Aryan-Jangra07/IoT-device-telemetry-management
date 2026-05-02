require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const { Server } = require('socket.io');

const SensorData = require('./models/SensorData');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ FATAL: MongoDB Connection Error:', err.message);
    process.exit(1); // Exit if we can't connect to DB
  });

// State to hold latest sensor readings before saving to DB
let currentData = {
  temperature: null,
  humidity: null,
  moisture: null
};

// MQTT Setup
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL);

mqttClient.on('connect', () => {
  console.log('✅ Connected to MQTT Broker');
  mqttClient.subscribe('/sensor/temperature');
  mqttClient.subscribe('/sensor/humidity');
  mqttClient.subscribe('/sensor/moisture');
});

mqttClient.on('message', async (topic, message) => {
  const value = parseFloat(message.toString());
  
  // Ignore invalid payloads safely
  if (isNaN(value)) {
    console.warn(`⚠️ Invalid payload received on ${topic}: ${message.toString()}`);
    return;
  }

  if (topic === '/sensor/temperature') currentData.temperature = value;
  if (topic === '/sensor/humidity') currentData.humidity = value;
  if (topic === '/sensor/moisture') currentData.moisture = value;

  // Emit real-time data to frontend dashboard
  io.emit('sensor_update', currentData);
});

// Save to MongoDB periodically (e.g., every 5 seconds)
setInterval(async () => {
  // Only save if ALL sensors have reported valid data
  if (currentData.temperature === null || currentData.humidity === null || currentData.moisture === null) {
    return;
  }

  try {
    const newData = new SensorData({
      temperature: currentData.temperature,
      humidity: currentData.humidity,
      moisture: currentData.moisture
    });
    await newData.save();
    // console.log('💾 Data saved to MongoDB', currentData);
  } catch (error) {
    console.error('Error saving to MongoDB', error);
  }
}, 5000);

// API Route to fetch historical data for charts
app.get('/api/history', async (req, res) => {
  try {
    // Get last 20 records for the chart
    const data = await SensorData.find().sort({ timestamp: -1 }).limit(20);
    res.json(data.reverse()); // Reverse to get chronological order
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

io.on('connection', (socket) => {
  console.log('📱 Frontend client connected via Socket.io');
  // Send current data immediately upon connection
  socket.emit('sensor_update', currentData);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
