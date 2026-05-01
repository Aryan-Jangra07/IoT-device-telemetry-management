import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Thermometer, Droplets, CloudRain, AlertTriangle } from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

const Dashboard = () => {
  const [currentData, setCurrentData] = useState({
    temperature: null,
    humidity: null,
    moisture: null
  });
  
  const [isConnected, setIsConnected] = useState(false);
  
  const [historyData, setHistoryData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch initial history
    fetch(`${SOCKET_URL}/api/history`)
      .then(res => res.json())
      .then(data => {
        // Format timestamp for chart
        const formattedData = data.map(d => ({
          ...d,
          time: new Date(d.timestamp).toLocaleTimeString()
        }));
        setHistoryData(formattedData);
      })
      .catch(err => console.error("Error fetching history:", err));

    // Socket.io connection
    const socket = io(SOCKET_URL);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', () => setIsConnected(false));

    socket.on('sensor_update', (data) => {
      setCurrentData(data);
      
      // Add to history for chart (keep last 20)
      setHistoryData(prev => {
        const newPoint = { 
          ...data, 
          time: new Date().toLocaleTimeString() 
        };
        const newHistory = [...prev, newPoint];
        if (newHistory.length > 20) return newHistory.slice(newHistory.length - 20);
        return newHistory;
      });

      // Check for alerts based on current data
      const newAlerts = [];
      if (data.temperature > 40) {
        newAlerts.push(`Critical Temperature Alert: ${data.temperature}°C exceeds safe limit of 40°C!`);
      }
      if (data.moisture < 20) {
        newAlerts.push(`Critical Moisture Alert: Soil moisture is at ${data.moisture}%, below 20% minimum!`);
      }
      setAlerts(newAlerts);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div className="status-indicator" style={{ 
          background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          color: isConnected ? 'var(--accent-moist)' : 'var(--alert-border)' 
        }}>
          <div className="status-dot" style={{ 
            backgroundColor: isConnected ? 'var(--accent-moist)' : 'var(--alert-border)', 
            boxShadow: isConnected ? '0 0 10px var(--accent-moist)' : 'none', 
            animation: isConnected ? 'pulse 2s infinite' : 'none' 
          }}></div>
          {isConnected ? 'System Online' : 'Backend Disconnected'}
        </div>
      </div>
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="alerts-container">
          {alerts.map((alert, idx) => (
            <div key={idx} className="alert">
              <AlertTriangle size={24} />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-icon-wrapper temp-icon">
            <Thermometer size={32} />
          </div>
          <div className="metric-info">
            <h3>Temperature</h3>
            <div className="value">
              {currentData.temperature !== null ? currentData.temperature.toFixed(1) : '--'} <span className="unit">{currentData.temperature !== null ? '°C' : ''}</span>
            </div>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-wrapper hum-icon">
            <CloudRain size={32} />
          </div>
          <div className="metric-info">
            <h3>Humidity</h3>
            <div className="value">
              {currentData.humidity !== null ? currentData.humidity.toFixed(1) : '--'} <span className="unit">{currentData.humidity !== null ? '%' : ''}</span>
            </div>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-wrapper moist-icon">
            <Droplets size={32} />
          </div>
          <div className="metric-info">
            <h3>Soil Moisture</h3>
            <div className="value">
              {currentData.moisture !== null ? currentData.moisture.toFixed(1) : '--'} <span className="unit">{currentData.moisture !== null ? '%' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="card">
          <div className="chart-header">
            <h3>Live Telemetry Feed</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f43f5e" strokeWidth={3} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="moisture" name="Moisture (%)" stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
