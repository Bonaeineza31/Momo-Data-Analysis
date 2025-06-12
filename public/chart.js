// chart.js
window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/api/transactions');
  const data = await res.json();

  const types = {};
  const monthlyTotals = {};
  let total = 0;
  let incoming = 0;
  let outgoing = 0;

  data.forEach(tx => {
    types[tx.type] = (types[tx.type] || 0) + 1;
    const month = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyTotals[month] = (monthlyTotals[month] || 0) + tx.amount;

    total += tx.amount;
    if (['deposit', 'incoming'].includes(tx.type)) incoming += tx.amount;
    else outgoing += tx.amount;
  });

  // Update summary cards
  document.querySelector('#total-transactions span').textContent = data.length;
  document.querySelector('#total-amount span').textContent = total.toLocaleString();
  document.querySelector('#total-incoming span').textContent = incoming.toLocaleString();
  document.querySelector('#total-outgoing span').textContent = outgoing.toLocaleString();

  // Bar Chart
  new Chart(document.getElementById('transaction-volume-chart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: Object.keys(types),
      datasets: [{
        label: 'Transaction Volume',
        data: Object.values(types),
        backgroundColor: 'rgba(0, 53, 107, 0.7)'
      }]
    },
    options: { responsive: true, plugins: { title: { display: true, text: 'Volume by Type' } } }
  });

  // Line Chart
  new Chart(document.getElementById('monthly-summary-chart').getContext('2d'), {
    type: 'line',
    data: {
      labels: Object.keys(monthlyTotals),
      datasets: [{
        label: 'Monthly Total (RWF)',
        data: Object.values(monthlyTotals),
        borderColor: '#00356B',
        fill: false,
        tension: 0.3
      }]
    },
    options: { responsive: true, plugins: { title: { display: true, text: 'Monthly Totals' } } }
  });

  // Pie Chart
  new Chart(document.getElementById('payment-distribution-chart').getContext('2d'), {
    type: 'pie',
    data: {
      labels: Object.keys(types),
      datasets: [{
        data: Object.values(types),
        backgroundColor: ['#ffc107', '#00356B', '#28a745', '#dc3545', '#6c757d']
      }]
    },
    options: { responsive: true, plugins: { title: { display: true, text: 'Type Distribution' } } }
  });
});
