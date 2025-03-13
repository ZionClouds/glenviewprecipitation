// Global variables
let rainfallData;
let currentInfoWindow = null;
let map;
let currentPopup = null;
let myChart;
let chartDom;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    chartDom = document.getElementById('main');
    myChart = echarts.init(chartDom);
    
    // Initialize filter buttons
    initializeFilterButtons();
    
    // Fetch initial data
    fetchRainfallData();
});

// Function to fetch data and initialize everything
async function fetchRainfallData() {
    try {
        const response = await fetch('getData.php');
        const result = await response.json();
        rainfallData = result;
        
        if (rainfallData && rainfallData.data) {
            // Initialize map
            initMap();
            
            // Process and display chart
            const processedData = processChartData(rainfallData.data);
            updateChart(processedData);
            
            // Set initial filter to hourly
            const hourlyButton = document.querySelector('[data-filter="today"]');
            if (hourlyButton) {
                hourlyButton.click();
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Filter button initialization
function initializeFilterButtons() {
    const buttons = document.querySelectorAll('[data-filter]');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Update button styles
            buttons.forEach(btn => {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-link');
            });
            this.classList.remove('btn-link');
            this.classList.add('btn-primary');
            
            // Filter and update visualizations
            const filterType = this.getAttribute('data-filter');
            const filteredData = filterData(filterType);
            updateVisualizations(filteredData);
        });
    });
}

// Data filtering function
function filterData(filterType) {
    const now = new Date();
    
    return rainfallData.data.map(location => {
        const locationKey = Object.keys(location)[0];
        const locationData = location[locationKey];
        
        // First filter the data based on time period
        let filteredPreviousData = locationData.previousData.filter(item => {
            const itemDate = new Date(item.timestamp);
            
            switch(filterType) {
                case 'hourly':
                    return (now - itemDate) <= 6 * 3600000; // 6 hours in milliseconds
                case 'today':
                    return itemDate.getDate() === now.getDate() &&
                           itemDate.getMonth() === now.getMonth() &&
                           itemDate.getFullYear() === now.getFullYear();
                case 'weekly':
                    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                    return itemDate >= oneWeekAgo;
                case 'monthly':
                    // Show last 30 days of data
                    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
                    return itemDate >= thirtyDaysAgo;
                default:
                    return true;
            }
        });
        
        // Sort by date (newest first) to handle the limiting of data points
        filteredPreviousData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Limit the number of data points based on filter type
        if (filterType === 'today' && filteredPreviousData.length > 10) {
            // Keep only the latest 10 records for today's view
            filteredPreviousData = filteredPreviousData.slice(0, 10);
        }
        
        // Resort to chronological order (oldest first)
        filteredPreviousData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        return {
            [locationKey]: {
                ...locationData,
                previousData: filteredPreviousData
            }
        };
    });
}

// Function to update all visualizations
function updateVisualizations(filteredData) {
    // Update chart
    const processedChartData = processChartData(filteredData);
    updateChart(processedChartData);
    
    // Update map markers
    updateMapMarkers(filteredData);
}

