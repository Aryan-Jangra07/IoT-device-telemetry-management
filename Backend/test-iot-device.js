const mqtt = require('mqtt');

/**
 * SIMULATED IOT DEVICE SCRIPT
 * This script demonstrates the Device -> MQTT -> Backend -> InfluxDB workflow
 */

const DEVICE_ID = 'test-device-001';
const DEVICE_TOKEN = 'YOUR_DEVICE_TOKEN_FROM_REGISTRATION'; // Replace after registering via API
const BROKER_URL = 'mqtt://localhost:1883';

const client = mqtt.connect(BROKER_URL, {
  username: DEVICE_ID,
  password: DEVICE_TOKEN
});

client.on('connect', () => {
  console.log(`✅ Device ${DEVICE_ID} connected to MQTT Broker`);

  // 1. Subscribe to Commands
  const commandTopic = `device/${DEVICE_ID}/command`;
  client.subscribe(commandTopic, () => {
    console.log(`📡 Subscribed to command topic: ${commandTopic}`);
  });

  // 2. Publish Telemetry every 5 seconds
  setInterval(() => {
    const telemetry = {
      temperature: (20 + Math.random() * 10).toFixed(2),
      humidity: (40 + Math.random() * 20).toFixed(2),
      status: 'active'
    };
    
    const telemetryTopic = `device/${DEVICE_ID}/telemetry`;
    client.publish(telemetryTopic, JSON.stringify(telemetry));
    console.log(`📤 Published Telemetry to ${telemetryTopic}:`, telemetry);
  }, 5000);
});

client.on('message', (topic, message) => {
  console.log(`📥 Received Command on ${topic}:`, message.toString());
});

client.on('error', (err) => {
  console.error('❌ MQTT Error:', err);
});
