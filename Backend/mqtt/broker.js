const { Aedes } = require('aedes');
const aedes = new Aedes();
const server = require('net').createServer(aedes.handle);
const Device = require('../models/device');
const { writeRealTelemetry } = require('../utils/telemetry');

// Authentication Hook
aedes.authenticate = async (client, username, password, callback) => {
  try {
    if (!username || !password) {
      return callback(null, false);
    }
    const device = await Device.findOne({ deviceId: username });
    if (!device) {
      return callback(null, false);
    }
    const passStr = password.toString();
    if (device.token !== passStr) {
      return callback(null, false);
    }
    
    // Auth success - attach device identity to client
    client.deviceId = device.deviceId;
    
    // Set status online
    Device.updateOne({ deviceId: client.deviceId }, { status: 'online' }).exec();
    
    callback(null, true);
  } catch (error) {
    callback(error, false);
  }
};

// Client disconnected hook
aedes.on('clientDisconnect', (client) => {
  if (client.deviceId) {
    Device.updateOne({ deviceId: client.deviceId }, { status: 'offline' }).exec();
  }
});

// Authorize Publish
aedes.authorizePublish = (client, packet, callback) => {
  if (!client.deviceId) return callback(new Error('Unauthorized')); // Drop unidentified connections
  
  const allowedTopic = `device/${client.deviceId}/telemetry`;
  if (packet.topic === allowedTopic) {
    return callback(null);
  }
  return callback(new Error('Topic not allowed'));
};

// Authorize Subscribe
aedes.authorizeSubscribe = (client, subscription, callback) => {
  if (!client.deviceId) return callback(new Error('Unauthorized'));
  
  const allowedTopic = `device/${client.deviceId}/command`;
  if (subscription.topic === allowedTopic) {
    return callback(null, subscription);
  }
  return callback(new Error('Topic not allowed'));
};

// Intercept incoming published messages to route to InfluxDB
aedes.on('publish', (packet, client) => {
  if (client && packet.topic.endsWith('/telemetry')) {
    try {
      const payloadString = packet.payload.toString();
      const data = JSON.parse(payloadString);
      // Data expected: { temperature, humidity, voltage }
      writeRealTelemetry(client.deviceId, data);
    } catch (e) {
      console.error('Failed to parse telemetry payload:', e.message);
    }
  }
});

const startBroker = (port = 1883) => {
  server.listen(port, () => {
    console.log(`MQTT Aedes Broker running on port ${port} 📡`);
  });
};

module.exports = { aedes, startBroker };
