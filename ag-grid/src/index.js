// https://medium.com/ag-grid/how-to-test-for-the-best-html5-grid-for-streaming-updates-53545bb9256a
// https://www.ag-grid.com/javascript-grid-data-update/#batch-transactions
/* global agGrid */
var gridOptions;
var dataSource;


function ready(fn){var d=document;(d.readyState==='loading')?d.addEventListener('DOMContentLoaded',fn):fn();} ready(function() {  // eslint-disable-line
    dataSource = new AMPSViewPortDataSource();

    gridOptions = {
        columnDefs: [
            {field: 'order_id', headerName: 'Order Id'},
            {field: 'name', headerName: 'Name'},
            {field: 'price_usd', headerName: 'Price, USD', cellClass: 'cell-number'},
            {field: 'quantity', headerName: 'Qty', cellClass: 'cell-number'},
            {field: 'total', headerName: 'Total', cellClass: 'cell-number'}
        ],

        rowModelType: 'viewport',
        viewportDatasource: dataSource,
        viewportRowModelPageSize: 20,
        viewportRowModelBufferSize: 100,

        getRowNodeId: function(row) { return row.order_id; },
    };

    new agGrid.Grid(document.querySelector('#container'), gridOptions);  // eslint-disable-line
});


function queryData() {
    dataSource.query();
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
    if (dataSource) {
        dataSource.destroy();
    }
}


class AMPSViewPortDataSource {
    // Called exactly once before viewPort is used. Passes methods to be used to tell viewPort of data loads/changes.
    init(params) {
        // methods to call
        // this.params.setRowCount: (count:number, keepRenderedRows?: boolean) => void;
        // this.params.setRowData: (rowData:{[key:number]:any}) => void;
        // this.params.getRow: (rowIndex: number) => RowNode;
        this.params = params;
        this.calculateSOWRenderTime = false;
    }

    // Tell the viewport what the scroll position of the grid is, so it knows what rows it has to get
    setViewportRange(firstRow, lastRow) {
        const rows = {};

        for (let i = firstRow; i <= lastRow; ++i) {
            rows[i] = this.data[i]; 
        }

        if (this.calculateSOWRenderTime) {
            gridOptions.api.sizeColumnsToFit();
            console.timeEnd('sow_render');
            this.calculateSOWRenderTime = false;
        }
        
        this.params.setRowData(rows);
    }

    // Gets called once when viewPort is no longer used. If you need to do any cleanup, do it here.
    destroy() {
        this.data = null;

        if (this.worker) {
            // Destroy the previous worker first
            this.worker.terminate();
            this.worker = null;
        }

        this.params.setRowCount(0);
    }

    query() {
        // show loading image
        document.getElementById('loading-image').style.display = 'inline-block';
        document.getElementById('error-label').innerHTML = '';

        this.destroy();

        // A nice way to load large queries - in a WebWorker process
        this.worker = new Worker('src/query_worker.js');

        // pass params to the worker, if any
        try { var formData = collectFormData(); }
        catch (err) { return onError(err); }

        // start the loading
        console.time('load_sow');
        this.worker.postMessage(formData);

        // waiting for the response now
        this.worker.onmessage = event => {
            if (event.data.error) { onError(event.data.error); }

            // Initial SOW data portion
            else if (event.data.sow) {
                console.timeEnd('load_sow');

                // Hide loading image
                document.getElementById('loading-image').style.display = 'none';

                this.setSOWData(event.data.sow);
            }
            else {
                // new record
                if (event.data.p !== undefined) {
                    this.add(event.data.p);
                }

                // update to existing record
                else if (event.data.u !== undefined ) {
                    this.update(event.data.u);
                }

                // record was deleted
                else if (event.data.oof !== undefined) {
                    this.delete(event.data.oof);
                }
            }
        };
    }

    setSOWData(records) {
        this.calculateSOWRenderTime = true;

        console.time('sow_render');
        //  set the grid data and count
        this.data = records;
        this.params.setRowCount(this.data.length, false);
    }

    update(record) {
        console.log('record: ', record);
        // store the record in the data array
        this.data[indexByRowId(this.data, record.rowId)] = record;

        const rowNode = this.params.getRow(record.order_id);
        rowNode.setData(record);

        rowNode.setSelected(true);
        gridOptions.api.ensureIndexVisible(rowNode.rowIndex);
    }

    add(record) {
        this.data.push(record);
        this.params.setRowCount(this.data.length, true);
        gridOptions.api.ensureIndexVisible(this.data.length - 1);
    }

    delete(record) {
        const rowNode = this.params.getRow(record.order_id);

        gridOptions.api.ensureIndexVisible(rowNode.rowIndex);
        rowNode.setSelected(true);

        setTimeout(() => {
            this.data.splice(indexByRowId(this.data, record.rowId), 1);
            this.params.setRowCount(this.data.length, true);
        }, 500);
    }
}


// Simple title() function for strings
String.prototype.toTitleCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};


function indexByRowId(data, rowId) {
    // Simple binary search for row index
    if (!data) { return -1; }
    
    var start = 0;
    var end = data.length;
    var mid;

    while (start < end) {
        mid = Math.floor((start + end) / 2);

        if (data[mid].rowId < rowId) {
            start = mid + 1;
        }
        else if (data[mid].rowId > rowId) {
            end = mid;
        }
        else {
            return mid;
        }
    }

    return -1;
}
