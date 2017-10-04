/* global Highcharts, humanizeDuration */

Highcharts.setOptions({
    lang: {
        thousandsSep: ','
    }
});


// Rendering Time Graph
Highcharts.chart('rendering-container', {
    chart: {
        type: 'column'
    },
    colors: ['#53b9ce', '#008cba', '#f9c81a'],
    credits: {enabled: false},
    title: {
        text: 'SOW Data Portion: Rendering Time (Logarithmic Scale)'
    },
    subtitle: {
        text: '<b>Milliseconds</b>, Less is Better'
    },
    xAxis: {
        categories: [
            'ag-Grid (Plain)',
            'ag-Grid (React)',
            'ag-Grid (Angular4)',
            // 'PrimeNG',
            'HyperGrid',
            'SlickGrid',
            'Webix'
        ]
    },
    yAxis: {
        type: 'logarithmic',
        title: {text: 'Time, ms (Logarithmic Scale)'},
        labels: {
            format: '{value:,.0f}'
            // formatter: function() { return formatMs(this.value); }
        }
    },
    plotOptions: {
        column: {
            pointPadding: 0,
            groupPadding: 0.1,
            borderWidth: 1
        },
        series: {
            dataLabels: {
                style: {color: '#7f7f7f', cursor: 'default', fontSize: '11px'},
                enabled: true,
                format: '{y:,.0f}'
                // formatter: function() { return formatMs(this.y); }
            },
        }
    },
    series: [
        {name: '20,000 records', data: [
            [197.62, 204.00, 198.90].reduce((a, b) => a + b, 0) / 3,       // ag-Grid (Plain)
            [238.83, 215.95, 237.10].reduce((a, b) => a + b, 0) / 3,       // ag-Grid (React)
            [180.16, 189.86, 203.21].reduce((a, b) => a + b, 0) / 3,       // ag-Grid (Angular4)
            // [0, 0, 0].reduce((a, b) => a + b, 0) / 3,      // PrimeNG
            [20.37, 16.14, 16.27].reduce((a, b) => a + b, 0) / 3,          // HyperGrid
            [8.14, 8.04, 7.92].reduce((a, b) => a + b, 0) / 3,             // SlickGrid
            [26.9, 27.9, 28.34].reduce((a, b) => a + b, 0) / 3             // Webix
        ]},
        {name: '200,000 records', data: [
            [1314.09, 1353.59, 1317.42].reduce((a, b) => a + b, 0) / 3,       // ag-Grid (Plain)
            [1427.07, 1435.21, 1445.40].reduce((a, b) => a + b, 0) / 3,       // ag-Grid (React)
            [1245.82, 1312.43, 1228.95].reduce((a, b) => a + b, 0) / 3,       // ag-Grid (Angular4)
            // [0, 0, 0].reduce((a, b) => a + b, 0) / 3,      // PrimeNG
            [26.27, 25.95, 25.64].reduce((a, b) => a + b, 0) / 3,             // HyperGrid
            [11, 10.07, 9.63].reduce((a, b) => a + b, 0) / 3,                 // SlickGrid
            [208.54, 206.43, 198.98].reduce((a, b) => a + b, 0) / 3           // Webix
        ]},
        {name: '2,000,000 records', data: [
            [14043.50, 13879.38, 13632.44].reduce((a, b) => a + b, 0) / 3,       // ag-Grid (Plain)
            [14608.40, 14089.28, 14756.85].reduce((a, b) => a + b, 0) / 3,       // ag-Grid (React)
            [13168.16, 12363.80, 13025.60].reduce((a, b) => a + b, 0) / 3,       // ag-Grid (Angular4)
            // [0, 0, 0].reduce((a, b) => a + b, 0) / 3,      // PrimeNG
            [124.76, 128.89, 128.12].reduce((a, b) => a + b, 0) / 3,             // HyperGrid
            [11.4, 9.33, 12.19].reduce((a, b) => a + b, 0) / 3,                  // SlickGrid
            [1509.0, 1469.93, 1531.6].reduce((a, b) => a + b, 0) / 3             // Webix
        ]}
    ]
});


// Mouse/Touchpad FPS Graph
Highcharts.chart('fps-container', {
    chart: {
        type: 'column'
    },
    colors: ['#53b9ce', '#008cba', '#f9c81a'],
    credits: {enabled: false},
    title: {
        text: 'Scrolling Performance: Mouse/Touchpad scroll'
    },
    subtitle: {
        text: '<b>Frames per second</b>, More is Better, 60 FPS MAX'
    },
    xAxis: {
        categories: [
            'ag-Grid (Plain)',
            'ag-Grid (React)',
            'ag-Grid (Angular4)',
            // 'PrimeNG',
            'HyperGrid',
            'SlickGrid',
            'Webix'
        ]
    },
    yAxis: {
        title: {text: 'Frames per Second'},
    },
    plotOptions: {
        column: {
            pointPadding: 0.0,
            borderWidth: 0
        },
        series: {
            dataLabels: {
                style: {color: '#7f7f7f', cursor: 'default', fontSize: '11px'},
                enabled: true
            },
        }
    },
    series: [
        {name: '20,000 records', data: [
            58,      // ag-Grid (Plain)
            58,      // ag-Grid (React)
            34,      // ag-Grid (Angular4)
            // 00,   // PrimeNG
            22,      // HyperGrid
            35,      // SlickGrid
            46       // Webix
        ]},
        {name: '200,000 records', data: [
            56,      // ag-Grid (Plain)
            35,      // ag-Grid (React)
            33,      // ag-Grid (Angular4)
            // 00,   // PrimeNG
            22,      // HyperGrid
            35,      // SlickGrid
            46       // Webix
        ]},
        {name: '2,000,000 records', data: [
            33,      // ag-Grid (Plain)
            31,      // ag-Grid (React)
            28,      // ag-Grid (Angular4)
            // 00,   // PrimeNG
            20,      // HyperGrid
            35,      // SlickGrid
            45       // Webix
        ]}
    ]
});


