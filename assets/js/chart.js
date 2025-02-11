function processChartData(rawData) {
    // Get the first location's data (you can modify to handle multiple locations)
    const locationData = Object.values(rawData[0]);
    
    // Process dates and levels
    const processedData = locationData[0].previousData.map(item => {
        return {
            date: new Date(item.timestamp),
            level: parseFloat((item.riseLevel - 610).toFixed(2)) // Adjust the base level as needed
        };
    });

    // Sort by date
    processedData.sort((a, b) => a.date - b.date);

    // Format dates for x-axis
    const xAxisData = processedData.map(item => 
        item.date.toLocaleDateString('en-US', { 
            day: '2-digit',
            month: 'short'
        })
    );

    // Create observed and forecast data
    const midPoint = Math.floor(processedData.length / 2);
    const observedData = processedData.map((item, index) => 
        index < midPoint ? item.level : null
    );
    
    const forecastData = processedData.map((item, index) => {
        if (index < midPoint) return null;
        // Calculate forecast based on last observed value
        const lastObserved = processedData[midPoint - 1].level;
        return parseFloat((lastObserved * (1 - (index - midPoint) * 0.1)).toFixed(2));
    });

    return {
        dates: xAxisData,
        observed: observedData,
        forecast: forecastData
    };
}

let chartDom = document.getElementById('main');
let myChart = echarts.init(chartDom);
let option;
let processedData;

$(document).ready(function() {
    $.ajax({
        url: "getData.php",
        type: "GET",
        success: function(response) {
            data = response.data;
            if(data) {
                // Usage:
                // Assuming your data is in a variable called 'jsonData'
                processedData = processChartData(data);
                if(processedData) {
                    initChart();
                }
            }
        },
        error: function(xhr, status, error) {
            console.log(error);
        }
    })
})

function initChart() {
    option = {
        title: {
            text: 'Reservoir Levels Observed and Forecast'
        },
        tooltip: {
            trigger: 'axis',
        },
        // legend: {
        //   data: ['Observed', 'Forecast']
        // },
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
        yAxis: [
        {
            type: 'value',
            min: 0,     // Start Y-axis from 1
            max: 10,    // End Y-axis at 15
            interval: 1,
            show: true,
            splitLine: {
                lineStyle: {
                    color: '#e3e3e3',
                    width: 2,
                    type: 'solid'
                }
            }
        },
        // {
        //   type: 'value',
        //   name: 'Action',
        //   min: 1,
        //   max: 10,
        //   position: 'left',
        //   axisLabel: {
        //     formatter: '{value} ft'
        //   }
        // },
        // {
        //   type: 'value',
        //   name: 'Action',
        //   min: 7,
        //   max: 7,
        //   position: 'left',
        //   axisLabel: {
        //     formatter: '{value} ft'
        //   }
        // }
        ],
        series: [
            {
                name: 'Observed',
                type: 'line',
                stack: 'Total',
                data: processedData.observed,
                smooth: 0.5,
                showSymbol: false,
                lineStyle: {
                    color: '#01dede',  // Line color
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
                            offset: 0, color: '#01e5e1'
                        }, {
                            offset: 1, color: '#094d98'
                        }],
                        global: false
                    }
                    // new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    //     { offset: 1, color: 'rgb(7 92 159)' },   // Gradient start color (top)
                    //     { offset: 0, color: 'rgb(0 245 232)' }     // Gradient end color (bottom)
                    // ])
                },
                emphasis: {
                    lineStyle: {
                        color: '#01dede',  // Hovered line color
                        width: 3
                    },
                    areaStyle: {
                        // Optional: Change area style on hover (you can also keep it the same)
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: '#01e5e1'
                            }, {
                                offset: 1, color: '#094d98'
                            }],
                            global: false
                        }
                        // new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        //     { offset: 0, color: 'rgb(0, 255, 255)' },  // Hover top color
                        //     { offset: 1, color: 'rgb(7, 92, 159)' }   // Hover bottom color
                        // ])
                    }
                }
            },
            {
                name: 'Forecast',
                type: 'line',
                stack: 'Total',
                data: processedData.forecast,
                lineStyle: {
                    color: 'rgb(12 100 141)',  // Set the line color to red
                    width: 3,          // Optional: set the line width
                    type: 'solid'      // Optional: 'solid', 'dashed', or 'dotted'
                },
                emphasis: {
                    lineStyle: {
                        color: 'rgb(12 100 141)',
                    }
                },
                smooth: 0.5,
                showSymbol: false,
                markLine: {
                    data: [
                        // {
                        //     yAxis: 1.5, // threshold value]
                        //     label: {
                        //         formatter: 'Low Threshold'
                        //     }
                        // },
                        {
                            yAxis: 7, // threshold value
                            label: {
                                formatter: 'Action'
                            },
                            lineStyle: {
                                color: '#00fe00'
                            }
                        },
                        {
                            yAxis: 7.5, // threshold value
                            label: {
                                formatter: 'Minor'
                            },
                            lineStyle: {
                                color: '#008c0f'
                            }
                        },
                        {
                            yAxis: 8, // threshold value
                            label: {
                                formatter: 'Moderate'
                            },
                            lineStyle: {
                                color: '#ffbe0a'
                            }
                        },
                        {
                            yAxis: 9, // threshold value
                            label: {
                                formatter: 'Major'
                            },
                            lineStyle: {
                                color: '#ca0c00'
                            }
                        }
                    ],
                    lineStyle: {
                        color: 'black', // color of the threshold line
                        type: 'solid' // line style: solid, dashed, etc.
                    },
                    symbol: ['none'],
                }
            }
        ]
    }
    
    option && myChart.setOption(option);
}

