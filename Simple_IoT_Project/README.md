# Simple IoT Smart Monitoring System

This is a beginner-friendly full-stack IoT Smart Monitoring System for college submission.

## Features
- **IoT Simulation**: Python script generating random but realistic sensor data for Temperature, Humidity, and Moisture every 2-5 seconds.
- **MQTT Integration**: Uses Mosquitto MQTT broker to publish and subscribe to sensor data.
- **Backend (Node.js/Express)**: Subscribes to MQTT topics, saves data to a local MongoDB database, and pushes real-time updates to the frontend using Socket.IO.
- **Frontend (React.js)**: A beautiful, modern dashboard showing live sensor values, history charts (Recharts), and alert warnings if conditions exceed safe thresholds.

---

## 🛠 Prerequisites
You need the following installed on your machine:
1. **Node.js** (v16+)
2. **Python** (v3+)
3. **MongoDB Server & MongoDB Compass**
4. **Mosquitto MQTT Broker**

---

## 🚀 Step-by-Step Setup Instructions

### 1. Start MongoDB
Ensure your local MongoDB instance is running. You can connect to it using MongoDB Compass at `mongodb://localhost:27017`. The backend will automatically create the database `iot_db` and collection `sensor_data`.

### 2. Start Mosquitto MQTT Broker
Ensure Mosquitto is installed and running on its default port `1883`. 
- On Windows: Open Services app and ensure "Mosquitto Broker" is running.

### 3. Setup and Run the Backend
Open a new terminal and navigate to the backend folder:
```bash
cd backend
npm install
node server.js
```
*The server will run on http://localhost:5000 and connect to MQTT and MongoDB.*

### 4. Setup and Run the Frontend
Open another terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
npm run dev
```
*Open your browser to the URL shown in the terminal (usually http://localhost:5173).*

### 5. Run the IoT Simulation
Open a third terminal and navigate to the simulation folder:
```bash
cd iot_simulation
pip install -r requirements.txt
python sensor_sim.py
```
*You should see logs indicating data is being published to MQTT. Check the React dashboard to see the live data appearing!*

---

## 🏗 Project Structure
- `backend/`: Node.js, Express, Socket.IO, MQTT subscriber, Mongoose.
- `frontend/`: React (Vite), Recharts, TailwindCSS/custom modern CSS.
- `iot_simulation/`: Python script simulating hardware sensors.
