"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var app_amps_service_1 = require("./app.amps.service");
/*
 * [paginator]="true"
 * [rows]="25"
 */
var TableViewComponent = (function () {
    function TableViewComponent(ampsService) {
        this.ampsService = ampsService;
        // filter: string = '/id < 1000';
        this.filter = '';
    }
    TableViewComponent.prototype.getMessageId = function (index, message) {
        return message.ts;
    };
    TableViewComponent.prototype.ngOnInit = function () {
        var _this = this;
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
            .then(function (messageData) { return _this.displayData = messageData; })
            .catch(function (err) { alert('Error occurred'); });
    };
    return TableViewComponent;
}());
TableViewComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'amps-table',
        template: "\n    <p-dataTable \n        [value]=\"displayData\" \n        selectionMode=\"single\" \n        groupField=\"order_id\" \n        resizableColumns=\"true\" \n        [sortableRowGroup]=\"false\" \n        sortField=\"order_id\"\n        [responsive]=\"true\">\n\n        <p-column \n            *ngFor=\"let col of columnNames\"  \n            [field]=\"col.field\" \n            [header]=\"col.header\" \n            [style]=\"col.style\"\n            [sortable]=\"true\">\n        </p-column>\n\n    </p-dataTable>\n    "
    }),
    __metadata("design:paramtypes", [app_amps_service_1.AmpsService])
], TableViewComponent);
exports.TableViewComponent = TableViewComponent;
//# sourceMappingURL=app.table.component.js.map