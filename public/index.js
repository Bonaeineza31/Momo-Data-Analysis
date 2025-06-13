// Main JavaScript file for UI interactions
document.addEventListener('DOMContentLoaded', function() {
  // Set up event listeners
  setupEventListeners();
  
  // Update current date and time
  document.getElementById('last-updated').textContent = new Date().toLocaleString();
});

// Function to set up event listeners
function setupEventListeners() {
  // Apply filter button
  const applyFilterBtn = document.getElementById('apply-filter');
  if (applyFilterBtn) {
    applyFilterBtn.addEventListener('click', applyFilters);
  }
  
  // Clear filters button
  const clearFiltersBtn = document.getElementById('clear-filters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
  }
  
  // Chart period selector
  const chartPeriodSelect = document.getElementById('chart-period');
  if (chartPeriodSelect) {
    chartPeriodSelect.addEventListener('change', function() {
      updateChartPeriod(this.value);
    });
  }
  
  // Sort selector
  const sortBySelect = document.getElementById('sort-by');
  if (sortBySelect) {
    sortBySelect.addEventListener('change', function() {
      sortTransactions(this.value);
    });
  }
  
  // Load more button
  const loadMoreBtn = document.getElementById('load-more');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', loadMoreTransactions);
  }
  
  // Transaction limit input - allow Enter key to apply
  const limitInput = document.getElementById('transaction-limit');
  if (limitInput) {
    limitInput.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        document.getElementById('apply-limit').click();
      }
    });
  }
}

// Function to apply filters
function applyFilters() {
  const filterType = document.getElementById('filter-type').value;
  const searchText = document.getElementById('search-input').value.toLowerCase();
  
  if (!filterType && !searchText) {
    return;
  }
  
  // Show active filters section
  const activeFiltersSection = document.getElementById('active-filters');
  activeFiltersSection.style.display = 'block';
  
  // Add filter tags
  const filterTags = document.getElementById('filter-tags');
  filterTags.innerHTML = '';
  
  if (filterType) {
    const filterTag = document.createElement('div');
    filterTag.className = 'filter-tag';
    filterTag.innerHTML = `
      Type: ${filterType} 
      <span class="remove-tag" data-filter="type">×</span>
    `;
    filterTags.appendChild(filterTag);
  }
  
  if (searchText) {
    const searchTag = document.createElement('div');
    searchTag.className = 'filter-tag';
    searchTag.innerHTML = `
      Search: ${searchText} 
      <span class="remove-tag" data-filter="search">×</span>
    `;
    filterTags.appendChild(searchTag);
  }
  
  // Add event listeners to remove tags
  document.querySelectorAll('.remove-tag').forEach(tag => {
    tag.addEventListener('click', function() {
      const filterType = this.getAttribute('data-filter');
      if (filterType === 'type') {
        document.getElementById('filter-type').value = '';
      } else if (filterType === 'search') {
        document.getElementById('search-input').value = '';
      }
      applyFilters();
    });
  });
  
  // Filter transactions from our global allTransactions array
  if (window.allTransactions && window.allTransactions.length > 0) {
    const filteredTransactions = window.allTransactions.filter(tx => {
      const typeMatch = !filterType || tx.type === filterType;
      const textMatch = !searchText || 
                        (tx.body && tx.body.toLowerCase().includes(searchText));
      return typeMatch && textMatch;
    });
    
    // Update the UI with filtered transactions
    updateTransactionDisplay(filteredTransactions);
  } else {
    console.warn('No transactions available for filtering');
  }
}

