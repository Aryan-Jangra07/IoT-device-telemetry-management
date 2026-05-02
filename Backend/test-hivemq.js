const mqtt = require('mqtt');

// Connect to the same public broker
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
  console.log('✅ Simulated Device Connected to HiveMQ');

  const topic = 'device/test-123/telemetry';
  const payload = {
    deviceId: "test-123",
    temperature: 45,
    status: "active"
  };

  console.log(`📤 Publishing to ${topic}...`);
  client.publish(topic, JSON.stringify(payload), (err) => {
    if (err) console.error('❌ Publish failed:', err);
    else console.log('✅ Message published successfully!');
    
    // Close after a short delay
    setTimeout(() => {
      client.end();
      process.exit(0);
    }, 2000);
  });
});

client.on('error', (err) => {
  console.error('❌ MQTT Error:', err);
  process.exit(1);
});
