const { Aedes } = require('aedes');
const aedes = new Aedes();
const net = require('net');
const Device = require('../models/device');
const { publishTelemetry } = require('./publishingService');

let ioInstance = null;

/**
 * Initialize MQTT Broker and Hooks
 */
const initMQTT = (port = 1883, io = null) => {
  ioInstance = io;
  const server = net.createServer(aedes.handle);

  // Authentication: Validate deviceId and token
  aedes.authenticate = async (client, username, password, callback) => {
    try {
      if (!username || !password) return callback(null, false);
      
      const deviceId = username;
      const deviceToken = password.toString();

      const device = await Device.findOne({ deviceId });
      if (!device || device.token !== deviceToken) {
        console.warn(`[WARN] Unauthorized connection attempt: ${deviceId}`);
        return callback(null, false);
      }

      client.deviceId = device.deviceId;
      // Mark device as online in MongoDB
      await Device.updateOne({ deviceId: device.deviceId }, { status: 'online' });
      
      console.log(`[INFO] Device Connected: ${client.deviceId}`);
      callback(null, true);
    } catch (error) {
      console.error('MQTT Auth Error:', error);
      callback(error, false);
    }
  };

  // Disconnect Hook
  aedes.on('clientDisconnect', async (client) => {
    if (client.deviceId) {
      await Device.updateOne({ deviceId: client.deviceId }, { status: 'offline' });
      console.log(`[INFO] Device Disconnected: ${client.deviceId}`);
    }
  });

  // Telemetry Subscription & Processing
  aedes.on('publish', (packet, client) => {
    if (client && packet.topic === `device/${client.deviceId}/telemetry`) {
      try {
        const payload = JSON.parse(packet.payload.toString());
        
        // Single funnel through our new publishing service
        publishTelemetry(client.deviceId, payload);

      } catch (err) {
        console.error('MQTT Payload Parse Error:', err.message);
      }
    }
  });

  server.listen(port, () => {
    console.log(`[INFO] MQTT Broker running on port ${port}`);
  });
};

const publishCommand = (deviceId, command, payload) => {
  const topic = `device/${deviceId}/command`;
  const message = JSON.stringify({ command, payload, timestamp: Date.now() });
  
  aedes.publish({ topic, payload: message }, (err) => {
    if (err) console.error(`Failed to publish command to ${deviceId}:`, err);
  });
};

module.exports = { initMQTT, publishCommand };