// Function to update transaction display
function updateTransactionDisplay(transactions) {
  const container = document.getElementById('transaction-details');
  container.innerHTML = '';
  
  // Calculate totals for the filtered transactions
  let total = 0;
  transactions.forEach(tx => total += tx.amount);
  
  // Update summary
  document.getElementById('showing-count').textContent = `${transactions.length} transactions`;
  document.getElementById('showing-total').textContent = `${total.toLocaleString()} RWF`;
  
  // Display only the first 20 transactions for performance
  const displayTransactions = transactions.slice(0, 20);
  
  // Display transactions
  displayTransactions.forEach(tx => {
    const item = document.createElement('div');
    item.className = `transaction-item ${tx.type}`;
    
    // Get icon based on transaction type
    const icon = getTransactionIcon(tx.type);
    
    // Format date
    const date = new Date(tx.date);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Format amount with + or - prefix
    const isIncoming = ['deposit', 'incoming'].includes(tx.type);
    const amountPrefix = isIncoming ? '+' : '-';
    const amountClass = isIncoming ? 'incoming' : 'outgoing';
    
    // Extract description from body if available
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
        <div class="transaction-amount ${amountClass}">${amountPrefix} ${tx.amount.toLocaleString()} RWF</div>
      </div>
    `;
    
    // Add click event to show full SMS content
    item.addEventListener('click', () => {
      alert(`Full SMS Content:\n\n${tx.body}`);
    });
    
    container.appendChild(item);
  });
  
  // Show load more button if there are more transactions
  if (transactions.length > 20) {
    document.getElementById('load-more').style.display = 'inline-flex';
    // Store current filtered transactions for load more functionality
    window.currentFilteredTransactions = transactions;
  } else {
    document.getElementById('load-more').style.display = 'none';
  }
}

// Function to clear filters
function clearFilters() {
  document.getElementById('filter-type').value = '';
  document.getElementById('search-input').value = '';
  document.getElementById('active-filters').style.display = 'none';
  
  // Reset transaction display with all transactions
  if (window.allTransactions && window.allTransactions.length > 0) {
    updateTransactionDisplay(window.allTransactions);
  } else {
    console.warn('No transactions available to display');
  }
}

// Function to update chart period
function updateChartPeriod(period) {
  console.log(`Updating charts for period: ${period}`);
  
  if (!window.allTransactions || window.allTransactions.length === 0) {
    console.warn('No transactions available for filtering by period');
    return;
  }
  
  const today = new Date();
  let filteredTransactions = [];
  let periodName = '';
  
  switch(period) {
    case 'today':
      filteredTransactions = window.allTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.toDateString() === today.toDateString();
      });
      periodName = 'Today';
      break;
    case 'week':
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      filteredTransactions = window.allTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= oneWeekAgo;
      });
      periodName = 'This Week';
      break;
    case 'month':
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(today.getMonth() - 1);
      filteredTransactions = window.allTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= oneMonthAgo;
      });
      periodName = 'This Month';
      break;
    default:
      filteredTransactions = window.allTransactions;
      periodName = 'All Time';
  }
  
  // Show active filters section
  const activeFiltersSection = document.getElementById('active-filters');
  activeFiltersSection.style.display = 'block';
  
  // Add period filter tag
  const filterTags = document.getElementById('filter-tags');
  filterTags.innerHTML = '';
  
  const periodTag = document.createElement('div');
  periodTag.className = 'filter-tag';
  periodTag.innerHTML = `
    Period: ${periodName} 
    <span class="remove-tag" data-filter="period">×</span>
  `;
  filterTags.appendChild(periodTag);
  
  // Add event listener to remove period tag
  periodTag.querySelector('.remove-tag').addEventListener('click', function() {
    document.getElementById('chart-period').value = 'all';
    document.getElementById('active-filters').style.display = 'none';
    updateChartPeriod('all');
  });
  
  // Process the filtered data and update charts
  processChartData(filteredTransactions);
  
  // Update transaction display
  updateTransactionDisplay(filteredTransactions);
  
  // Update the range display in the header
  document.getElementById('range-display').textContent = `${periodName} (${filteredTransactions.length} transactions)`;
}

// Function to process chart data
function processChartData(transactions) {
  const types = {};
  const monthlyTotals = {};
  let total = 0;
  let incoming = 0;
  let outgoing = 0;

  transactions.forEach(tx => {
    // Count transaction types
    types[tx.type] = (types[tx.type] || 0) + 1;
    
    // Calculate monthly totals
    const date = new Date(tx.date);
    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyTotals[month] = (monthlyTotals[month] || 0) + tx.amount;
    
    // Calculate total amounts for displayed transactions
    total += tx.amount;
    if (['deposit', 'incoming'].includes(tx.type)) {
      incoming += tx.amount;
    } else {
      outgoing += tx.amount;
    }
  });

  // Update transaction list summary
  document.getElementById('showing-count').textContent = `${transactions.length} transactions`;
  document.getElementById('showing-total').textContent = `${total.toLocaleString()} RWF`;
  
  // Update charts
  updateCharts(types, monthlyTotals);
}

// Function to update charts
function updateCharts(types, monthlyTotals) {
  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA - dateB;
  });

  // Get chart instances
  const barChart = Chart.getChart('transaction-volume-chart');
  const lineChart = Chart.getChart('monthly-summary-chart');
  const pieChart = Chart.getChart('payment-distribution-chart');
  
  // If charts exist, update them
  if (barChart) {
    barChart.data.labels = Object.keys(types);
    barChart.data.datasets[0].data = Object.values(types);
    barChart.update();
  }
  
  if (lineChart) {
    lineChart.data.labels = sortedMonths;
    lineChart.data.datasets[0].data = sortedMonths.map(month => monthlyTotals[month]);
    lineChart.update();
  }
  
  if (pieChart) {
    pieChart.data.labels = Object.keys(types);
    pieChart.data.datasets[0].data = Object.values(types);
    pieChart.update();
  }
}

// Function to sort transactions
function sortTransactions(sortBy) {
  console.log(`Sorting transactions by: ${sortBy}`);
  
  // Get currently filtered transactions or all transactions
  let transactions = window.currentFilteredTransactions || window.allTransactions;
  
  if (!transactions || transactions.length === 0) {
    console.warn('No transactions available for sorting');
    return;
  }
  
  transactions = [...transactions]; // Create a copy to avoid modifying the original
  
  transactions.sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date); // Most recent first
    } else if (sortBy === 'amount') {
      return b.amount - a.amount; // Largest first
    } else if (sortBy === 'type') {
      return a.type.localeCompare(b.type);
    }
    return 0;
  });
  
  // Update the display with sorted transactions
  updateTransactionDisplay(transactions);
}

// Function to load more transactions
function loadMoreTransactions() {
  const container = document.getElementById('transaction-details');
  const currentCount = container.querySelectorAll('.transaction-item').length;
  
  // Get currently filtered transactions or all transactions
  const transactions = window.currentFilteredTransactions || window.allTransactions;
  
  if (!transactions || transactions.length === 0) {
    console.warn('No transactions available for loading more');
    return;
  }
  
  // Get next batch of transactions
  const nextBatch = transactions.slice(currentCount, currentCount + 20);
  
  if (nextBatch.length === 0) {
    document.getElementById('load-more').style.display = 'none';
    return;
  }
  
  // Display next batch
  nextBatch.forEach(tx => {
    const item = document.createElement('div');
    item.className = `transaction-item ${tx.type}`;
    
    // Get icon based on transaction type
    const icon = getTransactionIcon(tx.type);
    
    // Format date
    const date = new Date(tx.date);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Format amount with + or - prefix
    const isIncoming = ['deposit', 'incoming'].includes(tx.type);
    const amountPrefix = isIncoming ? '+' : '-';
    const amountClass = isIncoming ? 'incoming' : 'outgoing';
    
    // Extract description from body if available
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
        <div class="transaction-amount ${amountClass}">${amountPrefix} ${tx.amount.toLocaleString()} RWF</div>
      </div>
    `;
    
    // Add click event to show full SMS content
    item.addEventListener('click', () => {
      alert(`Full SMS Content:\n\n${tx.body}`);
    });
    
    container.appendChild(item);
  });
  
  // Hide load more button if no more transactions
  if (currentCount + nextBatch.length >= transactions.length) {
    document.getElementById('load-more').style.display = 'none';
  }
}

