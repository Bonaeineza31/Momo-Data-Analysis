window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/api/transactions');
  const data = await res.json(); // ⬅️ move this BEFORE using `data`

  const ctx = document.getElementById('transaction-volume-chart').getContext('2d');
  const types = {};

  data.forEach(tx => {
    types[tx.type] = (types[tx.type] || 0) + 1;
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(types),
      datasets: [{
        label: 'Transaction Volume by Type',
        data: Object.values(types),
      }]
    }
  });

  const container = document.getElementById('transaction-details');
  container.innerHTML = data.map(tx => `
    <div>
      <strong>${tx.type}</strong> - ${tx.amount} RWF on ${new Date(tx.date).toLocaleDateString()}
    </div>
  `).join('');
});
