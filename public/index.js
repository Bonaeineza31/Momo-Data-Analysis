// Global variables
let allTransactions = [];
let filteredTransactions = [];
let currentDisplayCount = 0;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  loadTransactions(50);
  updateTimestamp();
});

// Set up event listeners
function setupEventListeners() {
  document.getElementById('apply-filter').addEventListener('click', applyFilters);
  document.getElementById('clear-filters').addEventListener('click', clearFilters);
  document.getElementById('chart-period').addEventListener('change', function() {
    updatePeriod(this.value);
  });
  document.getElementById('sort-by').addEventListener('change', function() {
    sortTransactions(this.value);
  });
  document.getElementById('apply-limit').addEventListener('click', function() {
    const limit = parseInt(document.getElementById('limit-input').value);
    if (limit > 0) loadTransactions(limit);
  });
  document.getElementById('load-more').addEventListener('click', loadMoreTransactions);
  
  // Enter key for limit input
  document.getElementById('limit-input').addEventListener('keyup', function(e) {
    if (e.key === 'Enter') document.getElementById('apply-limit').click();
  });
}

// Load transactions from API
async function loadTransactions(limit) {
  try {
    updateStatus('Loading...');
    
    // Fetch transactions
    const response = await fetch(`/api/transactions?limit=${limit}`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    allTransactions = await response.json();
    filteredTransactions = [...allTransactions];
    
    // Fetch summary
    const summaryResponse = await fetch('/api/summary');
    if (summaryResponse.ok) {
      const summary = await summaryResponse.json();
      updateSummaryCards(summary);
    }
    
    // Update displays
    processTransactionData(allTransactions);
    displayTransactions(allTransactions.slice(0, 20));
    updateStatus('Active');
    updateTimestamp();
    
  } catch (error) {
    console.error('Error:', error);
    updateStatus('Error');
    alert('Failed to load data. Please check your connection.');
  }
}

// Apply filters
function applyFilters() {
  const searchText = document.getElementById('search-input').value.toLowerCase();
  const filterType = document.getElementById('filter-type').value;
  
  filteredTransactions = allTransactions.filter(tx => {
    const textMatch = !searchText || (tx.body && tx.body.toLowerCase().includes(searchText));
    const typeMatch = !filterType || tx.type === filterType;
    return textMatch && typeMatch;
  });
  
  displayTransactions(filteredTransactions.slice(0, 20));
  processTransactionData(filteredTransactions);
  currentDisplayCount = 20;
  
  // Show/hide load more button
  document.getElementById('load-more').style.display = 
    filteredTransactions.length > 20 ? 'inline-flex' : 'none';
}

// Clear all filters
function clearFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('filter-type').value = '';
  document.getElementById('chart-period').value = 'all';
  
  filteredTransactions = [...allTransactions];
  displayTransactions(allTransactions.slice(0, 20));
  processTransactionData(allTransactions);
  currentDisplayCount = 20;
}

// Update time period
function updatePeriod(period) {
  const today = new Date();
  let filtered = [];
  
  switch(period) {
    case 'week':
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      filtered = allTransactions.filter(tx => new Date(tx.date) >= weekAgo);
      break;
    case 'month':
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      filtered = allTransactions.filter(tx => new Date(tx.date) >= monthAgo);
      break;
    default:
      filtered = [...allTransactions];
  }
  
  filteredTransactions = filtered;
  displayTransactions(filtered.slice(0, 20));
  processTransactionData(filtered);
  currentDisplayCount = 20;
}

// Sort transactions
function sortTransactions(sortBy) {
  const sorted = [...filteredTransactions];
  
  sorted.sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'amount') return b.amount - a.amount;
    return 0;
  });
  
  filteredTransactions = sorted;
  displayTransactions(sorted.slice(0, currentDisplayCount));
}

// Load more transactions
function loadMoreTransactions() {
  const nextBatch = filteredTransactions.slice(currentDisplayCount, currentDisplayCount + 20);
  if (nextBatch.length === 0) return;
  
  const container = document.getElementById('transaction-list');
  nextBatch.forEach(tx => {
    container.appendChild(createTransactionElement(tx));
  });
  
  currentDisplayCount += nextBatch.length;
  
  if (currentDisplayCount >= filteredTransactions.length) {
    document.getElementById('load-more').style.display = 'none';
  }
}

