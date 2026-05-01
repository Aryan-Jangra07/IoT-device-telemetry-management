import paho.mqtt.client as mqtt
import time
import random
import json

# Broker Configuration
BROKER = "localhost"
PORT = 1883
TOPIC_TEMP = "/sensor/temperature"
TOPIC_HUM = "/sensor/humidity"
TOPIC_MOIST = "/sensor/moisture"

# Base sensor values
current_temp = 25.0
current_hum = 50.0
current_moist = 45.0

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker successfully!")
    else:
        print(f"❌ Failed to connect, return code {rc}")

def simulate_data():
    global current_temp, current_hum, current_moist
    
    # Introduce random fluctuations
    current_temp += random.uniform(-1.5, 1.5)
    current_hum += random.uniform(-2.0, 2.0)
    current_moist += random.uniform(-3.0, 3.0)

    # Keep values within realistic bounds, occasionally trigger alerts
    # Alerts trigger when temp > 40 or moisture < 20
    current_temp = max(15.0, min(current_temp, 45.0)) 
    current_hum = max(20.0, min(current_hum, 90.0))
    current_moist = max(10.0, min(current_moist, 80.0))
    
    return round(current_temp, 2), round(current_hum, 2), round(current_moist, 2)

if __name__ == "__main__":
    client = mqtt.Client("IoTSimulator")
    client.on_connect = on_connect

    while True:
        try:
            print(f"Attempting to connect to Mosquitto Broker at {BROKER}:{PORT}...")
            client.connect(BROKER, PORT, 60)
            break
        except ConnectionRefusedError:
            print("❌ Connection refused. Retrying in 5 seconds...")
            time.sleep(5)

    client.loop_start()
    print("🚀 Starting simulation. Press Ctrl+C to exit.")

    try:
        while True:
            temp, hum, moist = simulate_data()
            
            # Publish individual metrics
            client.publish(TOPIC_TEMP, str(temp))
            client.publish(TOPIC_HUM, str(hum))
            client.publish(TOPIC_MOIST, str(moist))
            
            print(f"📡 Published -> Temp: {temp}°C, Hum: {hum}%, Moist: {moist}%")
            
            # Wait 2-5 seconds before next publication
            time.sleep(random.uniform(2, 5))

    except KeyboardInterrupt:
        print("\n⏹️ Stopping simulation...")
        client.loop_stop()
        client.disconnect()
