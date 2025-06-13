// Chart configuration and data visualization
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch transaction data
    const res = await fetch('/api/transactions');
    const data = await res.json();

    // Process the data
    processTransactionData(data);
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    document.getElementById('data-status').textContent = 'Error';
    document.getElementById('data-status').className = 'status-error';
    
    // Use mock data for demonstration
    const mockData = generateMockData();
    processTransactionData(mockData);
  }
  
  // Function to process transaction data and create charts
  function processTransactionData(data) {
    const types = {};
    const monthlyTotals = {};
    let total = 0;
    let incoming = 0;
    let outgoing = 0;

    data.forEach(tx => {
      // Count transaction types
      types[tx.type] = (types[tx.type] || 0) + 1;
      
      // Calculate monthly totals
      const month = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + tx.amount;
      
      // Calculate total amounts
      total += tx.amount;
      if (['deposit', 'incoming'].includes(tx.type)) {
        incoming += tx.amount;
      } else {
        outgoing += tx.amount;
      }
    });

    // Update summary cards
    document.querySelector('#total-transactions span').textContent = data.length;
    document.querySelector('#total-amount span').textContent = total.toLocaleString();
    document.querySelector('#total-incoming span').textContent = incoming.toLocaleString();
    document.querySelector('#total-outgoing span').textContent = outgoing.toLocaleString();

    // Update transaction list summary
    document.getElementById('showing-count').textContent = `${data.length} transactions`;
    document.getElementById('showing-total').textContent = `${total.toLocaleString()} RWF`;
    
    // Create transaction volume chart (Bar Chart)
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

    // Create monthly summary chart (Line Chart)
    new Chart(document.getElementById('monthly-summary-chart').getContext('2d'), {
      type: 'line',
      data: {
        labels: Object.keys(monthlyTotals),
        datasets: [{
          label: 'Monthly Total (RWF)',
          data: Object.values(monthlyTotals),
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

    // Create payment distribution chart (Pie Chart)
    new Chart(document.getElementById('payment-distribution-chart').getContext('2d'), {
      type: 'pie',
      data: {
        labels: Object.keys(types),
        datasets: [{
          data: Object.values(types),
          backgroundColor: [
            '#ffcc00', // MTN Yellow
            '#004990', // MTN Blue
            '#28a745', // Green
            '#dc3545', // Red
            '#6c757d', // Gray
            '#fd7e14', // Orange
            '#20c997', // Teal
            '#6610f2'  // Purple
          ]
        }]
      },
      options: { 
        responsive: true, 
        plugins: { 
          title: { display: true, text: 'Type Distribution' }
        }
      }
    });
    
    // Populate transaction list
    populateTransactionList(data);
  }
  
  // Function to populate transaction list
  function populateTransactionList(transactions) {
    const container = document.getElementById('transaction-details');
    container.innerHTML = '';
    
    // Display only the first 10 transactions
    const displayTransactions = transactions.slice(0, 10);
    
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
      
      item.innerHTML = `
        <div class="transaction-left">
          <div class="transaction-icon ${tx.type}">
            <i class="${icon}"></i>
          </div>
          <div class="transaction-info">
            <div class="transaction-title">${tx.description || getTransactionTitle(tx.type)}</div>
            <div class="transaction-details">${tx.reference || 'Transaction ID: ' + tx.id}</div>
            <div class="transaction-date">${formattedDate}</div>
          </div>
        </div>
        <div class="transaction-right">
          <div class="transaction-amount ${amountClass}">${amountPrefix} ${tx.amount.toLocaleString()} RWF</div>
        </div>
      `;
      
      container.appendChild(item);
    });
    
    // Show load more button if there are more transactions
    if (transactions.length > 10) {
      document.getElementById('load-more').style.display = 'inline-flex';
    }
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
      'bill': 'fas fa-file-invoice'
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
      'deposit': 'Deposit',
      'airtime': 'Airtime Purchase',
      'bundle': 'Data Bundle',
      'bill': 'Bill Payment'
    };
    
    return titles[type] || 'Transaction';
  }
  
  // Function to generate mock data for demonstration
  function generateMockData() {
    const types = ['incoming', 'outgoing', 'payment', 'transfer', 'withdrawal', 'deposit', 'airtime', 'bundle', 'bill'];
    const mockData = [];
    
    // Generate random transactions for the past 6 months
    const today = new Date();
    
    for (let i = 0; i < 50; i++) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomAmount = Math.floor(Math.random() * 500000) + 1000;
      
      // Random date within the past 6 months
      const randomDate = new Date(today);
      randomDate.setDate(today.getDate() - Math.floor(Math.random() * 180));
      
      mockData.push({
        id: 'TX' + Math.floor(Math.random() * 1000000),
        type: randomType,
        amount: randomAmount,
        date: randomDate.toISOString(),
        description: getTransactionTitle(randomType),
        reference: 'REF' + Math.floor(Math.random() * 1000000)
      });
    }
    
    return mockData;
  }
});