// Chart processing and updating
function processChartData(rawData) {
    // Get the first location's data for demonstration
    const locationData = rawData.map(loc => Object.values(loc)[0]);
    
    let allProcessedData = [];

    // Process data for each location
    locationData.forEach(location => {
        if (location.previousData && location.previousData.length > 0) {
            const processedData = location.previousData.map(item => {
                return {
                    date: new Date(item.timestamp),
                    level: parseFloat((item.riseLevel - 610).toFixed(2)),
                    locationName: location.city
                };
            });
            allProcessedData = [...allProcessedData, ...processedData];
        }
    });

    // Sort data by date (oldest to newest)
    allProcessedData.sort((a, b) => a.date - b.date);
    
    // Get the currently selected filter
    const activeFilter = document.querySelector('[data-filter].btn-primary')?.getAttribute('data-filter') || 'today';
    
    // Format the x-axis labels based on the selected filter
    const xAxisData = allProcessedData.map(item => {
        switch(activeFilter) {
            case 'hourly':
                return item.date.toLocaleTimeString('en-US', { 
                    hour: '2-digit',
                    minute: '2-digit'
                });
            case 'today':
                return item.date.toLocaleTimeString('en-US', { 
                    hour: '2-digit',
                    minute: '2-digit'
                });
            case 'weekly':
                // For weekly view, show both day and date
                return item.date.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });
            case 'monthly':
                // For monthly view, show day and month
                return item.date.toLocaleDateString('en-US', { 
                    month: 'short',
                    day: 'numeric'
                });
            default:
                return item.date.toLocaleDateString('en-US', { 
                    day: '2-digit',
                    month: 'short'
                });
        }
    });

    // Create a map to group data points by date label to handle duplicates
    const dateMap = new Map();
    allProcessedData.forEach((item, index) => {
        const dateLabel = xAxisData[index];
        if (!dateMap.has(dateLabel)) {
            dateMap.set(dateLabel, {
                sum: item.level,
                count: 1,
                index: index
            });
        } else {
            const existing = dateMap.get(dateLabel);
            existing.sum += item.level;
            existing.count += 1;
        }
    });

    // Create unique dates and corresponding averaged data
    const uniqueDates = Array.from(dateMap.keys());
    const observedData = uniqueDates.map(dateLabel => {
        const data = dateMap.get(dateLabel);
        return parseFloat((data.sum / data.count).toFixed(2));
    });
    
    // Generate forecast data based on the trend
    let forecastData;
    
    // Calculate where the forecast should start
    const splitIndex = Math.floor(uniqueDates.length * 0.7); // 70% observed, 30% forecast
    
    // Get the last few valid observations to use as a starting point for forecast
    const lastObservedValues = observedData.slice(Math.max(0, splitIndex - 3), splitIndex);
    let lastValidValue = observedData[splitIndex - 1];
    
    // Fallback if we don't have a valid value at the split point
    if (lastValidValue === undefined || lastValidValue === null) {
        const validValues = observedData.filter(val => val !== null && val !== undefined);
        lastValidValue = validValues[validValues.length - 1] || 7.0; // Default if no valid data
    }
    
    if (activeFilter === 'today' || activeFilter === 'hourly') {
        // For shorter time periods, create a simple trend forecast
        forecastData = uniqueDates.map((_, index) => {
            if (index < splitIndex) return null;
            
            // Simple gentle downward trend for forecast
            const distanceFromSplit = index - splitIndex;
            const trend = distanceFromSplit * 0.01;
            return parseFloat((lastValidValue * (1 - trend)).toFixed(2));
        });
    } else {
        // For longer time periods, use a more pronounced trend with variations
        forecastData = uniqueDates.map((_, index) => {
            if (index < splitIndex) return null;
            
            // More varied forecast for longer timeframes
            const distanceFromSplit = index - splitIndex;
            const trend = distanceFromSplit * 0.03;
            const variation = Math.sin(distanceFromSplit * 0.5) * 0.2; // Add some cyclic variation
            
            return parseFloat((lastValidValue * (1 - trend + variation)).toFixed(2));
        });
    }

    // Create clean observed and forecast data arrays
    const cleanObservedData = [];
    const cleanForecastData = [];
    
    // Fill observed data - include only actual observations
    for (let i = 0; i < uniqueDates.length; i++) {
        if (i < splitIndex) {
            cleanObservedData.push(observedData[i]);
            cleanForecastData.push(null);
        } else {
            cleanObservedData.push(null);
            cleanForecastData.push(forecastData[i]);
        }
    }
    
    return {
        dates: uniqueDates,
        observed: cleanObservedData,
        forecast: cleanForecastData
    };
}

function updateChart(processedData) {
    // Get current filter type
    const activeFilter = document.querySelector('[data-filter].btn-primary')?.getAttribute('data-filter') || 'today';
    
    // Set chart title based on filter
    let titleText = 'Reservoir Levels';
    switch(activeFilter) {
        case 'hourly':
            titleText += ' (Last 6 Hours)';
            break;
        case 'today':
            titleText += ' (Today - Latest 10 Readings)';
            break;
        case 'weekly':
            titleText += ' (Last 7 Days)';
            break;
        case 'monthly':
            titleText += ' (Last 30 Days)';
            break;
    }

    const option = {
        title: {
            text: titleText
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                // Filter out null values
                const validParams = params.filter(param => param.value !== null);
                
                if (validParams.length === 0) return '';
                
                // Show only the tooltip for the data being hovered
                const param = validParams[0];
                
                let tooltipText = param.axisValueLabel + '<br/>';
                tooltipText += param.marker + ' ' + param.seriesName + ': ' + param.value + ' FT';
                
                return tooltipText;
            },
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: '#999',
                    width: 1,
                    type: 'dashed'
                }
            }
        },
        legend: {
            data: ['Observed', 'Forecast'],
            bottom: 0
        },
        grid: {
            backgroundColor: '#efefef',
            show: true,
            containLabel: true,
            left: '5%',
            right: '5%',
            bottom: '10%'
        },
        xAxis: {
            type: 'category',
            data: processedData.dates,
            axisLabel: {
                rotate: activeFilter === 'monthly' || activeFilter === 'weekly' ? 45 : 0,
                fontSize: 10
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#e3e3e3',
                    width: 1,
                    type: 'solid'
                }
            }
        },
        yAxis: [{
            type: 'value',
            name: 'Level (FT)',
            min: 0,
            max: 10,
            interval: 1,
            show: true,
            splitLine: {
                lineStyle: {
                    color: '#e3e3e3',
                    width: 1,
                    type: 'solid'
                }
            }
        }],
        series: [
            {
                name: 'Observed',
                type: 'line',
                data: processedData.observed,
                smooth: 0.5,
                showSymbol: false,
                connectNulls: true, // Connect across null points
                lineStyle: {
                    color: '#01dede',
                    width: 3
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0,
                            color: '#01e5e1'
                        }, {
                            offset: 1,
                            color: '#094d98'
                        }],
                        global: false
                    }
                },
                emphasis: {
                    lineStyle: {
                        color: '#01dede',
                        width: 3
                    }
                },
                tooltip: {
                    show: true
                }
            },
            {
                name: 'Forecast',
                type: 'line',
                data: processedData.forecast,
                lineStyle: {
                    color: 'rgb(12 100 141)',
                    width: 3,
                    type: 'solid'
                },
                smooth: 0.5,
                showSymbol: false,
                connectNulls: true, // Connect across null points
                emphasis: {
                    lineStyle: {
                        color: 'rgb(12 100 141)',
                        width: 4
                    }
                }, 
                tooltip: {
                    show: true
                },
                markLine: {
                    data: [
                        {
                            yAxis: 7,
                            label: { formatter: 'Action', position: 'insideEndTop' },
                            lineStyle: { color: '#00fe00', width: 2 }
                        },
                        {
                            yAxis: 7.5,
                            label: { formatter: 'Minor', position: 'insideEndTop' },
                            lineStyle: { color: '#008c0f', width: 2 }
                        },
                        {
                            yAxis: 8,
                            label: { formatter: 'Moderate', position: 'insideEndTop' },
                            lineStyle: { color: '#ffbe0a', width: 2 }
                        },
                        {
                            yAxis: 9,
                            label: { formatter: 'Major', position: 'insideEndTop' },
                            lineStyle: { color: '#ca0c00', width: 2 }
                        }
                    ],
                    lineStyle: {
                        type: 'solid'
                    },
                    symbol: ['none', 'none'],
                    animation: false
                }
            }
        ]
    };
    
    myChart && myChart.setOption(option);
}

