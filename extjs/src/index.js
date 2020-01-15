/* global Ext */
var grid;
var store;
var worker;


function ready(fn){var d=document;(d.readyState==='loading')?d.addEventListener('DOMContentLoaded',fn):fn();} ready(function() {  // eslint-disable-line
    Ext.define('Orders', {
        extend: 'Ext.data.Model',
        idProperty: 'order_id',
        fields: ['order_id', 'name', 'price_usd', 'quantity', 'total']
    });

    store = Ext.create('Ext.data.Store', {model: 'Orders', data: []});

    grid = Ext.create('Ext.grid.Panel', {
        renderTo: document.getElementById('container'),
        store: store,
        height: 600,
        columns: [
            {text: 'Order Id', flex: 1, dataIndex: 'order_id'},
            {text: 'Name', flex: 1, dataIndex: 'name'},
            {text: 'Price, USD', flex: 1, dataIndex: 'price_usd'},
            {text: 'Qty', flex: 1, dataIndex: 'quantity'},
            {text: 'Total', flex: 1, dataIndex: 'total'},
        ]
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
    store.loadData(records);
    console.timeEnd('sow_render');
}


function update(record) {
    const row = store.getById(record.order_id);
    Object.keys(record).map(key => row.set(key, record[key]));
    row.commit();
    grid.getView().select(row);
    grid.getView().focusRow(row);
}


function add(record) {
    store.add(record);
    const row = store.getById(record.order_id);
    grid.getView().select(row);
    grid.getView().focusRow(row);
}


function del(record) {
    const row = store.getById(record.order_id);
    grid.getView().select(row);
    grid.getView().focusRow(row);
    store.remove(record);
}


function destroy() {
    store.loadData([]);
}


// Simple title() function for strings
String.prototype.toTitleCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
