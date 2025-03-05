const ctx = document.getElementById('ecgChart').getContext('2d');

// Constants
const BUFFER_SIZE = 300;
const ECG_BASELINE = 600;
const NOISE_INTENSITY = 10;
const SAMPLE_RATE = 5;
let dataHistory = [];
let isPaused = false;
let startTime = Date.now();

// Step Counting Constants
const STEP_THRESHOLD = 50;
const STEP_INTERVAL = 10000; // Changed from 15000 to 10000 milliseconds (10 seconds)
const AVERAGE_STEP_LENGTH = 0.75;
let stepCount = 0;
let displayedStepCount = 0;
let lastAcceleration = ECG_BASELINE;

// Alert System Constants
const RISK_CATEGORIES = {
    HIGH: { name: "High Risk", class: "high-risk" },
    MODERATE: { name: "Moderate Risk", class: "moderate-risk" },
    LOW: { name: "Low Risk", class: "low-risk" },
    HEALTHY: { name: "Healthy Heart", class: "healthy" }
};

const ALERT_MESSAGES = {
    HIGH: [
        "🚨 Seek immediate medical attention! Signs of heart strain detected!",
        "⚠️ Warning: Your heart is under extreme stress. Stop running immediately!",
        "🚨 High risk of heart attack! Consult a cardiologist before running again!"
    ],
    MODERATE: [
        "⚠️ Be cautious! Your heart is working harder than normal.",
        "🔴 Slow down! Your heart rate is beyond safe running limits.",
        "⚠️ Moderate risk detected. Consider consulting a doctor for a checkup."
    ],
    LOW: [
        "✅ You're doing fine, but stay aware of your limits.",
        "📉 Maintain a steady pace to keep your heart in optimal condition.",
        "✅ Slight risk detected. Keep training smartly and monitor your stats."
    ],
    HEALTHY: [
        "💪 Excellent heart condition! Keep pushing forward!",
        "🔥 You're in great shape! Maintain this pace for peak performance.",
        "💙 No heart concerns detected. Keep running strong and stay hydrated!"
    ]
};

// Generate ECG Waveform
function generateECGWaveform(t) {
    const period = 1.0;
    const normalizedT = (t / 1000) % period;
    let ecgValue = ECG_BASELINE;
    
    if (normalizedT < 0.2) ecgValue += 40 * Math.sin(normalizedT * Math.PI * 5);
    else if (normalizedT < 0.3) ecgValue -= 100;
    else if (normalizedT < 0.4) ecgValue += 250;
    else if (normalizedT < 0.5) ecgValue -= 150;
    else if (normalizedT < 0.7) ecgValue += 60 * Math.sin((normalizedT - 0.5) * Math.PI * 4);
    
    ecgValue += Math.random() * NOISE_INTENSITY - NOISE_INTENSITY / 2;
    return Math.max(200, Math.min(1000, ecgValue));
}

// Initialize ECG Chart
const ecgChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: new Array(BUFFER_SIZE).fill(''),
        datasets: [{
            label: 'ECG Signal',
            data: new Array(BUFFER_SIZE).fill(ECG_BASELINE),
            borderColor: '#207AEF',
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 0,
            cubicInterpolationMode: 'monotone',
            spanGaps: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { display: false },
            y: {
                suggestedMin: 200,
                suggestedMax: 1000,
                ticks: { 
                    color: '#666',
                    stepSize: 200
                },
                grid: { 
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                }
            }
        },
        plugins: { legend: { display: false } },
        animation: false
    }
});

// Fetch Sensor Data
function fetchSensorData() {
    fetch('http://localhost:5000/data')
        .then(response => response.json())
        .then(data => {
            updateConnectionStatus(true);
            if (!isPaused) {
                updateUI('temperature', data.temperature, '°C');
                updateUI('humidity', data.humidity, '%');
                updateUI('heartRate', data.heart_rate, 'BPM');
                processECGData();
            }
        })
        .catch(error => {
            console.error('❌ Error fetching data:', error);
            updateConnectionStatus(false);
        });
}

// Process ECG Data
function processECGData() {
    const now = Date.now();
    const ecgValue = generateECGWaveform(now);
    dataHistory.push({ value: ecgValue, timestamp: now });
    
    if (dataHistory.length > BUFFER_SIZE) dataHistory.shift();
    updateECGChart();
}

