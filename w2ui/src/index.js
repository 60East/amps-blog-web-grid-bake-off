/* global w2ui */
var grid;
var worker;


function ready(fn){var d=document;(d.readyState==='loading')?d.addEventListener('DOMContentLoaded',fn):fn();} ready(function() {  // eslint-disable-line
    $('#container').w2grid({ 
        name: 'grid', 
        multiSelect: false,
        instant: true,
        recid: 'order_id',
        columns: [                
            {field: 'order_id', caption: 'Order Id', size: '20%'},
            {field: 'name', caption: 'Name', size: '20%'},
            {field: 'price_usd', caption: 'Price, USD', size: '20%'},
            {field: 'quantity', caption: 'Qty', size: '20%'},
            {field: 'total', caption: 'Total', size: '20%'}
        ],
        records: []
    });

    grid = w2ui['grid'];
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

    //  set the grid data and count
    grid.records = records;
    grid.total = records.length;
    grid.refresh();
    console.timeEnd('sow_render');
}

function update(record) {
    // grid.select(record.order_id);
    grid.scrollIntoView(record.rowId, 0, true);
    grid.set(record.order_id, record);
}

function add(record) {
    grid.add(record);
    grid.scrollIntoView(grid.records.length, 0, true);
}


function del(record) {
    grid.select(record.order_id);
    grid.scrollIntoView(grid.get(record.order_id, true), 0, true);

    setTimeout(() => {
        grid.remove(record.order_id);
    }, 500);
}


function destroy() {
    grid.clear();
    grid.records = [];
    grid.total = 0;
    grid.refresh();
}


// Simple title() function for strings
String.prototype.toTitleCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
