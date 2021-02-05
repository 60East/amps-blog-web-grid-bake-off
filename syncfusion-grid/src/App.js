import React, { Component } from 'react';
import { ColumnDirective, ColumnsDirective, GridComponent, Inject, VirtualScroll } from '@syncfusion/ej2-react-grids';
import { QueryControls } from './QueryControls';
import AMPSWebWoker from 'worker-loader!./query_worker.js'; // eslint-disable-line import/no-webpack-loader-syntax
import './App.css';


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
                {field: 'order_id', name: 'Order Id'},
                {field: 'name', name: 'Name'},
                {field: 'price_usd', name: 'Price, USD'},
                {field: 'quantity', name: 'Qty'},
                {field: 'total', name: 'Total'}
            ],
            data: []
        };
    }
    
    render() {
        return (
            <div>

                <h1 id="header"><img alt="logo" src="/img/logo.png" id="logo" /> AMPS Syncfusion Grid Demo</h1>

                <QueryControls 
                    onQuery={this.handleQueryData.bind(this)} 
                    onChange={
                        field => {this.setState({queryParams: { ...this.state.queryParams, ...field }})}
                    } 
                    error={this.state.error}
                    {...this.state.queryParams} 
                />


                <GridComponent dataSource={this.state.data} height={600} enableVirtualization pageSettings={32}>
                    <Inject services={[VirtualScroll]} />
                    <ColumnsDirective>
                        {this.state.columns.map((column, i) => {
                            return (
                                <ColumnDirective key={i} field={column.field} headerText={column.name} width="200" />
                            );
                        })}
                    </ColumnsDirective>
                </GridComponent>
            </div>
        );
    }

    handleQueryData() {
        this.setState({ error: '', data: [] });

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

    setSOWData(data) {
        this.rendering = true;
        console.time('sow_render');
        this.setState({ data });
    }

    update(record) {
        const data = this.state.data.slice();
        data[record.rowId] = record;
        // this.scrollToRow(record.rowId);
        this.setState({ data });
    }

    add(record) {
        const data = this.state.data.slice();
        data.push(record);
        this.setState({ data });
        // this.grid.scrollTop = this.grid.scrollHeight;
    }

    del(record) {
        const data = this.state.data.filter(row => row.order_id !== record.order_id);
        // this.scrollToRow(record.rowId);
        this.setState({ data });
    }
}