// Update ECG Graph
function updateECGChart() {
    requestAnimationFrame(() => {
        ecgChart.data.datasets[0].data = dataHistory.map(d => d.value);
        ecgChart.data.labels = dataHistory.map(d => ((d.timestamp - startTime) / 1000).toFixed(1));
        ecgChart.update('none');
    });
}

// Update UI Elements
function updateUI(elementId, value, unit) {
    const element = document.getElementById(elementId);
    if (element && value != null) {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
            element.textContent = `${numValue.toFixed(1)} ${unit}`;
        }
    }
}

// Update Connection Status Indicator
function updateConnectionStatus(isConnected) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
        if (isConnected) {
            statusElement.className = 'status-indicator connected';
            statusElement.innerHTML = '<span class="status-dot"></span>Connected';
        } else {
            statusElement.className = 'status-indicator';
            statusElement.style.display = 'none'; // Hide when disconnected
        }
    }
}

// Update Step Count
function updateActivityMetrics() {
    const stepElement = document.getElementById('stepCount');
    if (stepElement && displayedStepCount < stepCount) {
        displayedStepCount = stepCount;
        stepElement.textContent = displayedStepCount;
    }

    const distanceKm = (displayedStepCount * AVERAGE_STEP_LENGTH) / 1000;
    const distanceElement = document.getElementById('distanceCount');
    if (distanceElement) {
        distanceElement.textContent = distanceKm.toFixed(2);
    }
}

// Toggle Pause Button
const pauseBtn = document.getElementById('pauseBtn');
if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseBtn.innerHTML = isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    });
}

// Download ECG Data
const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const csvContent = "data:text/csv;charset=utf-8,Timestamp,ECG Value\n" +
            dataHistory.map(point => `${new Date(point.timestamp).toISOString()},${point.value}`).join("\n");
        
        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = `ecg_data_${timestamp}.csv`;
        document.body.appendChild(link);
        link.click();
    });
}

// Separate step counter function
function startStepCounter() {
    setInterval(() => {
        if (!isPaused) {
            stepCount++;
            updateActivityMetrics();
        }
    }, STEP_INTERVAL); // Now using 10 second interval
}

// Start Fetching Data and Step Counter
setInterval(fetchSensorData, SAMPLE_RATE);
startStepCounter(); // Start the independent step counter

// Function to update health analysis
function updateHealthAnalysis() {
    const riskCategoryElement = document.getElementById('riskCategory');
    const alertMessageElement = document.getElementById('alertMessage');
    
    if (!riskCategoryElement || !alertMessageElement) {
        console.error('Alert elements not found!');
        return;
    }
    
    // Simulate risk calculation
    const riskScore = Math.floor(Math.random() * 4); // 0-3
    
    let category;
    let messages;
    
    if (riskScore === 3) {
        category = RISK_CATEGORIES.HIGH;
        messages = ALERT_MESSAGES.HIGH;
    } else if (riskScore === 2) {
        category = RISK_CATEGORIES.MODERATE;
        messages = ALERT_MESSAGES.MODERATE;
    } else if (riskScore === 1) {
        category = RISK_CATEGORIES.LOW;
        messages = ALERT_MESSAGES.LOW;
    } else {
        category = RISK_CATEGORIES.HEALTHY;
        messages = ALERT_MESSAGES.HEALTHY;
    }

    // Update UI with random message from appropriate category
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Force DOM update
    requestAnimationFrame(() => {
        riskCategoryElement.textContent = category.name;
        riskCategoryElement.className = `risk-category ${category.class}`;
        alertMessageElement.textContent = randomMessage;
        
        // Debug log
        console.log('Updated message:', randomMessage);
    });
}

// Add event listener for refresh button
document.addEventListener('DOMContentLoaded', () => {
    const refreshAnalysisBtn = document.getElementById('refreshAnalysis');
    if (refreshAnalysisBtn) {
        refreshAnalysisBtn.addEventListener('click', () => {
            refreshAnalysisBtn.classList.add('rotating');
            updateHealthAnalysis();
            setTimeout(() => {
                refreshAnalysisBtn.classList.remove('rotating');
            }, 1000);
        });
    }

    // Initial analysis update
    updateHealthAnalysis();
});