// function initializeChart(data) {
//     let chartDom = document.getElementById('main');
//     let myChart = echarts.init(chartDom);
    
//     // Transform the data
//     const transformedData = data.map(location => {
//         const cityKey = Object.keys(location)[0];
//         return location[cityKey];
//     });

//     // Process timestamps and levels for the chart
//     const firstLocation = transformedData[0];  // Using first location for example
//     const timestamps = firstLocation.previousData.map(d => {
//         // Format timestamp to desired format (e.g., "06 Sep")
//         const date = new Date(d.timestamp);
//         return date.toLocaleDateString('en-US', { 
//             day: '2-digit',
//             month: 'short'
//         });
//     });

//     const levels = firstLocation.previousData.map(d => {
//         // Convert riseLevel to the scale you need
//         // You might need to adjust this conversion based on your requirements
//         return parseFloat((d.riseLevel - 610).toFixed(2));  // Example conversion
//     });

//     const option = {
//         title: {
//             text: 'Reservoir Levels Observed and Forecast'
//         },
//         tooltip: {
//             trigger: 'axis',
//         },
//         grid: {
//             backgroundColor: '#efefef',
//             show: true,
//         },
//         xAxis: {
//             type: 'category',
//             data: timestamps,
//             splitLine: {
//                 show: true,
//                 lineStyle: {
//                     color: '#e3e3e3',
//                     width: 2,
//                     type: 'solid'
//                 }
//             }
//         },
//         yAxis: [{
//             type: 'value',
//             min: 0,
//             max: 10,
//             interval: 1,
//             show: true,
//             splitLine: {
//                 lineStyle: {
//                     color: '#e3e3e3',
//                     width: 2,
//                     type: 'solid'
//                 }
//             }
//         }],
//         series: [
//             {
//                 name: 'Observed',
//                 type: 'line',
//                 stack: 'Total',
//                 data: levels,
//                 smooth: 0.5,
//                 showSymbol: false,
//                 lineStyle: {
//                     color: '#01dede',
//                     width: 3
//                 },
//                 areaStyle: {
//                     color: {
//                         type: 'linear',
//                         x: 0,
//                         y: 0,
//                         x2: 0,
//                         y2: 1,
//                         colorStops: [{
//                             offset: 0,
//                             color: '#01e5e1'
//                         }, {
//                             offset: 1,
//                             color: '#094d98'
//                         }],
//                         global: false
//                     }
//                 },
//                 emphasis: {
//                     lineStyle: {
//                         color: '#01dede',
//                         width: 3
//                     },
//                     areaStyle: {
//                         color: {
//                             type: 'linear',
//                             x: 0,
//                             y: 0,
//                             x2: 0,
//                             y2: 1,
//                             colorStops: [{
//                                 offset: 0,
//                                 color: '#01e5e1'
//                             }, {
//                                 offset: 1,
//                                 color: '#094d98'
//                             }],
//                             global: false
//                         }
//                     }
//                 }
//             },
//             {
//                 name: 'Forecast',
//                 type: 'line',
//                 stack: 'Total',
//                 data: new Array(timestamps.length).fill(null),  // Empty forecast data
//                 lineStyle: {
//                     color: 'rgb(12 100 141)',
//                     width: 3,
//                     type: 'solid'
//                 },
//                 emphasis: {
//                     lineStyle: {
//                         color: 'rgb(12 100 141)',
//                     }
//                 },
//                 smooth: 0.5,
//                 showSymbol: false,
//                 markLine: {
//                     data: [
//                         {
//                             yAxis: 7,
//                             label: { formatter: 'Action' },
//                             lineStyle: { color: '#00fe00' }
//                         },
//                         {
//                             yAxis: 7.5,
//                             label: { formatter: 'Minor' },
//                             lineStyle: { color: '#008c0f' }
//                         },
//                         {
//                             yAxis: 8,
//                             label: { formatter: 'Moderate' },
//                             lineStyle: { color: '#ffbe0a' }
//                         },
//                         {
//                             yAxis: 9,
//                             label: { formatter: 'Major' },
//                             lineStyle: { color: '#ca0c00' }
//                         }
//                     ],
//                     lineStyle: {
//                         color: 'black',
//                         type: 'solid'
//                     },
//                     symbol: ['none'],
//                 }
//             }
//         ]
//     };

//     myChart.setOption(option);
// }
