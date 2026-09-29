import { Component, Inject } from '@angular/core';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    GridApi,
    GridOptions,
    ModuleRegistry,
    RowApiModule,
    RowSelectionModule,
    ScrollApiModule
} from 'ag-grid-community';
import { AmpsService } from './app.amps.service';
import { QueryControls } from './app.query.controls.component';
import { populateSOW, randomDataUpdates } from './populate_sow';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    ColumnAutoSizeModule,
    RowApiModule,
    RowSelectionModule,
    ScrollApiModule
]);

@Component({
    selector: 'amps-grid',
    standalone: false,
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

        <ag-grid-angular id="ag-grid" class="ag-theme-quartz"
            [gridOptions]="gridOptions"
            [columnDefs]="columnDefs"
            [rowData]="rowData">
        </ag-grid-angular>
    `
})
export class AMPSGrid {
    private gridOptions: GridOptions;
    private gridApi: GridApi;
    private queryControls: QueryControls;
    private randomizerEnabled: boolean = false;
    rowData: any[] = [];
    columnDefs: any[] = [];

    constructor(@Inject(AmpsService) private ampsService: AmpsService) {
        // we pass an empty gridOptions in, so we can grab the api out
        this.gridOptions = <GridOptions>{
            onGridReady: params => {
                this.gridApi = params.api;
                this.gridApi.sizeColumnsToFit();
            },
            getRowId: item => String(item.data.order_id),
            autoSizeStrategy: {
                type: 'fitGridWidth',
                continuous: true
            },
            suppressHorizontalScroll: true,
            rowSelection: {
                mode: 'singleRow',
                checkboxes: false,
                enableClickSelection: false
            }
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

                if (messages.length === 0) {
                    this.gridApi.setGridOption('columnDefs', []);
                    this.gridApi.setGridOption('rowData', []);
                    return;
                }

                // bind fresh data and column names
                console.time('render table');
                this.gridApi.setGridOption('columnDefs', Object.keys(messages[0]).map(function(key: string) {
                    return {
                        // headerName: key.toTitleCase(),
                        headerName: key,
                        field: key
                    };
                }));
                this.gridApi.setGridOption('rowData', messages);
                requestAnimationFrame(() => this.gridApi.sizeColumnsToFit());
                console.timeEnd('render table');
            },

            // New message received
            message => {
                console.time('add row');
                this.gridApi.applyTransaction({add: [message]});
                rowNode = this.gridApi.getRowNode(String(message.order_id));
                if (rowNode) {
                    // rowNode.setSelected(true);
                    this.gridApi.ensureNodeVisible(rowNode, 'middle');
                }
                console.timeEnd('add row');
            },

            // Update message received
            message => {
                rowNode = this.gridApi.getRowNode(String(message.order_id));
                if (rowNode) {
                    rowNode.setData(message);
                    rowNode.setSelected(true);
                    this.gridApi.ensureNodeVisible(rowNode, 'middle');
                }
                else {
                    this.gridApi.applyTransaction({add: [message]});
                }
            },

            // OOF (delete) message received
            message => {
                rowNode = this.gridApi.getRowNode(String(message.order_id));
                if (rowNode) {
                    this.gridApi.ensureNodeVisible(rowNode, 'middle');
                    rowNode.setSelected(true);
                    setTimeout(() => { this.gridApi.applyTransaction({remove: [rowNode.data]}); }, 500);
                }
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
