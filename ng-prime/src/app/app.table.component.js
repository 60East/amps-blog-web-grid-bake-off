var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AmpsService } from './app.amps.service';
/*
 * [paginator]="true"
 * [rows]="25"
 */
let TableViewComponent = class TableViewComponent {
    ampsService = inject(AmpsService);
    changeDetectorRef = inject(ChangeDetectorRef);
    columnNames;
    // data
    displayData = [];
    // filter: string = '/id < 1000';
    filter = '';
    getMessageId(index, message) {
        return message.ts;
    }
    ngOnInit() {
        this.columnNames = [
            { 'field': 'order_id', 'header': 'Order ID', 'style': { 'width': '75px' } },
            { 'field': 'name', 'header': 'Name', 'style': { 'width': '400px' } },
            { 'field': 'price_usd', 'header': 'Price' },
            { 'field': 'quantity', 'header': 'Quantity' },
            { 'field': 'total', 'header': 'Total Price' }
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
};
TableViewComponent = __decorate([
    Component({
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
], TableViewComponent);
export { TableViewComponent };
//# sourceMappingURL=app.table.component.js.map