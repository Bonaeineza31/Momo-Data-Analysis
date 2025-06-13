// Chart configuration and data visualization
window.addEventListener('DOMContentLoaded', async () => {
  // Set chart defaults that match our color scheme
  Chart.defaults.color = '#666';
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  // Define MTN colors
  const mtnColors = {
    blue: '#004990',
    yellow: '#ffcc00'
  };

  // Get total transaction count
  try {
    const countResponse = await fetch('/api/transactions/count');
    if (countResponse.ok) {
      const countData = await countResponse.json();
      
      // Set max value for the input
      document.getElementById('transaction-limit').max = countData.total;
    }
  } catch (error) {
    console.error('Error fetching transaction count:', error);
  }

  // Default limit for initial load
  const defaultLimit = 50;
  loadTransactions(defaultLimit);
  
  // Set up event listener for the apply limit button
  document.getElementById('apply-limit').addEventListener('click', function() {
    const limitInput = document.getElementById('transaction-limit');
    const limit = parseInt(limitInput.value);
    
    if (!isNaN(limit) && limit > 0) {
      loadTransactions(limit);
    } else {
      alert('Please enter a valid number of transactions');
    }
  });
  
  // Also apply when pressing Enter in the input field
  document.getElementById('transaction-limit').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      document.getElementById('apply-limit').click();
    }
  });
});

// Function to load transactions with a specific limit
async function loadTransactions(limit) {
  try {
    // Show loading state
    document.getElementById('data-status').textContent = 'Loading...';
    document.getElementById('data-status').className = 'status-loading';
    
    // Fetch transaction data from your backend API with limit
    const response = await fetch(`/api/transactions?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Fetched ${data.length} transactions`);

    // Store data in global variable for filtering
    window.allTransactions = data;
    
    // Fetch summary statistics for accurate totals
    const summaryResponse = await fetch('/api/summary');
    if (summaryResponse.ok) {
      const summary = await summaryResponse.json();
      
      // Update summary cards with accurate totals from database
      document.querySelector('#total-transactions span').textContent = summary.count.toLocaleString();
      document.querySelector('#total-amount span').textContent = summary.total.toLocaleString();
      document.querySelector('#total-incoming span').textContent = summary.incoming.toLocaleString();
      document.querySelector('#total-outgoing span').textContent = summary.outgoing.toLocaleString();
    }
    
    // Process the data for charts
    processTransactionData(data);
    
    // Update last updated timestamp
    document.getElementById('last-updated').textContent = new Date().toLocaleString();
    
    // Update status
    document.getElementById('data-status').textContent = 'Active';
    document.getElementById('data-status').className = 'status-active';
    
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    document.getElementById('data-status').textContent = 'Error';
    document.getElementById('data-status').className = 'status-error';
    alert('Failed to fetch data from API. Please check your server connection.');
  }
}

// Function to process transaction data and create charts
function processTransactionData(transactions) {
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
  document.getElementById('showing-total').textContent = `${total.toLocaleString()} RWF`;
  
  // Create or update transaction volume chart (Bar Chart)
  const volumeChart = Chart.getChart('transaction-volume-chart');
  if (volumeChart) {
    volumeChart.data.labels = Object.keys(types);
    volumeChart.data.datasets[0].data = Object.values(types);
    volumeChart.update();
  } else {
    new Chart(document.getElementById('transaction-volume-chart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: Object.keys(types),
        datasets: [{
          label: 'Transaction Volume',
          data: Object.values(types),
          backgroundColor: '#ffcc00', // MTN Yellow
          borderColor: '#004990', // MTN Blue
          borderWidth: 1
        }]
      },
      options: { 
        responsive: true, 
        plugins: { 
          title: { display: true, text: 'Volume by Type' },
          legend: { display: false }
        }
      }
    });
  }

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA - dateB;
  });

  // Create or update monthly summary chart (Line Chart)
  const lineChart = Chart.getChart('monthly-summary-chart');
  if (lineChart) {
    lineChart.data.labels = sortedMonths;
    lineChart.data.datasets[0].data = sortedMonths.map(month => monthlyTotals[month]);
    lineChart.update();
  } else {
    new Chart(document.getElementById('monthly-summary-chart').getContext('2d'), {
      type: 'line',
      data: {
        labels: sortedMonths,
        datasets: [{
          label: 'Monthly Total (RWF)',
          data: sortedMonths.map(month => monthlyTotals[month]),
          borderColor: '#004990', // MTN Blue
          backgroundColor: 'rgba(0, 73, 144, 0.1)', // Light blue
          fill: true,
          tension: 0.3
        }]
      },
      options: { 
        responsive: true, 
        plugins: { 
          title: { display: true, text: 'Monthly Totals' }
        }
      }
    });
  }

  // Create or update payment distribution chart (Pie Chart)
  const pieChart = Chart.getChart('payment-distribution-chart');
  if (pieChart) {
    pieChart.data.labels = Object.keys(types);
    pieChart.data.datasets[0].data = Object.values(types);
    pieChart.update();
  } else {
    // Create an array of alternating MTN colors
    const typeCount = Object.keys(types).length;
    const chartColors = Array(typeCount).fill().map((_, i) => 
      i % 2 === 0 ? '#ffcc00' : '#004990'
    );
    
    new Chart(document.getElementById('payment-distribution-chart').getContext('2d'), {
      type: 'pie',
      data: {
        labels: Object.keys(types),
        datasets: [{
          data: Object.values(types),
          backgroundColor: chartColors,
          borderColor: '#ffffff',
          borderWidth: 1
        }]
      },
      options: { 
        responsive: true, 
        plugins: { 
          title: { display: true, text: 'Type Distribution' }
        }
      }
    });
  }
  
  // Populate transaction list (limit to first 20 for performance)
  populateTransactionList(transactions.slice(0, 20));
}

// Function to populate transaction list
function populateTransactionList(transactions) {
  const container = document.getElementById('transaction-details');
  container.innerHTML = '';
  
  transactions.forEach(tx => {
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
  if (window.allTransactions && window.allTransactions.length > 20) {
    document.getElementById('load-more').style.display = 'inline-flex';
  }
}

// Helper function to extract description from SMS body
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

// Helper function to get transaction icon
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

// Helper function to get transaction title
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