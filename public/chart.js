window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/api/transactions');
  const data = await res.json();

  // Group by type (for bar chart)
  const types = {};
  data.forEach(tx => {
    types[tx.type] = (types[tx.type] || 0) + 1;
  });

  const ctx1 = document.getElementById('transaction-volume-chart').getContext('2d');
  new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: Object.keys(types),
      datasets: [{
        label: 'Transactions by Type',
        data: Object.values(types),
        backgroundColor: 'rgba(0, 53, 107, 0.6)',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Transaction Volume by Type' }
      }
    }
  });

  // Group by date (for line chart)
  const summary = {};
  data.forEach(tx => {
    const date = new Date(tx.date).toISOString().split('T')[0];
    summary[date] = (summary[date] || 0) + tx.amount;
  });

  const ctx2 = document.getElementById('monthly-summary-chart').getContext('2d');
  new Chart(ctx2, {
    type: 'line',
    data: {
      labels: Object.keys(summary),
      datasets: [{
        label: 'Total Amount per Day',
        data: Object.values(summary),
        borderColor: 'rgba(0, 53, 107, 1)',
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Daily Transaction Totals' }
      }
    }
  });

  // Pie chart (distribution by type)
  const ctx3 = document.getElementById('payment-distribution-chart').getContext('2d');
  new Chart(ctx3, {
    type: 'pie',
    data: {
      labels: Object.keys(types),
      datasets: [{
        label: 'Distribution by Type',
        data: Object.values(types),
        backgroundColor: ['#ffc107', '#00356B', '#28a745', '#dc3545', '#6c757d']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Payment Distribution' }
      }
    }
  });

  // Display raw transaction details
  const container = document.getElementById('transaction-details');
  container.innerHTML = data.map(tx => `
    <div>
      <strong>${tx.type}</strong> - ${tx.amount} RWF on ${new Date(tx.date).toLocaleDateString()}
    </div>
  `).join('');
});
