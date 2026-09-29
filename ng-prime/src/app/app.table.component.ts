import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import { AMPSMessage } from './amps-message';
import { AmpsService } from './app.amps.service';

/*
 * [paginator]="true" 
 * [rows]="25"
 */

@Component({
    standalone: false,
    selector: 'amps-table',
    template: `
    <p-table
        class="legacy-data-table"
        [value]="displayData"
        dataKey="order_id"
        [rowTrackBy]="getMessageId"
        [scrollable]="true"
        scrollHeight="800px"
        [virtualScroll]="true"
        [virtualScrollItemSize]="38"
        sortField="order_id"
        [sortOrder]="1">
        <ng-template #header>
            <tr>
                <th
                    *ngFor="let col of columnNames"
                    [pSortableColumn]="col.field"
                    [style]="col.style">
                    {{ col.header }}
                    <p-sort-icon [field]="col.field"></p-sort-icon>
                </th>
            </tr>
        </ng-template>
        <ng-template #body let-message>
            <tr>
                <td *ngFor="let col of columnNames">{{ message[col.field] }}</td>
            </tr>
        </ng-template>
        <ng-template #emptymessage>
            <tr class="legacy-empty-row">
                <td [attr.colspan]="columnNames.length">No records found</td>
            </tr>
        </ng-template>
    </p-table>
    `
})
export class TableViewComponent implements OnInit {
    private readonly ampsService = inject(AmpsService);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    columnNames: any[];

    // data
    displayData: AMPSMessage[] = [];
    // filter: string = '/id < 1000';
    filter: string = '';

    getMessageId(index: number, message: AMPSMessage) {
        return message.ts;
    }

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
            .then(messageData => {
                this.displayData = messageData;
                this.changeDetectorRef.detectChanges();
            })
            .catch((err) => { alert('Error occurred'); });
    }
}
