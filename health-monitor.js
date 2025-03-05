document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    initializeDateFilter();
    setupSpO2Progress();
});

function initializeCharts() {
    // Heart Rate Chart
    const heartRateCtx = document.getElementById('heartRateChart').getContext('2d');
    new Chart(heartRateCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
            datasets: [{
                label: 'Heart Rate',
                data: [71, 68, 65, 75, 82, 78, 73, 70],
                borderColor: '#207AEF',
                backgroundColor: 'rgba(32, 122, 239, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#207AEF',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#207AEF',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} BPM`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 50,
                    max: 100,
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        stepSize: 10,
                        color: '#666666'
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666'
                    }
                }
            }
        }
    });

    // Activity Chart
    const activityCtx = document.getElementById('activityChart').getContext('2d');
    new Chart(activityCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                data: [10458, 9235, 11853, 12458, 9652, 11245, 10568],
                backgroundColor: '#207AEF',
                borderRadius: 8,
                barThickness: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#207AEF',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toLocaleString()} steps`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 14000,
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        stepSize: 2000,
                        color: '#666666',
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666'
                    }
                }
            }
        }
    });

    // Hydration Chart
    const hydrationCtx = document.getElementById('hydrationChart').getContext('2d');
    new Chart(hydrationCtx, {
        type: 'line',
        data: {
            labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
            datasets: [{
                data: [0.2, 0.6, 1.0, 1.3, 1.6, 2.0],
                borderColor: '#207AEF',
                backgroundColor: 'rgba(32, 122, 239, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#207AEF',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#207AEF',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y}L`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 2.5,
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        stepSize: 0.5,
                        color: '#666666',
                        callback: function(value) {
                            return `${value}L`;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666'
                    }
                }
            }
        }
    });
}

// Initialize SpO2 Progress Ring
function setupSpO2Progress() {
    const circle = document.querySelector('.progress-ring-circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    function setProgress(percent) {
        const offset = circumference - (percent / 100 * circumference);
        circle.style.strokeDashoffset = offset;
    }

    // Set initial progress (98%)
    setProgress(98);
}

// Initialize Date Filter
function initializeDateFilter() {
    const filterButtons = document.querySelectorAll('.date-filter button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateDashboardData(button.textContent.toLowerCase());
        });
    });
}

// Update Dashboard Data based on selected date range
function updateDashboardData(timeRange) {
    // Implement data update logic based on timeRange
    console.log(`Updating dashboard for ${timeRange}`);
    // Update charts and stats accordingly
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initializeCharts();
    }, 250);
});
