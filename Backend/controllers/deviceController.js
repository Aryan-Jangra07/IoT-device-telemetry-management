const Device = require('../models/device');
const crypto = require('crypto');
const { publishCommand } = require('../services/mqttService');
const { readTelemetry } = require('../services/influxService');
const { startSimulation, stopSimulation } = require('../services/simulationService');
const { emitDeviceStatus } = require('../services/publishingService');

const getTelemetry = async (req, res) => {
  try {
    const { id } = req.params;
    const { range = '-1h' } = req.query;
    const device = await Device.findOne({ deviceId: id });
    if (!device) return res.status(404).json({ message: 'Device not found' });
    if (req.user.role !== 'admin' && String(device.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const data = await readTelemetry(id, range);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const registerDevice = async (req, res) => {
  try {
    const { name, type, config } = req.body;
    if (!name) return res.status(400).json({ message: 'Device name is required' });

    const validTypes = ['Warehouse Monitoring', 'Smart Agriculture', 'Smart Home', 'Cold Storage', 'Power Monitoring', 'Server Room'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "This device type is not supported in the current system." });
    }

    // Auto-generate a secure and unique device ID
    const deviceId = crypto.randomUUID();

    // Generate secure token for the device
    const token = crypto.randomBytes(32).toString('hex');
    
    const device = await Device.create({
      deviceId,
      name,
      type,
      owner: req.user.id,
      token,
      config: config || {}
    });

    // Start simulation immediately for this new device
    startSimulation(deviceId);

    res.status(201).json({ 
      message: 'Device registered successfully', 
      device: {
        deviceId: device.deviceId,
        name: device.name,
        type: device.type,
        token: device.token, // Return token only once during registration
        status: device.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDevices = async (req, res) => {
  try {
    // Only fetch logged-in user's devices
    const devices = await Device.find({ owner: req.user.id }).lean();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAdminDevices = async (req, res) => {
  try {
    // Fetch all devices populated with owner details
    const devices = await Device.find().populate('owner', 'name email').lean();

    // Compute basic analytics
    const stats = await Device.aggregate([
      {
        $group: {
          _id: "$owner",
          deviceCount: { $sum: 1 }
        }
      }
    ]);

    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status === 'online').length;
    const offlineDevices = totalDevices - onlineDevices;
    const uniqueUsers = new Set(devices.map(d => String(d.owner?._id))).size;

    res.json({
      devices,
      stats: {
        totalDevices,
        onlineDevices,
        offlineDevices,
        uniqueUsers,
        aggregation: stats
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const sendCommand = async (req, res) => {
  try {
    const { id } = req.params;
    const { command, payload } = req.body;

    const device = await Device.findOne({ deviceId: id });
    if (!device) return res.status(404).json({ message: 'Device not found' });

    // Only Owner or Admin can send commands
    if (req.user.role !== 'admin' && String(device.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (command === 'POWER_OFF') {
      device.status = 'offline';
      await device.save();
      stopSimulation(device.deviceId);
      emitDeviceStatus(device.deviceId, 'offline');
    } else if (command === 'POWER_ON') {
      device.status = 'online';
      await device.save();
      startSimulation(device.deviceId);
      emitDeviceStatus(device.deviceId, 'online');
    }

    publishCommand(device.deviceId, command, payload);
    res.json({ message: 'Command sent successfully', deviceId: id, command, status: device.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await Device.findOne({ deviceId: id });
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Only Owner or Admin can delete
    if (req.user.role !== 'admin' && String(device.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this device' });
    }

    await Device.deleteOne({ deviceId: id });
    
    // Clean up running interval for simulation
    stopSimulation(id);

    res.json({ message: 'Device removed successfully', deviceId: id });
  } catch (error) {
    console.error('Delete Device Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const devices = await Device.find({ owner: req.user.id });
    const deviceIds = devices.map(d => d.deviceId);

    // Simple aggregation: count total data points or avg metrics if possible
    // For now, let's just return device status counts and total device count
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status === 'online').length;
    const offlineDevices = totalDevices - onlineDevices;

    res.json({
      totalDevices,
      onlineDevices,
      offlineDevices,
      throughput: '1.2k/min', // Mocked for now as InfluxDB aggregation needs more complex queries
      uptime: '99.9%' // Mocked
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerDevice, getDevices, getAdminDevices, getTelemetry, sendCommand, deleteDevice, getAnalytics };
