import { Component, Input } from '@angular/core';


@Component({
    selector: 'query-controls',
    template: `
        <div class="frame">
            <table>
                <tbody>
                    <tr>
                        <td class="right"><label>Topic *: </label></td>
                        <td>
                            <select name="messageType" [(ngModel)]="messageType">
                                <option *ngFor="let mt of messageTypes" [ngValue]="mt.value">{{ mt.name }}</option>
                            </select>

                            <input type="text" name="topic"
                                [value]="topic"
                                (input)="topic = $event.target.value" />
                        </td>

                        <td class="right"><label>Filter: </label></td>
                        <td>
                            <input type="text" name="filter"
                                [value]="filter"
                                (input)="filter = $event.target.value" />
                        </td>
                    </tr>

                    <tr>
                        <td class="right"><label>TopN: </label></td>
                        <td>
                            <input type="text" name="topN"
                                [value]="topN"
                                (input)="topN = $event.target.value" />
                        </td>

                        <td class="right"><label>Order By: </label></td>
                        <td>
                            <input type="text" name="orderBy"
                                [value]="orderBy"
                                (input)="orderBy = $event.target.value" />
                        </td>
                    </tr>
                </tbody>
            </table>

            <br />

            <button (click)="onQueryRequest()">Query and Subscribe</button>
            <img id="loading-image" src="/assets/img/loading.gif" width="20" height="20" [hidden]="!loading" />
        </div>

        <div id="error-label">{{ errorLabel }}</div> 
    `
})
export class QueryControls {
    private messageTypes: any[] = [
        {value: 'json', name: 'JSON'},
        {value: 'nvfix', name: 'NVFIX'}
    ];

    private topic: string = '';
    private messageType: string = 'json';
    private filter: string = '';
    private topN: string = '';
    private orderBy: string = '';

    @Input() onQuery: (queryParams: any) => void;
    @Input() onControlsInit: (form: QueryControls) => void;
    private errorLabel: string;
    private loading: boolean = false;

    ngOnInit() {
        this.onControlsInit(this);
    }

    onQueryRequest() {
        this.errorLabel = '';
        this.loading = true;

        this.onQuery({
            topic: this.topic,
            messageType: this.messageType,
            filter: this.filter,
            topN: this.topN,
            orderBy: this.orderBy
        });
    }

    onLoadFinish(err?: Error) {
        this.loading = false;

        if (err) {
            this.errorLabel = err.message;
            return;
        }
    }
}