// Display transactions
function displayTransactions(transactions) {
  const container = document.getElementById('transaction-list');
  container.innerHTML = '';
  
  transactions.forEach(tx => {
    container.appendChild(createTransactionElement(tx));
  });
  
  currentDisplayCount = transactions.length;
}

// Create transaction element
function createTransactionElement(tx) {
  const item = document.createElement('div');
  item.className = `transaction-item ${tx.type}`;
  
  const icon = getTransactionIcon(tx.type);
  const date = new Date(tx.date);
  const formattedDate = date.toLocaleDateString() + ' ' + 
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const isIncoming = ['deposit', 'incoming'].includes(tx.type);
  const amountPrefix = isIncoming ? '+' : '-';
  const amountClass = isIncoming ? 'incoming' : 'outgoing';
  
  const description = extractDescription(tx.body) || getTransactionTitle(tx.type);
  
  item.innerHTML = `
    <div class="transaction-left">
      <div class="transaction-icon ${tx.type}">
        <i class="${icon}"></i>
      </div>
      <div class="transaction-info">
        <div class="transaction-title">${description}</div>
        <div class="transaction-details">ID: ${tx.id}</div>
        <div class="transaction-date">${formattedDate}</div>
      </div>
    </div>
    <div class="transaction-right">
      <div class="transaction-amount ${amountClass}">
        ${amountPrefix} ${tx.amount.toLocaleString()} RWF
      </div>
    </div>
  `;
  
  item.addEventListener('click', () => {
    alert(`Full SMS:\n\n${tx.body}`);
  });
  
  return item;
}

// Update summary cards
function updateSummaryCards(summary) {
  document.getElementById('total-transactions').textContent = summary.count.toLocaleString();
  document.getElementById('total-amount').textContent = summary.total.toLocaleString() + ' RWF';
  document.getElementById('total-incoming').textContent = summary.incoming.toLocaleString() + ' RWF';
  document.getElementById('total-outgoing').textContent = summary.outgoing.toLocaleString() + ' RWF';
}

// Update status
function updateStatus(status) {
  const statusEl = document.getElementById('data-status');
  statusEl.textContent = status;
  statusEl.className = `status-${status.toLowerCase()}`;
}

// Update timestamp
function updateTimestamp() {
  document.getElementById('last-updated').textContent = new Date().toLocaleString();
}

// Helper functions
function extractDescription(body) {
  if (!body) return null;
  
  if (body.includes('received')) return 'Money Received';
  if (body.includes('payment')) {
    const match = body.match(/payment of .+ RWF to ([^(]+)/);
    return match ? `Payment to ${match[1].trim()}` : 'Payment';
  }
  if (body.includes('transferred')) {
    const match = body.match(/transferred to ([^(]+)/);
    return match ? `Transfer to ${match[1].trim()}` : 'Transfer';
  }
  if (body.includes('withdrawn')) return 'Withdrawal';
  if (body.includes('Airtime')) return 'Airtime Purchase';
  
  return null;
}

function getTransactionIcon(type) {
  const icons = {
    'incoming': 'fas fa-arrow-down',
    'payment': 'fas fa-shopping-cart',
    'transfer': 'fas fa-exchange-alt',
    'withdrawal': 'fas fa-money-bill-wave',
    'airtime': 'fas fa-phone'
  };
  return icons[type] || 'fas fa-circle';
}

function getTransactionTitle(type) {
  const titles = {
    'incoming': 'Money Received',
    'payment': 'Payment',
    'transfer': 'Transfer',
    'withdrawal': 'Withdrawal',
    'airtime': 'Airtime Purchase'
  };
  return titles[type] || 'Transaction';
}

// Process data for charts (calls chart.js functions)
function processTransactionData(transactions) {
  if (typeof updateCharts === 'function') {
    const types = {};
    const monthlyTotals = {};
    
    transactions.forEach(tx => {
      types[tx.type] = (types[tx.type] || 0) + 1;
      
      const date = new Date(tx.date);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + tx.amount;
    });
    
    updateCharts(types, monthlyTotals);
  }
}