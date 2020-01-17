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
            'ag-Grid',
            'Ext JS',
            'Kendo',
            // 'FancyGrid',
            'w2ui',
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
            [17.2, 11.3, 13.5].reduce((a, b) => a + b, 0) / 3,       // ag-Grid
            [107.5, 108.4, 103.3].reduce((a, b) => a + b, 0) / 3,       // Ext JS
            [77.4, 128.2, 80.65].reduce((a, b) => a + b, 0) / 3,       // Kendo
            // [0, 0, 0].reduce((a, b) => a + b, 0) / 3,      // FancyGrid
            [1205.2, 1192.5, 1181.3].reduce((a, b) => a + b, 0) / 3,          // w2ui
            28,             // Webix
        ]},
        {name: '200,000 records', data: [
            [31.4, 29.3, 30.2].reduce((a, b) => a + b, 0) / 3,       // ag-Grid
            [502.1, 563.8, 569.6].reduce((a, b) => a + b, 0) / 3,       // Ext JS
            [338.8, 334.8, 328.9].reduce((a, b) => a + b, 0) / 3,       // Kendo
            // [0, 0, 0].reduce((a, b) => a + b, 0) / 3,      // FancyGrid
            [11055.1, 11509.2, 11362.8].reduce((a, b) => a + b, 0) / 3,             // w2ui
            205,                 // Webix
        ]},
        {name: '2,000,000 records', data: [
            [17.8, 17.1, 16.9].reduce((a, b) => a + b, 0) / 3,       // ag-Grid
            [3217.2, 2536.9, 2500.6].reduce((a, b) => a + b, 0) / 3,       // Ext JS
            [2725.5, 2883.7, 2744.3].reduce((a, b) => a + b, 0) / 3,       // Kendo
            // [0, 0, 0].reduce((a, b) => a + b, 0) / 3,      // FancyGrid
            [114224.4, 114479.4, 115632.0].reduce((a, b) => a + b, 0) / 3,             // w2ui
            1504,                  // Webix
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
            'ag-Grid',
            'Ext JS',
            'Kendo',
            // 'FancyGrid',
            'w2ui',
            'Webix',
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
            59,      // ag-Grid
            34,      // Ext JS
            14,      // Kendo
            // 00,   // FancyGrid
            39,      // w2ui
            46,      // Webix
        ]},
        {name: '200,000 records', data: [
            58,      // ag-Grid
            36,      // Ext JS
            16,      // Kendo
            // 00,   // FancyGrid
            34,      // w2ui
            46,      // Webix
        ]},
        {name: '2,000,000 records', data: [
            57,      // ag-Grid
            32,      // Ext JS
            10,      // Kendo
            // 00,   // FancyGrid
            35,      // w2ui
            45,      // Webix
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
            'ag-Grid',
            'Ext JS',
            'Kendo',
            // 'FancyGrid',
            'w2ui',
            'Webix',
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
            31,      // ag-Grid
            28,      // Ext JS
            34,      // Kendo
            // 00,   // FancyGrid
            18,      // w2ui
            56,      // Webix
        ]},
        {name: '200,000 records', data: [
            34,      // ag-Grid
            27,      // Ext JS
            26,      // Kendo
            // 00,   // FancyGrid
            18,      // w2ui
            55,      // Webix
        ]},
        {name: '2,000,000 records', data: [
            29,      // ag-Grid
            26,      // Ext JS
            11,      // Kendo
            // 00,   // FancyGrid
            18,      // w2ui
            53,      // Webix
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
            'ag-Grid',
            'Ext JS',
            'Kendo',
            // 'FancyGrid',
            'w2ui',
            'Webix',
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
            4050000,      // ag-Grid
            1430000,      // Ext JS
            1080000,      // Kendo
            // 00,           // FancyGrid
            2300000,      // w2ui
            4052500,      // Webix
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
            'ag-Grid',
            'Ext JS',
            'Kendo',
            // 'FancyGrid',
            'w2ui',
            'Webix',
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
            205,      // ag-Grid
            220,      // Ext JS
            40,      // Kendo
            // 00,           // FancyGrid
            600,    // w2ui
            240,     // Webix
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
