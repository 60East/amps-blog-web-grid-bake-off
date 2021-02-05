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
            'Tabulator',
            'FXB Grid',
            'Wijmo',
            'Revo Grid',
            'Smart Grid',
            'SyncFusion'
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
            [138.12, 141.73, 128.98].reduce((a, b) => a + b, 0) / 3,       // Tabulator
            [0.73, 0.18, 0.87].reduce((a, b) => a + b, 0) / 3,       // FXB Grid
            [17.89, 24.35, 18.38].reduce((a, b) => a + b, 0) / 3,       // Wijmo
            [42.48, 39.97, 39.61].reduce((a, b) => a + b, 0) / 3,      // Revo Grid
            [11.43, 11.29, 11.10].reduce((a, b) => a + b, 0) / 3,          // Smart Grid
            [5.54, 5.59, 5.51].reduce((a, b) => a + b, 0) / 3,             // SyncFusion
        ]},
        {name: '200,000 records', data: [
            [262.81, 263.14, 241.93].reduce((a, b) => a + b, 0) / 3,       // Tabulator
            [0.71, 0.79, 0.785].reduce((a, b) => a + b, 0) / 3,       // FXB Grid
            [108.31, 115.46, 114.83].reduce((a, b) => a + b, 0) / 3,       // Wijmo
            [116.26, 114.57, 115.48].reduce((a, b) => a + b, 0) / 3,      // Revo Grid
            [22.41, 21.96, 23.48].reduce((a, b) => a + b, 0) / 3,             // Smart Grid
            [20.72, 13.03, 13.94].reduce((a, b) => a + b, 0) / 3,                 // SyncFusion
        ]},
        {name: '2,000,000 records', data: [
            [1320.42, 1318.79, 1320.56].reduce((a, b) => a + b, 0) / 3,       // Tabulator
            [0.703, 0.694, 0.73].reduce((a, b) => a + b, 0) / 3,       // FXB Grid
            [729.95, 711.79, 735.27].reduce((a, b) => a + b, 0) / 3,       // Wijmo
            [743.44, 742.58, 743.34].reduce((a, b) => a + b, 0) / 3,      // Revo Grid
            [25.83, 23.27, 21.18].reduce((a, b) => a + b, 0) / 3,             // Smart Grid
            [15.55, 15.31, 17.45].reduce((a, b) => a + b, 0) / 3,                  // SyncFusion
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
            'Tabulator',
            'FXB Grid',
            'Wijmo',
            'Revo Grid',
            'Smart Grid',
            'SyncFusion',
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
            57,      // Tabulator
            59,      // FXB Grid
            59,      // Wijmo
            60,      // Revo Grid
            60,      // Smart Grid
            60,      // SyncFusion
        ]},
        {name: '200,000 records', data: [
            57,      // Tabulator
            59,      // FXB Grid
            59,      // Wijmo
            60,      // Revo Grid
            60,      // Smart Grid
            60,      // SyncFusion
        ]},
        {name: '2,000,000 records', data: [
            57,      // Tabulator
            59,      // FXB Grid
            59,      // Wijmo
            60,      // Revo Grid
            60,      // Smart Grid
            59,      // SyncFusion
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
            'Tabulator',
            'FXB Grid',
            'Wijmo',
            'Revo Grid',
            'Smart Grid',
            'SyncFusion',
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
            9,       // Tabulator
            49,      // FXB Grid
            33,      // Wijmo
            60,      // Revo Grid
            41,      // Smart Grid
            5,       // SyncFusion
        ]},
        {name: '200,000 records', data: [
            6,       // Tabulator
            49,      // FXB Grid
            32,      // Wijmo
            60,      // Revo Grid
            40,      // Smart Grid
            5,       // SyncFusion
        ]},
        {name: '2,000,000 records', data: [
            5,       // Tabulator
            42,      // FXB Grid
            30,      // Wijmo
            60,      // Revo Grid
            33,      // Smart Grid
            5,       // SyncFusion
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
        text: 'Memory Consumption - 2 GB of Messages'
    },
    subtitle: {
        text: '<b>Rows in a grid</b>, More is Better'
    },
    xAxis: {
        categories: [
            'Tabulator',
            'FXB Grid',
            'Wijmo',
            'Revo Grid',
            'Smart Grid',
            'SyncFusion',
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
        {name: 'Messages in 2 GB', data: [
            2400000,      // Tabulator
            4450000,      // FXB Grid
            3436000,      // Wijmo
            2680000,      // Revo Grid
            4605000,      // Smart Grid
            4551000,      // SyncFusion
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
            'Tabulator',
            'FXB Grid',
            'Wijmo',
            'Revo Grid',
            'Smart Grid',
            'SyncFusion',
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
            8,        // Tabulator
            480,      // FXB Grid
            23,       // Wijmo
            90,       // Revo Grid
            50,       // Smart Grid
            55,       // SyncFusion
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
