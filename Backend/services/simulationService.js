const { publishTelemetry } = require('./publishingService');
const Device = require('../models/device');

// Track interval IDs to prevent memory leaks and duplicates
const activeSimulations = new Map();

// Helper to generate a realistic random walk
// Mutates the current value by a slight random amount within bounds
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const smoothRandomWalk = (current, min, max, stepMax) => {
  const step = (Math.random() * stepMax * 2) - stepMax;
  let next = current + step;
  if (next < min) next = min + (Math.random() * stepMax);
  if (next > max) next = max - (Math.random() * stepMax);
  return Number(clamp(next, min, max).toFixed(2));
};

// State per device to maintain smooth transitions and anomaly modes
const deviceState = new Map();

/**
 * Start a telemetry simulation for a specific device.
 * @param {string} deviceId 
 */
const startSimulation = async (deviceId) => {
  if (activeSimulations.has(deviceId)) {
    console.log(`[INFO] Simulation already running for ${deviceId}`);
    return;
  }

  try {
    await Device.updateOne({ deviceId }, { status: 'online' });
  } catch (err) {
    console.error('Failed to update device status to online:', err);
  }

  // Initialize starting state
  deviceState.set(deviceId, {
    temperature: 25.0, // 15-50
    humidity: 60.0,    // 20-90
    voltage: 4.0,      // 3.0-5.0
    mode: 'NORMAL',    // NORMAL, BURST, RECOVERY
    burstTicksRemaining: 0,
    targetRecovery: null
  });

  // Random interval between 2 and 5 seconds
  const intervalMs = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;

  const intervalId = setInterval(() => {
    const state = deviceState.get(deviceId);
    
    // Process according to state
    if (state.mode === 'NORMAL') {
      state.temperature = smoothRandomWalk(state.temperature, 15, 50, 0.5);
      state.humidity = smoothRandomWalk(state.humidity, 20, 90, 1.0);
      state.voltage = smoothRandomWalk(state.voltage, 3.0, 5.0, 0.05);

      // 2% - 5% chance to enter BURST mode (using ~3.5%)
      if (Math.random() < 0.035) {
        state.mode = 'BURST';
        // Burst duration: 5-20 seconds. Ticks are 2-5s, so 2-5 ticks is ~5-20 seconds.
        state.burstTicksRemaining = Math.floor(Math.random() * 4) + 2; 
        state.targetRecovery = {
          temperature: state.temperature,
          humidity: state.humidity,
          voltage: state.voltage
        };
        
        // Initial burst spike/drop
        const tempSpike = (Math.random() * 5 + 5) * (Math.random() < 0.5 ? 1 : -1); 
        const humSpike = (Math.random() * 10 + 10) * (Math.random() < 0.5 ? 1 : -1);
        const voltSpike = (Math.random() * 1.0 + 0.5) * (Math.random() < 0.5 ? 1 : -1); 
        
        state.temperature = Number(clamp(state.temperature + tempSpike, 15, 50).toFixed(2));
        state.humidity = Number(clamp(state.humidity + humSpike, 20, 90).toFixed(2));
        state.voltage = Number(clamp(state.voltage + voltSpike, 3.0, 5.0).toFixed(2));
      }
    } else if (state.mode === 'BURST') {
      // Highly erratic random walk during burst
      state.temperature = smoothRandomWalk(state.temperature, 15, 50, 2.0);
      state.humidity = smoothRandomWalk(state.humidity, 20, 90, 4.0);
      state.voltage = smoothRandomWalk(state.voltage, 3.0, 5.0, 0.2);

      state.burstTicksRemaining -= 1;
      if (state.burstTicksRemaining <= 0) {
        state.mode = 'RECOVERY';
      }
    } else if (state.mode === 'RECOVERY') {
      // Step gradually back to targetRecovery
      const stepTowards = (curr, target, stepRate) => {
        if (Math.abs(curr - target) <= stepRate) return target;
        return curr < target ? curr + stepRate : curr - stepRate;
      };

      state.temperature = stepTowards(state.temperature, state.targetRecovery.temperature, 1.0);
      state.humidity = stepTowards(state.humidity, state.targetRecovery.humidity, 2.0);
      state.voltage = stepTowards(state.voltage, state.targetRecovery.voltage, 0.1);

      // Add normal noise to make it realistic
      state.temperature = smoothRandomWalk(state.temperature, 15, 50, 0.2);
      state.humidity = smoothRandomWalk(state.humidity, 20, 90, 0.5);
      state.voltage = smoothRandomWalk(state.voltage, 3.0, 5.0, 0.02);

      // Check if recovered
      const tempRecovered = Math.abs(state.temperature - state.targetRecovery.temperature) < 1.5;
      const humRecovered = Math.abs(state.humidity - state.targetRecovery.humidity) < 3.0;
      const voltRecovered = Math.abs(state.voltage - state.targetRecovery.voltage) < 0.15;

      if (tempRecovered && humRecovered && voltRecovered) {
        state.mode = 'NORMAL';
        state.targetRecovery = null;
      }
    }

    const payload = {
      temperature: state.temperature,
      humidity: state.humidity,
      voltage: state.voltage,
      status: 'online',
      mode: state.mode // optionally send mode for dashboard indicator
    };

    // Forward the fully formed payload to the publishing layer
    publishTelemetry(deviceId, payload);
    
  }, intervalMs);

  activeSimulations.set(deviceId, intervalId);
  console.log(`[INFO] Started simulation for ${deviceId} (interval: ${intervalMs}ms)`);
};

/**
 * Stop telemetry simulation and clean up tracking references
 * @param {string} deviceId 
 */
const stopSimulation = async (deviceId) => {
  if (activeSimulations.has(deviceId)) {
    clearInterval(activeSimulations.get(deviceId));
    activeSimulations.delete(deviceId);
    deviceState.delete(deviceId);
    console.log(`[INFO] Stopped simulation for ${deviceId}`);
    
    try {
      await Device.updateOne({ deviceId }, { status: 'offline' });
    } catch (err) {}
  }
};

/**
 * Boot up scripts: start simulation for all devices currently in the database
 */
const startAllActiveDevices = async () => {
  try {
    const devices = await Device.find({});
    console.log(`[INFO] Found ${devices.length} devices to simulate.`);
    devices.forEach(device => {
      startSimulation(device.deviceId);
    });
  } catch (err) {
    console.error(`[ERROR] Failed to start simulations:`, err);
  }
};

module.exports = {
  startSimulation,
  stopSimulation,
  startAllActiveDevices
};
