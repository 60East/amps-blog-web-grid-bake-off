import React, { Component } from 'react';
import Grid from '@crafts/smart-grid';
import { QueryControls } from './QueryControls';
import AMPSWebWoker from 'worker-loader!./query_worker.js'; // eslint-disable-line import/no-webpack-loader-syntax
import './App.css';


const ROW_HEIGHT = 40;
const VISIBLE_CELLS = 14;
const VIEWPORT = VISIBLE_CELLS * ROW_HEIGHT + VISIBLE_CELLS - 1; // final part is the total border length between rows


export default class App extends Component {
    constructor(props) {
        super(props);

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
                {
                    width: 200,
                    template: row => <div className="cell-wrapper">{row.order_id}</div>,
                    get: ({ order_id }) => ({ order_id }),
                    header: () => <div className="cell-wrapper">Order Id</div>,
                },
                {
                    width: 300,
                    template: row => <div className="cell-wrapper">{row.name}</div>,
                    get: ({ name }) => ({ name }),
                    header: () => <div className="cell-wrapper">Name</div>,
                },
                {
                    width: 200,
                    template: row => <div className="cell-wrapper">{row.price_usd}</div>,
                    get: ({ price_usd }) => ({ price_usd }),
                    header: () => <div className="cell-wrapper">Price, USD</div>,
                },
                {
                    width: 200,
                    template: row => <div className="cell-wrapper">{row.quantity}</div>,
                    get: ({ quantity }) => ({ quantity }),
                    header: () => <div className="cell-wrapper">Qty</div>,
                },
                {
                    width: 200,
                    template: row => <div className="cell-wrapper">{row.total}</div>,
                    get: ({ total }) => ({ total }),
                    header: () => <div className="cell-wrapper">Total</div>,
                }
            ],
            data: [],
            loading: false
        };
    }
    
    render() {
        return (
            <div>

                <h1 id="header"><img alt="logo" src="/img/logo.png" id="logo" /> AMPS Smart-Grid Demo</h1>

                <QueryControls 
                    onQuery={this.handleQueryData.bind(this)} 
                    onChange={
                        field => {this.setState({queryParams: { ...this.state.queryParams, ...field }})}
                    } 
                    error={this.state.error}
                    {...this.state.queryParams} 
                />

                <Grid
                    style={{ height: VIEWPORT }}
                    rowHeight={ROW_HEIGHT}
                    headerHeight={ROW_HEIGHT}
                    schema={this.state.columns}
                    data={this.state.data}
                    loadingMoreData={false}
                    loading={this.state.data.length === 0 && this.state.loading}
                    getGridActions={gridActions => this.gridActions = gridActions}
                />
            </div>
        );
    }

    handleQueryData() {
        this.setState({ error: '', data: [], loading: true });

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
                this.setState({ error: event.data.error.message, loading: false });
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

    setSOWData(data) {
        this.rendering = true;
        console.time('sow_render');
        this.setState({ data, loading: false });
    }

    update(record) {
        const data = this.state.data.slice();
        data[record.rowId] = record;
        this.scrollToRow(record.rowId);
        this.setState({ data });
    }

    add(record) {
        const data = this.state.data.slice();
        data.push(record);
        this.setState({ data });
        this.grid.scrollTop = this.grid.scrollHeight;
    }

    del(record) {
        const data = this.state.data.filter(row => row.order_id !== record.order_id);
        this.scrollToRow(record.rowId);
        this.setState({ data });
    }

    scrollToRow(rowIndex) {
        if (!this.grid) { this.grid = document.getElementsByClassName('grid')[0]; }
        this.grid.scrollTop = rowIndex * ROW_HEIGHT;
    }
}