// Custom popup class for map
class CustomPopup extends google.maps.OverlayView {
    constructor(position, content) {
        super();
        this.position = position;
        this.content = content;
        this.div = null;
        this.visible = false;
    }

    onAdd() {
        this.div = document.createElement('div');
        this.div.innerHTML = this.content;
        this.div.style.display = 'none';
        this.div.classList.add('custom-popup');

        const panes = this.getPanes();
        panes.floatPane.appendChild(this.div);

        this.div.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        this.div.style.display = 'block';
    }

    draw() {
        if (!this.div) return;
        const overlayProjection = this.getProjection();
        const position = overlayProjection.fromLatLngToDivPixel(this.position);
        
        if (position) {
            this.div.style.left = `${position.x}px`;
            this.div.style.top = `${position.y-35}px`;
        }
    }

    onRemove() {
        if (this.div) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
        }
    }

    show() {
        if (this.div) {
            this.div.style.display = 'block';
            this.visible = true;
        }
    }

    hide() {
        if (this.div) {
            this.div.style.display = 'none';
            this.visible = false;
        }
    }

    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// Map initialization and updating
function initMap() {
    const transformedData = rainfallData.data.map(location => {
        const cityKey = Object.keys(location)[0];
        return location[cityKey];
    });

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: transformedData[0].lat, lng: transformedData[0].lng },
        zoom: 12
    });

    updateMapMarkers(rainfallData.data);
}

function updateMapMarkers(data) {
    console.log(data)
    if (!map) return;

    // Clear existing markers if any
    if (currentPopup) {
        currentPopup.hide();
        currentPopup = null;
    }

    const transformedData = data.map(location => {
        const cityKey = Object.keys(location)[0];
        return location[cityKey];
    });

    transformedData.forEach(location => {
        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.city
        });

        const popupContent = createPopupContent(location);
        let popup = new CustomPopup(
            new google.maps.LatLng(location.lat, location.lng),
            popupContent
        );

        marker.addListener('click', () => {
            if (currentPopup && currentPopup !== popup) {
                currentPopup.hide();
            }

            if (currentPopup === popup) {
                popup.hide();
                currentPopup = null;
            } else {
                popup.setMap(map);
                currentPopup = popup;
            }
        });
    });

    map.addListener('click', () => {
        if (currentPopup) {
            currentPopup.hide();
            currentPopup = null;
        }
    });
}

function createPopupContent(location) {
    return `
        <div>
            <div class="close-icon" onclick="currentPopup.hide()">x</div>
            <div class="city-name">${location.city}</div>
            <div class="last-update px-3">
                <div>Last update: ${new Date().toLocaleDateString()}</div>
                <div>${new Date().toLocaleTimeString()} CST</div>
            </div>
            <hr class="break-line" />
            <div class="rise-level">
                <img src="./assets/images/big_drop.svg" />
                <div class="rise">
                    <span>River Level</span>
                    <span class="levels">${location.currentLevels} <span style="font-size: medium;">FT</span></span>
                </div>
            </div>
            <hr class="break-line" />
            <div class="previous-data">
                <div class="previous-heading">
                    <div>Previous</div>
                    <div>Amount/Levels</div>
                </div>
                ${location.previousData.map(d => `
                    <hr class="break-line" />
                    <div class="previous-values">
                        <div>${d.timestamp}</div>
                        <div>${d.riseLevel}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
