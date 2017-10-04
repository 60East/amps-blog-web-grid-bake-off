import { Component } from '@angular/core';
import { GridOptions } from 'ag-grid/main';
import { AmpsService } from './app.amps.service';
import { QueryControls } from './app.query.controls.component';
import { populateSOW, randomDataUpdates } from './populate_sow';


@Component({
    selector: 'amps-grid',
    template: `
        <button (click)="handlePopulateSOW()">Re-Populate SOW</button>

        <input #randomizer id="randomizer"
            type="checkbox"
            [checked]="randomizerEnabled"
            (change)="handleRandomDataUpdates(randomizer.checked)" 
        />Send Random Updates<br />
        
        <query-controls
            [onControlsInit]="onControlsInit.bind(this)"
            [onQuery]="queryData.bind(this)">
        </query-controls>

        <ag-grid-angular id="ag-grid" class="ag-fresh"
            [gridOptions]="gridOptions"
            [columnDefs]="columnDefs"
            [rowData]="rowData">
        </ag-grid-angular>
    `
})
export class AMPSGrid {
    private gridOptions: GridOptions;
    private queryControls: QueryControls;
    private randomizerEnabled: boolean = false;
    rowData: any[] = [];
    columnDefs: any[] = [];

    constructor(private ampsService: AmpsService) {
        // we pass an empty gridOptions in, so we can grab the api out
        this.gridOptions = <GridOptions>{
            onGridReady: () => {
                this.gridOptions.api.sizeColumnsToFit();
            },
            getRowNodeId: item => item.order_id
        };
    }

    onControlsInit(form: QueryControls): void {
        this.queryControls = form;
    }

    queryData(queryParams: any): void  {
        let rowNode;

        // get data from AMPS and display it
        this.ampsService.getData(
            queryParams,

            // SOW loaded
            messages => {
                this.queryControls.onLoadFinish();

                // bind fresh data and column names
                console.time('render table');
                this.gridOptions.api.setColumnDefs(Object.keys(messages[0]).map(function(key: string) {
                    return {
                        // headerName: key.toTitleCase(),
                        headerName: key,
                        field: key
                    };
                }));
                this.gridOptions.api.setRowData(messages);
                console.timeEnd('render table');
            },

            // New message received
            message => {
                console.time('add row');
                this.gridOptions.api.updateRowData({add: [message]});
                rowNode = this.gridOptions.api.getRowNode(message.order_id);
                // rowNode.setSelected(true);
                this.gridOptions.api.ensureIndexVisible(rowNode.rowIndex);
                console.timeEnd('add row');
            },

            // Update message received
            message => {
                rowNode = this.gridOptions.api.getRowNode(message.order_id);
                rowNode.setData(message);
                rowNode.setSelected(true);
                this.gridOptions.api.ensureIndexVisible(rowNode.rowIndex);
            },

            // OOF (delete) message received
            message => {
                rowNode = this.gridOptions.api.getRowNode(message.order_id);
                this.gridOptions.api.ensureIndexVisible(rowNode.rowIndex);
                rowNode.setSelected(true);
                setTimeout(() => { this.gridOptions.api.removeItems([rowNode]); }, 500);
            },

            // Error occurred
            err => {
                this.queryControls.onLoadFinish(err);
                this.rowData = [];
            }
        );
    }

    handlePopulateSOW(): void {
        populateSOW(20000);
    }

    handleRandomDataUpdates(enabled: boolean): void {
        randomDataUpdates(enabled);
    }
}

