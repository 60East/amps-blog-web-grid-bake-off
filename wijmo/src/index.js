/* global wijmo */
var grid;
var view;
var worker;


function ready(fn){var d=document;(d.readyState==='loading')?d.addEventListener('DOMContentLoaded',fn):fn();} ready(function() {  // eslint-disable-line
    grid = new wijmo.grid.FlexGrid('#container', {
        newRowAtTop: false,
        autoGenerateColumns: false,
        columns: [
            {header: 'Order Id', binding: 'order_id', isReadOnly: true, width: '*'},
            {header: 'Name', binding: 'name', width: '*'},
            {header: 'Price, USD', binding: 'price_usd', width: '*'},
            {header: 'Qty', binding: 'quantity', width: '*'},
            {header: 'Total', binding: 'total', width: '*'},
        ],
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

    view = new wijmo.collections.CollectionView(records);

    //  set the grid data and count
    grid.itemsSource = view;

    console.timeEnd('sow_render');
}

function update(record) {
    if (!view) { return; }
    
    grid.scrollIntoView(record.rowId, -1);
    view.sourceCollection[record.rowId] = record;
    view.refresh();
}

function add(record) {
    if (!view) { return; }
    view.addNew(record, true);
}


function del(record) {
    if (!view) { return; }
    grid.scrollIntoView(record.rowId, -1);

    setTimeout(() => {
        view.removeAt(record.rowId);
    }, 500);
}


function destroy() {
    grid.itemsSource = null;
    if (view) {
        view.sourceCollection = [];
        view.refresh();
    }
}


// Simple title() function for strings
String.prototype.toTitleCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
