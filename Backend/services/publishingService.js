const { writeTelemetry } = require('./influxService');

let ioInstance = null;

/**
 * Initialize Socket.io instance for publishing
 */
const setIoInstance = (io) => {
  ioInstance = io;
  console.log('[INFO] Publishing Service initialized with Socket.io');
};

/**
 * Emit device status change to Socket.io
 * @param {string} deviceId
 * @param {string} status - 'online' | 'offline'
 */
const emitDeviceStatus = (deviceId, status) => {
  if (ioInstance) {
    ioInstance.emit(`deviceStatus/${deviceId}`, {
      deviceId,
      status,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Publish telemetry to both InfluxDB and real-time Socket.io
 * @param {string} deviceId 
 * @param {object} payload - { temperature, humidity, voltage, status }
 */
const publishTelemetry = (deviceId, payload) => {
  try {
    // 1. Store in Time Series Database (InfluxDB)
    try {
      writeTelemetry(deviceId, payload);
    } catch (dbErr) {
      console.error(`[ERROR] Influx write sync error:`, dbErr.message);
    }

    // 2. Emit to Socket.io for Real-time Dashboard
    if (ioInstance) {
      ioInstance.emit(`telemetry/${deviceId}`, {
        deviceId,
        ...payload,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error(`[ERROR] Publishing Service Error for ${deviceId}:`, err.message);
  }
};

module.exports = {
  setIoInstance,
  emitDeviceStatus,
  publishTelemetry
};
