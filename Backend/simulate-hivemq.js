const mqtt = require('mqtt');

// Connect to the same public broker
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
    console.log('✅ Simulated Device Connected to HiveMQ');

    // Payload structure as per requirements
    const payload = {
        deviceId: "device101",
        temperature: 45,
        status: "active"
    };

    const topic = 'device/device101/telemetry';

    // Publish every 5 seconds
    setInterval(() => {
        payload.temperature = Math.floor(Math.random() * 50); // Random temp
        client.publish(topic, JSON.stringify(payload));
        console.log(`📤 Published to ${topic}:`, payload);
    }, 5000);
});
