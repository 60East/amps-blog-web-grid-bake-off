import {Component, OnInit} from '@angular/core';
import { AMPSMessage } from './amps-message';
import { AmpsService } from './app.amps.service';

/*
 * [paginator]="true" 
 * [rows]="25"
 */

@Component({
    moduleId: module.id,
    selector: 'amps-table',
    template: `
    <p-dataTable 
        [value]="displayData" 
        selectionMode="single" 
        groupField="order_id" 
        resizableColumns="true" 
        [sortableRowGroup]="false" 
        sortField="order_id"
        [responsive]="true">

        <p-column 
            *ngFor="let col of columnNames"  
            [field]="col.field" 
            [header]="col.header" 
            [style]="col.style"
            [sortable]="true">
        </p-column>

    </p-dataTable>
    `
})
export class TableViewComponent implements OnInit {
    columnNames: any[];

    // data
    displayData: AMPSMessage[];
    // filter: string = '/id < 1000';
    filter: string = '';

    getMessageId(index: number, message: AMPSMessage) {
        return message.ts;
    }

    constructor(private ampsService: AmpsService) {}

    ngOnInit() {
        this.columnNames = [
            {'field': 'order_id', 'header': 'Order ID', 'style': {'width': '75px'}},
            {'field': 'name', 'header': 'Name', 'style': {'width': '400px'}},
            {'field': 'price_usd', 'header': 'Price' },
            {'field': 'quantity', 'header': 'Quantity'},
            {'field': 'total', 'header': 'Total Price'}
        ];

        // get data from AMPS and display it
        this.ampsService
            .getTableData(this.filter)
            .then(messageData => this.displayData = messageData)
            .catch((err) => { alert('Error occurred'); });
    }
}
