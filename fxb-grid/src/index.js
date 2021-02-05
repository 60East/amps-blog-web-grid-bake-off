/* global FXB */
var grid;
var worker;


function ready(fn){var d=document;(d.readyState==='loading')?d.addEventListener('DOMContentLoaded',fn):fn();} ready(function() {  // eslint-disable-line
    grid = new FXB.ui.Grid({
        container: 'container',
        height: 600, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
        rowKey: 'order_id',
        noClone: true,
        columns: [ //Define Table Columns
            {text: 'Order Id', id: 'order_id', width: '20%'},
            {text: 'Name', id: 'name', width: '20%'},
            {text: 'Price, USD', id: 'price_usd', width: '20%'},
            {text: 'Qty', id: 'quantity', width: '20%'},
            {text: 'Total', id: 'total', width: '20%'},
        ],
        selectionMode: 'single'
    });
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
    grid.Rebind(records);
    console.timeEnd('sow_render');
}

function update(record) {
    grid.SetSelectedRows([record.order_id]);
    grid.Refresh();
    grid.ScrollRowIntoView(record.order_id);
    grid.UpdateRow(record);
}

function add(record) {
    grid.AddRow(record);
    grid.Refresh();
    setTimeout(() => {
        grid.ScrollRowIntoView(record);
    }, 10);
}


function del(record) {
    grid.ScrollRowIntoView(record);
    grid.SetSelectedRows([record.order_id]);

    setTimeout(() => {
        grid.RemoveRow(record.order_id);
        grid.Refresh();
    }, 500);
}


function destroy() {
    grid.Rebind([]);
    grid.Refresh();
}


// Simple title() function for strings
String.prototype.toTitleCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
