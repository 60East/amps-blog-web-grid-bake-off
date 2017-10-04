/* global agGrid */
var worker;
var data;
var gridOptions;

function ready(fn){var d=document;(d.readyState==='loading')?d.addEventListener('DOMContentLoaded',fn):fn();} ready(function() {  // eslint-disable-line
    gridOptions = {
        columnDefs: [],
        rowData: [],
        onGridReady: function() {
            gridOptions.api.sizeColumnsToFit();
        },
        getRowNodeId: function(row) { return row.order_id; },
    };

    new agGrid.Grid(document.querySelector('#ag-grid'), gridOptions);  // eslint-disable-line
});


function queryData() {  // eslint-disable-line
    // show loading image
    document.getElementById('loading-image').style.display = 'inline-block';
    document.getElementById('error-label').innerHTML = '';

    if (worker) {
        // Destroy the previous worker first
        worker.terminate();
        worker = null;
    }

    // A nice way to load large queries - in a WebWorker process
    worker = new Worker('src/query_worker.js');

    // pass params to the worker, if any
    try { var formData = collectFormData(); }
    catch (err) { return onError(err); }

    // start the loading
    worker.postMessage(formData);

    // waiting for the response now
    worker.onmessage = function(event) {
        // Hide loading image
        document.getElementById('loading-image').style.display = 'none';

        if (event.data.error) { onError(event.data.error); }
        else if (event.data.sow) {
            data = event.data.sow;
            // generate column data from the first message
            gridOptions.api.setColumnDefs(Object.keys(data[0]).map(function(key) {
                return {headerName: key.toTitleCase(), field: key};
            }));
            gridOptions.api.sizeColumnsToFit();

            //  set the grid data
            gridOptions.api.setRowData(data);
        }
        else {
            var rowIndex;
            var rowNode;

            // new record
            if (event.data.p !== undefined) {
                rowNode = gridOptions.api.updateRowData({add: [event.data.p]}).add[0];
                rowIndex = rowNode.rowIndex;
                rowNode.setSelected(true);
            }
            // update to existing record
            else if (event.data.u !== undefined ) {
                rowNode = gridOptions.api.getRowNode(event.data.u.order_id);
                rowNode.setData(event.data.u);
                rowNode.setSelected(true);
                rowIndex = rowNode.rowIndex;
            }
            // record was deleted
            else if (event.data.oof !== undefined) {
                rowNode = gridOptions.api.getRowNode(event.data.oof.order_id);
                gridOptions.api.ensureIndexVisible(rowNode.rowIndex);
                rowNode.setSelected(true);
                setTimeout(function() {
                    gridOptions.api.removeItems([rowNode]);
                    rowIndex = null;
                }, 500);
            }

            if (rowIndex >= 0) {
                gridOptions.api.ensureIndexVisible(rowIndex);
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
    if (gridOptions && gridOptions.api) { gridOptions.api.setRowData([]); }
}


// Simple title() function for strings
String.prototype.toTitleCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
