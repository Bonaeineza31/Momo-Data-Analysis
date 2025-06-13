// Chart configuration and data visualization
window.addEventListener('DOMContentLoaded', async () => {
  // Set chart defaults that match our color scheme
  Chart.defaults.color = '#666';
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  // Get total transaction count
  try {
    const countResponse = await fetch('/api/transactions/count');
    if (countResponse.ok) {
      const countData = await countResponse.json();
      document.getElementById('total-available').textContent = `Total available: ${countData.total.toLocaleString()} transactions`;
      
      // Set max value for the input
      document.getElementById('transaction-limit').max = countData.total;
    }
  } catch (error) {
    console.error('Error fetching transaction count:', error);
  }

  // Default limit for initial load
  const defaultLimit = 100;
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
});

// Function to load transactions with a specific limit
async function loadTransactions(limit) {
  try {
    // Update the range display in the header
    document.getElementById('range-display').textContent = `${limit} transactions`;
    
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
    
    // Use mock data for demonstration if API fails
    alert('Failed to fetch data from API. Using mock data instead.');
    const mockData = generateMockData();
    processTransactionData(mockData);
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
  document.getElementById('showing-count').textContent = `${transactions.length} transactions`;
  document.getElementById('showing-total').textContent = `${total.toLocaleString()} RWF`;
  
  // Create or update transaction volume chart (Bar Chart)
  const volumeChart = Chart.getChart('transaction-volume-chart');
  if (volumeChart) {
    volumeChart.data.labels = Object.keys(types);
    volumeChart.data.datasets[0].data = Object.values(types);
    volumeChart.update();
  } else {
    new Chart(document.getElementById('transaction-volume-