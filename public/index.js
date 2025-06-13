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
  
  // Filter transactions (in a real app, this would filter the actual data)
  console.log(`Filtering by type: ${filterType}, search: ${searchText}`);
  
  // For demonstration, we'll just show a message
  const transactionList = document.getElementById('transaction-details');
  const transactions = transactionList.querySelectorAll('.transaction-item');
  
  let visibleCount = 0;
  let visibleTotal = 0;
  
  transactions.forEach(tx => {
    const txType = tx.className.split(' ').find(cls => cls !== 'transaction-item');
    const txText = tx.textContent.toLowerCase();
    const amountText = tx.querySelector('.transaction-amount').textContent;
    const amount = parseInt(amountText.replace(/[^0-9]/g, ''));
    
    const typeMatch = !filterType || txType === filterType;
    const textMatch = !searchText || txText.includes(searchText);
    
    if (typeMatch && textMatch) {
      tx.style.display = 'flex';
      visibleCount++;
      visibleTotal += amount;
    } else {
      tx.style.display = 'none';
    }
  });
  
  // Update summary
  document.getElementById('showing-count').textContent = `${visibleCount} transactions`;
  document.getElementById('showing-total').textContent = `${visibleTotal.toLocaleString()} RWF`;
}

// Function to clear filters
function clearFilters() {
  document.getElementById('filter-type').value = '';
  document.getElementById('search-input').value = '';
  document.getElementById('active-filters').style.display = 'none';
  
  // Reset transaction display
  const transactions = document.querySelectorAll('.transaction-item');
  transactions.forEach(tx => {
    tx.style.display = 'flex';
  });
  
  // Reset summary (this would be more dynamic in a real app)
  const totalCount = transactions.length;
  let totalAmount = 0;
  
  transactions.forEach(tx => {
    const amountText = tx.querySelector('.transaction-amount').textContent;
    const amount = parseInt(amountText.replace(/[^0-9]/g, ''));
    totalAmount += amount;
  });
  
  document.getElementById('showing-count').textContent = `${totalCount} transactions`;
  document.getElementById('showing-total').textContent = `${totalAmount.toLocaleString()} RWF`;
}

// Function to update chart period
function updateChartPeriod(period) {
  console.log(`Updating charts for period: ${period}`);
  // In a real app, this would update the chart data based on the selected period
  // For now, we'll just show an alert
  alert(`Charts updated to show data for: ${period}`);
}

// Function to sort transactions
function sortTransactions(sortBy) {
  console.log(`Sorting transactions by: ${sortBy}`);
  
  const transactionList = document.getElementById('transaction-details');
  const transactions = Array.from(transactionList.querySelectorAll('.transaction-item'));
  
  transactions.sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.querySelector('.transaction-date').textContent);
      const dateB = new Date(b.querySelector('.transaction-date').textContent);
      return dateB - dateA; // Most recent first
    } else if (sortBy === 'amount') {
      const amountA = parseInt(a.querySelector('.transaction-amount').textContent.replace(/[^0-9]/g, ''));
      const amountB = parseInt(b.querySelector('.transaction-amount').textContent.replace(/[^0-9]/g, ''));
      return amountB - amountA; // Largest first
    } else if (sortBy === 'type') {
      const typeA = a.className.split(' ').find(cls => cls !== 'transaction-item');
      const typeB = b.className.split(' ').find(cls => cls !== 'transaction-item');
      return typeA.localeCompare(typeB);
    }
    return 0;
  });
  
  // Clear and re-append sorted transactions
  transactionList.innerHTML = '';
  transactions.forEach(tx => {
    transactionList.appendChild(tx);
  });
}

// Function to load more transactions
function loadMoreTransactions() {
  // In a real app, this would fetch more transactions from the API
  // For now, we'll just show a message
  alert('Loading more transactions...');
  
  // Hide the load more button after clicking
  document.getElementById('load-more').style.display = 'none';
}