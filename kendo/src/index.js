/* global kendo */
var grid;
var worker;


function ready(fn){var d=document;(d.readyState==='loading')?d.addEventListener('DOMContentLoaded',fn):fn();} ready(function() {  // eslint-disable-line
    $('#container').kendoGrid({
        height: 1200,
        scrollable: {
            virtual: true
        },
        dataSource: [],
        pageable: {
            numeric: false,
            previousNext: false,
        },
        columns: [
            {field: 'order_id', title: 'Order Id'},
            {field: 'name', title: 'Name'},
            {field: 'price_usd', title: 'Price, USD'},
            {field: 'quantity', title: 'Qty'},
            {field: 'total', title: 'Total'}
        ]
    });

    grid = $('#container').data('kendoGrid'); 
});


function queryData() {
    // show loading image
    document.getElementById('loading-image').style.display = 'inline-block';
    document.getElementById('error-label').innerHTML = '';

    destroy();

    // A nice way to load large queries - in a WebWorker process
    worker = new Worker('src/query_worker.js');

    // pass params to the worker, if any
    try { var formData = collectFormData(); }
    catch (err) { return onError(err); }

    // start the loading
    console.time('load_sow');
    worker.postMessage(formData);

    // waiting for the response now
    worker.onmessage = event => {
        if (event.data.error) { onError(event.data.error); }

        // Initial SOW data portion
        else if (event.data.sow) {
            console.timeEnd('load_sow');

            // Hide loading image
            document.getElementById('loading-image').style.display = 'none';

            setSOWData(event.data.sow);
        }
        else {
            // new record
            if (event.data.p !== undefined) {
                add(event.data.p);
            }

            // update to existing record
            else if (event.data.u !== undefined ) {
                update(event.data.u);
            }

            // record was deleted
            else if (event.data.oof !== undefined) {
                del(event.data.oof);
            }
        }
    };
}


function collectFormData() {
    var topic = document.getElementById('topic').value;
    if (!topic) { throw new Error('Invalid topic'); }

    var messageTypeSelect = document.getElementById('message_type');
    var messageType = messageTypeSelect.options[messageTypeSelect.selectedIndex].value;

    return {
        topic: topic,
        messageType: messageType,
        filter: document.getElementById('filter').value,
        orderBy: document.getElementById('order_by').value,
        topN: document.getElementById('top_n').value
    };
}


function onError(error) {
    // Hide loading image
    document.getElementById('loading-image').style.display = 'none';

    // Show error label
    document.getElementById('error-label').innerHTML = error.message.toTitleCase();

    // reset the grid
    if (grid) {
        destroy();
    }
}


function setSOWData(records) {
    console.time('sow_render');

    const dataSource = new kendo.data.DataSource({
        pageSize: 30,
        transport: {
            create: function(e) {
                console.log('create e: ', e);
                if (e.data.models) {
                    //batch editing
                    for (var i = 0; i < e.data.models.length; i++) {
                        e.data.models[i].Id = nextId++;
                    }
                    e.success(e.data.models);
                } else {
                    e.data.Id = nextId++;
                    e.success(e.data);
                }
            },
            read: function(e) {
                console.log('read e: ', e);
                e.success(records);
            },
            update: function(e) {
                console.log('update e: ', e);
                if (e.data.models) {
                    //batch editing
                    e.success(e.data.models);
                } else {
                    e.success(e.data);
                }
            },
            destroy: function(e) {
                console.log('destroy e: ', e);
                if (e.data.models) {
                    //batch editing
                    e.success(e.data.models);
                } else {
                    e.success(e.data);
                }
            }
        },
        schema: {
            model: {
                id: 'order_id',
                fields: {
                    order_id: {type: 'number'},
                    name: {type: 'string'},
                    price_usd: {type: 'number'},
                    quantity: { type: 'number' },
                    total: { type: 'number' }
                }
            }
        }
    });

    grid.setDataSource(dataSource);

    console.timeEnd('sow_render');
}


function update(record) {
    grid.dataSource.pushUpdate(record);
    grid.dataSource.sync();
}


function add(record) {
    grid.dataSource.pushUpdate(record);
    grid.dataSource.sync();
}


function del(record) {
    grid.dataSource.remove(grid.dataSource.get(record.order_id));
}


function destroy() {
    grid.dataSource.data([]);
}


// Simple title() function for strings
String.prototype.toTitleCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
