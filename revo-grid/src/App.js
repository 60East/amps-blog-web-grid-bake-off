import React, { Component } from 'react';
import { defineCustomElements } from '@revolist/revogrid/loader';
import { RevoGrid } from '@revolist/revogrid-react';
import { QueryControls } from './QueryControls';
import AMPSWebWoker from 'worker-loader!./query_worker.js'; // eslint-disable-line import/no-webpack-loader-syntax
import './App.css';


export default class App extends Component {
    constructor(props) {
        super(props);

        defineCustomElements();
        this.worker = null;

        this.state = {
            queryParams: {
                topic: 'orders',
                messageType: 'JSON',
                filter: '',
                topN: '',
                orderBy: '/order_id ASC',
            },
            error: '',
            columns: [
                {prop: 'order_id', name: 'Order Id', size: 200},
                {prop: 'name', name: 'Name', size: 300},
                {prop: 'price_usd', name: 'Price, USD', size: 200},
                {prop: 'quantity', name: 'Qty', size: 200},
                {prop: 'total', name: 'Total', size: 200}
            ],
            source: []
        };
    }
    
    render() {
        return (
            <div>

                <h1 id="header"><img alt="logo" src="/img/logo.png" id="logo" /> AMPS RevoGrid Demo</h1>

                <QueryControls 
                    onQuery={this.handleQueryData.bind(this)} 
                    onChange={
                        field => {this.setState({queryParams: { ...this.state.queryParams, ...field }})}
                    } 
                    error={this.state.error}
                    {...this.state.queryParams} 
                />

                <RevoGrid
                    ref={component => this.grid = component}
                    theme="compact"
                    columns={this.state.columns}
                    source={this.state.source}
                />
            </div>
        );
    }

    handleQueryData() {
        this.setState({ error: '', source: [] });

        if (this.worker) {
            // Destroy the previous worker first
            this.worker.terminate();
            this.worker = null;
        }

        // A nice way to load large queries - in a WebWorker process
        this.worker = new AMPSWebWoker();

        // start the loading
        this.worker.postMessage(this.state.queryParams);

        // waiting for the response now
        this.worker.onmessage = (function(event) {
            if (event.data.error) {
                // Show error label and reset the grid
                this.setState({ error: event.data.error.message });
            }
            else if (event.data.sow) {
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
                    this.del(event.data.oof);
                }
            }
        }).bind(this);
    }

    componentDidUpdate() {
        if (this.rendering) {
            console.timeEnd('sow_render');
            this.rendering = false;
        }
    }

    setSOWData(records) {
        this.rendering = true;
        console.time('sow_render');
        this.setState({ source: records });
    }

    update(record) {
        const source = this.state.source.slice();
        source[record.rowId] = record;

        this.grid.scrollToRow(record.rowId).then(() => {
            this.setState({ source });
        });
    }

    add(record) {
        const source = this.state.source.slice();
        source.push(record);
        // this.setState({ source });

        this.grid.scrollToRow(record.rowId).then(() => {
            this.setState({ source });
        });
    }

    del(record) {
        this.grid.scrollToRow(record.rowId).then(() => {
            const source = this.state.source.filter(row => row.order_id !== record.order_id);
            this.setState({ source });
        });
    }
}
