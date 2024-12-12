let chartDom = document.getElementById('main');
let myChart = echarts.init(chartDom);
let option;

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
        data: ['23 Sep', '24 Sep', '25 Sep', '26 Sep', '27 Sep', '28 Sep', '29 Sep', '30 Sep', '1 Oct', '2 Oct'],
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
            data: [2.4, 2, 3, 2, null, null, null, null],
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
            data: [null, null, null, null, 1, 2, 2.1, 1.1],
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