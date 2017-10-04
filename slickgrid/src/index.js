/* global Slick */
var grid;
var worker;
var data;

var options = {
    enableCellNavigation: true,
    enableColumnReorder: false
};


function ready(fn){var d=document;(d.readyState==='loading')?d.addEventListener('DOMContentLoaded',fn):fn();} ready(function() {   // eslint-disable-line 
    grid = new Slick.Grid('#slick-grid', [], [], options);
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
            grid.setColumns(
                Object.keys(data[0]).map(function(item) {return {id: item, name: item.toTitleCase(), field: item};})
            );
            grid.setData(data, true);
            grid.render();
        }
        else {
            var rowIndex = event.data.rowIndex;

            // new record
            if (event.data.p !== undefined) {
                data.push(event.data.p);
                rowIndex = data.length;
                grid.invalidateRow(rowIndex);
                grid.updateRowCount();
                grid.render();
            }
            // update to existing record
            else if (event.data.u !== undefined ) {
                data[rowIndex] = event.data.u;
                grid.invalidateRow(rowIndex);
            }
            // record was deleted
            else if (event.data.oof !== undefined) {
                data.splice(rowIndex, 1);
                grid.invalidateRow(rowIndex);
            }

            if (rowIndex >= 0) {
                grid.scrollRowIntoView(rowIndex);
                grid.flashCell(rowIndex, 0, 500);
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
        topN: document.getElementById('topN').value
    };
}


function onError(error) {
    // Hide loading image
    document.getElementById('loading-image').style.display = 'none';

    // Show error label
    document.getElementById('error-label').innerHTML = error.message.toTitleCase();

    // reset the grid
    if (grid) { grid.setData([]); }
}


// Simple title() function for strings
String.prototype.toTitleCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
