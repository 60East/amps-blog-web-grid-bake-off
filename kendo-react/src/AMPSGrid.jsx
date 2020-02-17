import React, { Component } from 'react';
import QueryControls from './QueryControls';
import {Grid, GridColumn} from '@progress/kendo-react-grid';
import { populateSOW, randomDataUpdates } from './populate_sow';
import { registerForIntl } from '@progress/kendo-react-intl';
var AMPSWebWoker = require('worker-loader!./query_worker.js');


export default class AMPSGrid extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [],
            rowData: [],
            skip: 0,
            take: 20
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
                        return {title: key.toTitleCase(), field: key, key, width: 200};
                    }),
                    rowData: event.data.sow
                });
            }
            else {
                var rowIndex;

                // new record
                if (event.data.p !== undefined) {
                    const currentRowData = this.state.rowData;

                    currentRowData.push(event.data.p);
                    rowIndex = currentRowData.length;

                    this.setState({
                        rowData: currentRowData,
                        skip: rowIndex
                    });
                }
                // update to existing record
                else if (event.data.u !== undefined ) {
                    const currentRowData = this.state.rowData;
                    rowIndex = currentRowData.findIndex(i => i.order_id === event.data.u.order_id);

                    currentRowData[rowIndex] = event.data.u;

                    this.setState({
                        rowData: currentRowData,
                        skip: rowIndex
                    });
                }
                // record was deleted
                else if (event.data.oof !== undefined) {
                    const currentRowData = this.state.rowData;
                    rowIndex = currentRowData.findIndex(i => i.order_id === event.data.u.order_id);
                    currentRowData.splice(rowIndex, 1);

                    this.setState({
                        rowData: currentRowData,
                        skip: rowIndex
                    });
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

    onDataStateChange = (e) => {
        this.setState({
            take: e.dataState.take,
            skip: e.dataState.skip
        });
    }

    render() {
        const {take,skip,rowData} = this.state;
        return (
            <div>
                <div>
                    <h1 id="header"> <img src="/assets/img/logo.png" id="logo" /> AMPS Kendo React Demo</h1>
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

                <div id="kendo-grid">
                    <Grid
                        style={{ height: '600px' }}
                        scrollable={'virtual'}
                        // usually paging is done on server side for better virtualization,
                        // here we keep it client side to better compare with other Grids that doesn't support it
                        data={rowData.slice(skip, skip + take)}
                        skip={skip}
                        take={take}
                        total={rowData.length}
                        rowHeight={35}
                        onDataStateChange={this.onDataStateChange}
                    >
                        { this.state.columnDefs.map(column => (<GridColumn {...column} />)) }
                    </Grid>
                </div>
            </div>
        )
    }
};


