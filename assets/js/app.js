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
        
        const filteredPreviousData = locationData.previousData.filter(item => {
            const itemDate = new Date(item.timestamp);
            
            switch(filterType) {
                case 'hourly':
                    return (now - itemDate) <= 3600000;
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
    const locationData = Object.values(rawData[0]);
    
    const processedData = locationData[0].previousData.map(item => {
        return {
            date: new Date(item.timestamp),
            level: parseFloat((item.riseLevel - 610).toFixed(2))
        };
    });

    processedData.sort((a, b) => a.date - b.date);

    const xAxisData = processedData.map(item => 
        item.date.toLocaleDateString('en-US', { 
            day: '2-digit',
            month: 'short'
        })
    );

    const midPoint = Math.floor(processedData.length / 2);
    const observedData = processedData.map((item, index) => 
        index < midPoint ? item.level : null
    );
    
    const forecastData = processedData.map((item, index) => {
        if (index < midPoint) return null;
        const lastObserved = processedData[midPoint - 1].level;
        return parseFloat((lastObserved * (1 - (index - midPoint) * 0.1)).toFixed(2));
    });

    return {
        dates: xAxisData,
        observed: observedData,
        forecast: forecastData
    };
}

function updateChart(processedData) {
    console.log(processedData, "fsgdgsdfgfsdg");
    const option = {
        title: {
            text: 'Reservoir Levels Observed and Forecast'
        },
        tooltip: {
            trigger: 'axis',
        },
        grid: {
            backgroundColor: '#efefef',
            show: true,
        },
        xAxis: {
            type: 'category',
            data: processedData.dates,
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#e3e3e3',
                    width: 2,
                    type: 'solid'
                }
            }
        },
        yAxis: [{
            type: 'value',
            min: 0,
            max: 10,
            interval: 1,
            show: true,
            splitLine: {
                lineStyle: {
                    color: '#e3e3e3',
                    width: 2,
                    type: 'solid'
                }
            }
        }],
        series: [
            {
                name: 'Observed',
                type: 'line',
                stack: 'Total',
                data: processedData.observed,
                smooth: 0.5,
                showSymbol: false,
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
                }
            },
            {
                name: 'Forecast',
                type: 'line',
                stack: 'Total',
                data: processedData.forecast,
                lineStyle: {
                    color: 'rgb(12 100 141)',
                    width: 3,
                    type: 'solid'
                },
                smooth: 0.5,
                showSymbol: false,
                markLine: {
                    data: [
                        {
                            yAxis: 7,
                            label: { formatter: 'Action' },
                            lineStyle: { color: '#00fe00' }
                        },
                        {
                            yAxis: 7.5,
                            label: { formatter: 'Minor' },
                            lineStyle: { color: '#008c0f' }
                        },
                        {
                            yAxis: 8,
                            label: { formatter: 'Moderate' },
                            lineStyle: { color: '#ffbe0a' }
                        },
                        {
                            yAxis: 9,
                            label: { formatter: 'Major' },
                            lineStyle: { color: '#ca0c00' }
                        }
                    ],
                    lineStyle: {
                        color: 'black',
                        type: 'solid'
                    },
                    symbol: ['none']
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