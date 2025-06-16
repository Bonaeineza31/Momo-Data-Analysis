// Chart instances
let typesChart = null;
let trendsChart = null;
let volumeChart = null;

// MTN Colors
const MTN_BLUE = '#004990';
const MTN_YELLOW = '#ffcc00';
const MTN_COLORS = [MTN_BLUE, MTN_YELLOW, '#28a745', '#dc3545', '#6610f2', '#fd7e14', '#20c997'];

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Set Chart.js defaults
  Chart.defaults.color = '#666';
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  
  // Initialize empty charts
  initializeCharts();
});

// Initialize empty charts
function initializeCharts() {
  // Transaction Types Chart (Pie)
  const typesCtx = document.getElementById('types-chart');
  if (typesCtx) {
    typesChart = new Chart(typesCtx.getContext('2d'), {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: MTN_COLORS,
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0 // Disable animations to prevent resize issues
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        onResize: function(chart, size) {
          // Prevent infinite resize loops
          if (size.height > 300) {
            chart.canvas.style.height = '250px';
            chart.canvas.style.maxHeight = '250px';
          }
        }
      }
    });
  }

  // Monthly Trends Chart (Line)
  const trendsCtx = document.getElementById('trends-chart');
  if (trendsCtx) {
    trendsChart = new Chart(trendsCtx.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Amount (RWF)',
          data: [],
          borderColor: MTN_BLUE,
          backgroundColor: 'rgba(0, 73, 144, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 3,
          pointBackgroundColor: MTN_BLUE,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0 // Disable animations
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `Amount: ${context.parsed.y.toLocaleString()} RWF`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return value.toLocaleString() + ' RWF';
              }
            }
          }
        },
        onResize: function(chart, size) {
          if (size.height > 300) {
            chart.canvas.style.height = '250px';
            chart.canvas.style.maxHeight = '250px';
          }
        }
      }
    });
  }

  // Transaction Volume Chart (Bar)
  const volumeCtx = document.getElementById('volume-chart');
  if (volumeCtx) {
    volumeChart = new Chart(volumeCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Transaction Count',
          data: [],
          backgroundColor: MTN_YELLOW,
          borderColor: MTN_BLUE,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0 // Disable animations
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Count: ${context.parsed.y} transactions`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              stepSize: 1
            }
          }
        },
        onResize: function(chart, size) {
          if (size.height > 300) {
            chart.canvas.style.height = '250px';
            chart.canvas.style.maxHeight = '250px';
          }
        }
      }
    });
  }
}

// Update charts with new data
function updateCharts(types, monthlyTotals) {
  try {
    // Update Types Chart (Pie)
    if (typesChart && typesChart.data) {
      const typeLabels = Object.keys(types).map(type => 
        type.charAt(0).toUpperCase() + type.slice(1)
      );
      typesChart.data.labels = typeLabels;
      typesChart.data.datasets[0].data = Object.values(types);
      typesChart.update('none'); // Use 'none' to prevent animations
    }
    
    // Update Trends Chart (Line)
    if (trendsChart && trendsChart.data) {
      const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
        return new Date(a) - new Date(b);
      });
      trendsChart.data.labels = sortedMonths;
      trendsChart.data.datasets[0].data = sortedMonths.map(month => monthlyTotals[month]);
      trendsChart.update('none');
    }
    
    // Update Volume Chart (Bar)
    if (volumeChart && volumeChart.data) {
      const typeLabels = Object.keys(types).map(type => 
        type.charAt(0).toUpperCase() + type.slice(1)
      );
      volumeChart.data.labels = typeLabels;
      volumeChart.data.datasets[0].data = Object.values(types);
      volumeChart.update('none');
    }
    
  } catch (error) {
    console.error('Error updating charts:', error);
  }
}

// Export functions for use in index.js
window.updateCharts = updateCharts;