// ScrollBar FPS Graph
Highcharts.chart('fps-scrollbar-container', {
    chart: {
        type: 'column'
    },
    colors: ['#53b9ce', '#008cba', '#f9c81a'],
    credits: {enabled: false},
    title: {
        text: 'Scrolling Performance: Scrollbar scroll'
    },
    subtitle: {
        text: '<b>Frames per second</b>, More is Better, 60 FPS MAX'
    },
    xAxis: {
        categories: [
            'ag-Grid (Plain)',
            'ag-Grid (React)',
            'ag-Grid (Angular4)',
            // 'PrimeNG',
            'HyperGrid',
            'SlickGrid',
            'Webix'
        ]
    },
    yAxis: {
        title: {text: 'Frames per Second'},
    },
    plotOptions: {
        column: {
            pointPadding: 0.0,
            borderWidth: 0
        },
        series: {
            dataLabels: {
                style: {color: '#7f7f7f', cursor: 'default', fontSize: '11px'},
                enabled: true
            },
        }
    },
    series: [
        {name: '20,000 records', data: [
            40,      // ag-Grid (Plain)
            39,      // ag-Grid (React)
            23,      // ag-Grid (Angular4)
            // 00,   // PrimeNG
            59,      // HyperGrid
            55,      // SlickGrid
            56       // Webix
        ]},
        {name: '200,000 records', data: [
            40,      // ag-Grid (Plain)
            33,      // ag-Grid (React)
            23,      // ag-Grid (Angular4)
            // 00,   // PrimeNG
            56,      // HyperGrid
            52,      // SlickGrid
            55       // Webix
        ]},
        {name: '2,000,000 records', data: [
            33,      // ag-Grid (Plain)
            32,      // ag-Grid (React)
            11,      // ag-Grid (Angular4)
            // 00,   // PrimeNG
            52,      // HyperGrid
            49,      // SlickGrid
            53       // Webix
        ]}
    ]
});

// Memory Consumption Graph
Highcharts.chart('memory-container', {
    chart: {
        type: 'column'
    },
    colors: ['#53b9ce', '#008cba', '#f9c81a'],
    credits: {enabled: false},
    title: {
        text: 'Memory Consumption - 4 GB of Messages'
    },
    subtitle: {
        text: '<b>Rows in a grid</b>, More is Better'
    },
    xAxis: {
        categories: [
            'ag-Grid (Plain)',
            'ag-Grid (React)',
            'ag-Grid (Angular4)',
            // 'PrimeNG',
            'HyperGrid',
            'SlickGrid',
            'Webix'
        ]
    },
    yAxis: {
        title: {text: 'Rows'}
    },
    plotOptions: {
        column: {
            pointPadding: 0.0,
            borderWidth: 0
        },
        series: {
            dataLabels: {
                style: {color: '#7f7f7f', cursor: 'default', fontSize: '11px'},
                enabled: true
            }
        }
    },
    series: [
        {name: 'Messages in 4 GB', data: [
            4100000,      // ag-Grid (Plain)
            3820000,      // ag-Grid (React)
            3750000,      // ag-Grid (Angular4)
            // 00,           // PrimeNG
            8100000,      // HyperGrid
            7200000,      // SlickGrid
            8105000       // Webix
        ]}
    ]
});


// Live Updates Graph
Highcharts.chart('updates-container', {
    chart: {
        type: 'column'
    },
    colors: ['#53b9ce', '#008cba', '#f9c81a'],
    credits: {enabled: false},
    title: {
        text: 'Live Grid Updates'
    },
    subtitle: {
        text: '<b>Updates per Second</b>, More is Better'
    },
    xAxis: {
        categories: [
            'ag-Grid (Plain)',
            'ag-Grid (React)',
            'ag-Grid (Angular4)',
            // 'PrimeNG',
            'HyperGrid',
            'SlickGrid',
            'Webix'
        ]
    },
    yAxis: {
        title: {text: 'Updates'}
    },
    plotOptions: {
        column: {
            pointPadding: 0.0,
            borderWidth: 0
        },
        series: {
            dataLabels: {
                style: {color: '#7f7f7f', cursor: 'default', fontSize: '11px'},
                enabled: true
            }
        }
    },
    series: [
        {name: 'Updates per Second', data: [
            60,      // ag-Grid (Plain)
            60,      // ag-Grid (React)
            60,      // ag-Grid (Angular4)
            // 00,           // PrimeNG
            1250,    // HyperGrid
            960,     // SlickGrid
            240      // Webix
        ]}
    ]
});


function formatMs(ms) {
    return humanizeDuration(ms, {
        delimiter: ' ',
        spacer: ' ',
        largest: 2,
        units: ['s', 'ms'],
        language: 'en',
        languages: {en: {s: () => 's', ms: () => 'ms'}},
        round: true
    });
}
