from flask import Flask, jsonify
from flask_cors import CORS
import requests
import time
import random  # For testing when ESP32 is not connected

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables to store latest sensor data
sensor_data = {
    'temperature': 0,
    'humidity': 0,
    'heart_rate': 0,
    'ecg': 0
}

def fetch_esp32_data():
    """Fetch data from ESP32"""
    esp_ip = "http://192.168.137.47"  # Replace with your ESP32 IP
    try:
        response = requests.get(esp_ip)
        return response.json()
    except:
        # Generate mock data if ESP32 is not connected
        return {
            'temperature': round(random.uniform(35.5, 37.5), 1),
            'humidity': round(random.uniform(45, 55), 1),
            'heart_rate': random.randint(60, 100),
            'ecg': random.randint(100, 900)  # Simulated ECG value
        }

@app.route('/data')
def get_data():
    """API endpoint to get sensor data"""
    global sensor_data
    sensor_data = fetch_esp32_data()
    return jsonify(sensor_data)

def update_sensor_data():
    """Background task to continuously update sensor data"""
    global sensor_data
    while True:
        try:
            sensor_data = fetch_esp32_data()
            print(f"🌡 Temp: {sensor_data['temperature']}°C | 💧 Humidity: {sensor_data['humidity']}%")
            print(f"❤ Heart Rate: {sensor_data['heart_rate']} BPM | 📊 ECG: {sensor_data['ecg']}")
        except Exception as e:
            print(f"❌ Error: {e}")
        time.sleep(0.1)  # Update every 100ms

if __name__ == '__main__':
    # Start the background task in a separate thread
    import threading
    bg_thread = threading.Thread(target=update_sensor_data, daemon=True)
    bg_thread.start()
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000)