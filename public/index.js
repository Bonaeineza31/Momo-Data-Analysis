window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/api/transactions');
  const data = await res.json();

  // Group by type
  const types = {};
  data.forEach(tx => {
    types[tx.type] = (types[tx.type] || 0) + 1;
  });

  const ctx = document.getElementById('transaction-volume-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(types),
      datasets: [{
        label: 'Transaction Volume by Type',
        data: Object.values(types),
        backgroundColor: 'rgba(255, 193, 7, 0.6)',
        borderColor: 'rgba(0, 53, 107, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Render details
  const container = document.getElementById('transaction-details');
  container.innerHTML = data.map(tx => `
    <div>
      <strong>${tx.type}</strong> - ${tx.amount} RWF on ${new Date(tx.date).toLocaleDateString()}
    </div>
  `).join('');

  // Filter setup
  document.getElementById('apply-filter').addEventListener('click', () => {
    const searchText = document.getElementById('search-input').value.toLowerCase();
    const filterType = document.getElementById('filter-type').value;

    const filtered = data.filter(tx => {
      const matchesType = filterType ? tx.type === filterType : true;
      const matchesSearch = tx.body.toLowerCase().includes(searchText);
      return matchesType && matchesSearch;
    });

    container.innerHTML = filtered.map(tx => `
      <div>
        <strong>${tx.type}</strong> - ${tx.amount} RWF on ${new Date(tx.date).toLocaleDateString()}
      </div>
    `).join('');
  });
});