// Helper functions from chart.js
function extractDescription(body) {
  if (!body) return null;
  
  // Try to extract meaningful description from SMS body
  if (body.includes('received')) {
    return 'Money Received';
  } else if (body.includes('payment')) {
    const match = body.match(/payment of .+ RWF to ([^(]+)/);
    return match ? `Payment to ${match[1].trim()}` : 'Payment';
  } else if (body.includes('transferred')) {
    const match = body.match(/transferred to ([^(]+)/);
    return match ? `Transfer to ${match[1].trim()}` : 'Transfer';
  } else if (body.includes('withdrawn')) {
    return 'Withdrawal';
  } else if (body.includes('deposit')) {
    return 'Bank Deposit';
  } else if (body.includes('Airtime')) {
    return 'Airtime Purchase';
  } else if (body.includes('bundle')) {
    return 'Data Bundle';
  }
  
  return null;
}

function getTransactionIcon(type) {
  const icons = {
    'incoming': 'fas fa-arrow-down',
    'outgoing': 'fas fa-arrow-up',
    'payment': 'fas fa-shopping-cart',
    'transfer': 'fas fa-exchange-alt',
    'withdrawal': 'fas fa-money-bill-wave',
    'deposit': 'fas fa-piggy-bank',
    'airtime': 'fas fa-phone',
    'bundle': 'fas fa-wifi',
    'bill': 'fas fa-file-invoice',
    'other': 'fas fa-circle'
  };
  
  return icons[type] || 'fas fa-circle';
}

function getTransactionTitle(type) {
  const titles = {
    'incoming': 'Money Received',
    'outgoing': 'Money Sent',
    'payment': 'Payment',
    'transfer': 'Transfer',
    'withdrawal': 'Withdrawal',
    'deposit': 'Bank Deposit',
    'airtime': 'Airtime Purchase',
    'bundle': 'Data Bundle',
    'bill': 'Bill Payment',
    'other': 'Transaction'
  };
  
  return titles[type] || 'Transaction';
}