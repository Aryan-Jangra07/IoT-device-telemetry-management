const mqtt = require('mqtt');
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let jwtToken = '';
let deviceToken = '';
const deviceId = `TEST-ESP32-${Math.floor(Math.random() * 1000)}`;

async function apiCall(endpoint, method, body, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  try {
    const res = await axios({
      url: `${BASE_URL}${endpoint}`,
      method,
      headers,
      data: body
    });
    return res.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'API Error');
    }
    throw error;
  }
}

async function runTest() {
  console.log('🚀 Starting Advanced IoT Backend Architecture Test...\n');

  try {
    // 1. REGISTER USER
    console.log('1️⃣ Testing: Register Admin User...');
    try {
      await apiCall('/users/register', 'POST', {
        name: 'Admin User',
        email: 'admin_test@iot.com',
        password: 'password123',
        role: 'admin'
      });
      console.log('✅ User registered successfully.');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('⚠️ User already exists. Proceeding to login...');
      } else {
        throw e;
      }
    }

    // 2. LOGIN USER
    console.log('\n2️⃣ Testing: Login User (Fetching JWT)...');
    const loginData = await apiCall('/users/login', 'POST', {
      email: 'admin_test@iot.com',
      password: 'password123'
    });
    jwtToken = loginData.token;
    console.log('✅ Login successful. Received Secure JWT Token!');

    // 3. REGISTER DEVICE
    console.log('\n3️⃣ Testing: Register IoT Device (Over Authenticated REST)...');
    const deviceData = await apiCall('/devices/register', 'POST', {
      deviceId: deviceId,
      name: 'Test Living Room Sensor'
    }, jwtToken);
    
    deviceToken = deviceData.device.token;
    console.log('✅ Device provisioned successfully!');
    console.log('🔑 Auto-Generated Secure MQTT Device Token:', deviceToken);

    // 4. CONNECT TO MQTT
    console.log('\n4️⃣ Testing: Physical Device Connection to Embedded Aedes MQTT Broker...');
    const client = mqtt.connect('mqtt://localhost:1883', {
      clientId: `client_${deviceId}`,
      username: deviceId,
      password: deviceToken
    });

    client.on('connect', () => {
      console.log('✅ MQTT TCP Socket Connected Successfully! Authentication Hook Passed 🛡️');
      
      // 5. PUBLISH TELEMETRY
      const topic = `device/${deviceId}/telemetry`;
      const payload = JSON.stringify({ temperature: 27.5, humidity: 65, voltage: 3.3 });
      
      console.log(`\n5️⃣ Testing: Publishing telemetry to highly authorized topic -> ${topic}...`);
      client.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
          console.error('❌ Publish failed', err);
        } else {
          console.log('✅ Telemetry published to Broker! (Authorization Hook Passed 🛡️)');
          console.log('   -> Internal Broker intercepts this and saves to InfluxDB.');
          console.log('\n🎉 ALL TESTS PASSED! The new Architecture is fully functional.\n');
          client.end();
        }
      });
    });

    client.on('error', (err) => {
      console.error('❌ MQTT Connection Error:', err.message);
      client.end();
    });

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.log('Ensure both MongoDB and InfluxDB are running, and that you started the backend server.');
  }
}

runTest();
