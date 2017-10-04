import React, { Component } from 'react';
import { AgGridReact } from 'ag-grid-react';
import QueryControls from './QueryControls';
import { populateSOW, randomDataUpdates } from './populate_sow';
var AMPSWebWoker = require('worker-loader!./query_worker.js');


export default class AMPSGrid extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [],
            rowData: []
        }

        this.worker = null;
    }

    handleOnGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        this.gridApi.sizeColumnsToFit();
    }

    handleOnControlsInit(controls) {
        this.controls = controls;
    }

    handleQueryData(query) {
        if (this.worker) {
            // Destroy the previous worker first
            this.worker.terminate();
            this.worker = null;
        }

        // A nice way to load large queries - in a WebWorker process
        this.worker = new AMPSWebWoker();

        // start the loading
        this.worker.postMessage(query);

        // waiting for the response now
        this.worker.onmessage = (function(event) {
            // report to the controls form
            this.controls.didFinish(event.data.error);

            if (event.data.error) {
                // Show error label and reset the grid
                this.setState({
                    rowData: []
                });
            }
            else if (event.data.sow) {
                this.setState({
                    // generate column data from the first message
                    columnDefs: Object.keys(event.data.sow[0]).map(function(key) {
                        return {headerName: key.toTitleCase(), field: key};
                    }),
                    rowData: event.data.sow
                });
            }
            else {
                var rowIndex;
                var rowNode;

                // new record
                if (event.data.p !== undefined) {
                    rowNode = this.gridApi.updateRowData({add: [event.data.p]}).add[0];
                    rowIndex = rowNode.rowIndex;
                    rowNode.setSelected(true);
                }
                // update to existing record
                else if (event.data.u !== undefined ) {
                    rowNode = this.gridApi.getRowNode(event.data.u.order_id);
                    rowNode.setData(event.data.u);
                    rowNode.setSelected(true);
                    rowIndex = rowNode.rowIndex;
                }
                // record was deleted
                else if (event.data.oof !== undefined) {
                    rowNode = this.gridApi.getRowNode(event.data.oof.order_id);
                    this.gridApi.ensureIndexVisible(rowNode.rowIndex);
                    rowNode.setSelected(true);
                    setTimeout(function() {
                        this.gridApi.removeItems([rowNode]);
                        rowIndex = null;
                    }, 500);
                }

                if (rowIndex >= 0) {
                    this.gridApi.ensureIndexVisible(rowIndex);
                }
            }
        }).bind(this);
    }

    handlePopulateSOW() {
        populateSOW(20000);
    }

    handleRandomDataUpdates() {
        randomDataUpdates();
    }


    render() {
        return (
            <div>
                <div>
                    <h1 id="header"> <img src="/assets/img/logo.png" id="logo" /> AMPS ag-grid React Demo</h1>
                    <button id="populate-sow" onClick={this.handlePopulateSOW.bind(this)}>Re-Populate SOW</button>
                    <input 
                        type="checkbox" 
                        id="randomizer" 
                        onClick={this.handleRandomDataUpdates.bind(this)} 
                    />Send Random Updates<br />
                </div>

                <QueryControls 
                    onInit={this.handleOnControlsInit.bind(this)}  
                    onQuery={this.handleQueryData.bind(this)} 
                />

                <div id="ag-grid" className="ag-fresh">
                    <AgGridReact
                        columnDefs={this.state.columnDefs}
                        rowData={this.state.rowData}
                        onGridReady={this.handleOnGridReady.bind(this)} 
                    />
                </div>
            </div>
        )
    }
};


