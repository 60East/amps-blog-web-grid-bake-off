import React, { Component } from 'react';
import { AgGridReact } from 'ag-grid-react';
import QueryControls from './QueryControls';
import { populateSOW, randomDataUpdates } from './populate_sow';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([ AllCommunityModule ]);

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
    }

    handleOnControlsInit(controls) {
        this.controls = controls;
    }

    getRowId(params) {
        return String(params.data.rowId);
    }

    fitColumnsToGrid() {
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                if (this.gridApi && this.gridApi.getAllDisplayedColumns().length) {
                    this.gridApi.sizeColumnsToFit();
                }
            });
        });
    }

    handleQueryData(query) {
        if (this.worker) {
            // Destroy the previous worker first
            this.worker.terminate();
            this.worker = null;
        }

        const reportWorkerError = (event) => {
            const message = event && (event.message || (event.error && event.error.message)) || 'The query worker failed to start.';
            this.controls.didFinish({message: message});

            if (event && event.preventDefault) {
                event.preventDefault();
            }
        };

        try {
            // A nice way to load large queries - in a WebWorker process
            this.worker = new Worker(new URL('./query_worker.js', import.meta.url));
            this.worker.onerror = reportWorkerError;
            this.worker.onmessageerror = reportWorkerError;

            // start the loading
            this.worker.postMessage(query);
        }
        catch (error) {
            reportWorkerError(error);
        }

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
                const rowData = event.data.sow;
                this.setState({
                    // Generate column data from the first message, if one exists.
                    columnDefs: rowData.length ? Object.keys(rowData[0]).map(function(key) {
                        return {headerName: key.toTitleCase(), field: key, flex: 1, minWidth: 100};
                    }) : [],
                    rowData: rowData
                }, () => {
                    this.fitColumnsToGrid();
                });
            }
            else {
                var rowIndex;
                var rowNode;

                // new record
                if (event.data.p !== undefined) {
                    rowNode = this.gridApi.applyTransaction({add: [event.data.p]}).add[0];
                    rowIndex = rowNode.rowIndex;
                    rowNode.setSelected(true);
                }
                // update to existing record
                else if (event.data.u !== undefined ) {
                    rowNode = this.gridApi.getRowNode(String(event.data.u.rowId));
                    if (!rowNode) {
                        return;
                    }
                    rowNode.setData(event.data.u);
                    rowNode.setSelected(true);
                    rowIndex = rowNode.rowIndex;
                }
                // record was deleted
                else if (event.data.oof !== undefined) {
                    rowNode = this.gridApi.getRowNode(String(event.data.oof.rowId));
                    if (!rowNode) {
                        return;
                    }
                    this.gridApi.ensureIndexVisible(rowNode.rowIndex);
                    rowNode.setSelected(true);
                    setTimeout(() => {
                        this.gridApi.applyTransaction({remove: [rowNode.data]});
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

                <div id="ag-grid" className="ag-theme-alpine">
                    <AgGridReact
                        columnDefs={this.state.columnDefs}
                        rowData={this.state.rowData}
                        getRowId={this.getRowId}
                        onGridReady={this.handleOnGridReady.bind(this)} 
                        onGridSizeChanged={this.fitColumnsToGrid.bind(this)}
                    />
                </div>
            </div>
        )
    }
};
