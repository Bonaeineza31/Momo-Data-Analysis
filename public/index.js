// index.js
window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/api/transactions');
  const data = await res.json();

  const container = document.getElementById('transaction-details');
  const render = (items) => {
    container.innerHTML = items.map(tx => `
      <div class="tx-card">
        <strong>${tx.type}</strong> - ${tx.amount} RWF on ${new Date(tx.date).toLocaleDateString()}<br/>
        <em>${tx.body?.slice(0, 100)}...</em>
      </div>
    `).join('');
  };

  render(data);

  document.getElementById('apply-filter').addEventListener('click', () => {
    const searchText = document.getElementById('search-input').value.toLowerCase();
    const filterType = document.getElementById('filter-type').value;

    const filtered = data.filter(tx => {
      const matchesType = filterType ? tx.type === filterType : true;
      const matchesSearch = tx.body?.toLowerCase().includes(searchText);
      return matchesType && matchesSearch;
    });

    render(filtered);
  });
});