function initializeFilterButtons() {
    const buttons = document.querySelectorAll('[data-filter]');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            buttons.forEach(btn => {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-link');
            });
            
            // Add active class to clicked button
            this.classList.remove('btn-link');
            this.classList.add('btn-primary');
            
            // Filter data based on selected time period
            const filterType = this.getAttribute('data-filter');
            const filteredData = filterData(filterType);
            
            // Update the chart with filtered data
            updateChart(filteredData);
        });
    });
}

function filterData(filterType) {
    const now = new Date();
    
    return rainfallData.data.map(location => {
        const locationKey = Object.keys(location)[0];
        const locationData = location[locationKey];
        
        const filteredPreviousData = locationData.previousData.filter(item => {
            const itemDate = new Date(item.timestamp);
            
            switch(filterType) {
                case 'hourly':
                    return (now - itemDate) <= 3600000; // Last hour in milliseconds
                
                case 'today':
                    return itemDate.getDate() === now.getDate() &&
                           itemDate.getMonth() === now.getMonth() &&
                           itemDate.getFullYear() === now.getFullYear();
                
                case 'weekly':
                    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                    return itemDate >= oneWeekAgo;
                
                case 'monthly':
                    return itemDate.getMonth() === now.getMonth() &&
                           itemDate.getFullYear() === now.getFullYear();
                
                default:
                    return true;
            }
        });
        
        return {
            [locationKey]: {
                ...locationData,
                previousData: filteredPreviousData
            }
        };
    });
}

// Function to format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFilterButtons();
    
    // Set initial filter to hourly
    const hourlyButton = document.querySelector('[data-filter="hourly"]');
    if (hourlyButton) {
        hourlyButton.click();
    }
});

// Function to fetch data from API (if needed)
function fetchRainfallData() {
    try {
        const response = fetch('getData.php');
        rainfallData = response.json();
        // rainfallData = data;
        
        // Update the chart with new data
        const activeFilter = document.querySelector('.btn-primary').getAttribute('data-filter');
        const filteredData = filterData(activeFilter);
        // updateChart(filteredData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchRainfallData();