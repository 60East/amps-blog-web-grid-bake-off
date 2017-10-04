import { Message } from 'amps';
import { AMPSQuery, QueryOptions } from './sql';
import { populateSOW, randomDataUpdates } from './populate_sow';

declare var $$: any;


/**
 * This class encapsulates the UI. And provides
 * two-way communication API
 */
export class AMPSQueryUi {
    // private fields
    private _query: AMPSQuery;
    private id: string;
    private type: string;
    private rows: any[];

    /**
     * This is the constructor that initializes the UI object.
     */
    constructor() {
        const populateSowButton = {
            view: 'button',
            id: 'populate_sow_button',
            value: 'Re-Populate SOW',
            width: 180,
            click: this.handlePopulateSOW
        };

        const randomizerCheckbox = {
            view: 'checkbox', 
            id: 'randomizer_checkbox', 
            labelRight: 'Send Random Updates', 
            labelWidth: 12,
            value: false,
            on: {onChange: this.handleRandomDataUpdates}
        };

        const typeOption = {
            view: 'richselect',
            id: 'sql_message_type',
            label: 'Topic',
            labelAlign: 'right',
            width: 280,
            value: 'json',
            options: ['json', 'fix', 'nvfix', 'xml']
        };
        const topicOption = {
            view: 'text',
            id: 'sql_topic',
            name: 'topic',
            labelWidth: 0,
            padding: 0,
            margin: 0,
            invalidMessage: 'Topic can not be empty.',
            validate: webix.rules.isNotEmpty,
            placeholder: 'Enter a topic value (can be a PCRE regex expression)',
            on: {
                onKeyPress: function(code: number, event: {key: string}) {
                    // if (event.key === 'Enter') { }
                }
            }
        };
        const filterOption = {
            view: 'text',
            id: 'sql_filter',
            label: 'Filter',
            name: 'filter',
            margin: 12,
            labelAlign: 'right',
            placeholder: 'Optional: Enter a Content Filter'
        };
        const orderByOption = {
            view: 'text',
            id: 'sql_orderby',
            label: 'Order By',
            labelAlign: 'right',
            width: 250,
            placeholder: 'Optional: Enter the ID'
        };
        const topNOption = {
            view: 'text',
            id: 'sql_topN',
            label: 'TopN',
            labelAlign: 'right',
            width: 350,
            placeholder: 'Optional: first N records'
        };
        const executeButton = {cols: [
            {view: 'spacer'},
            {
                view: 'button',
                id: 'execute_button',
                value: 'Execute',
                width: 100,
                hotkey: 'enter',
                click: () => {
                    const sqlTable = $$('sql_table');

                    // Stop button pressed
                    if ($$('execute_button').getValue() === 'Stop') {
                        // stop the AMPSQuery, if any
                        if (this._query) {
                            this._query.stop();
                        }

                        this.enableFormControls();

                        $$('table_header').setHTML('Results');
                        sqlTable.clearAll();
                        sqlTable.config.columns = [{id: '1', header: ''}];
                        sqlTable.refreshColumns();

                        return;
                    }

                    // Execute button pressed
                    this.enableFormControls(false);

                    this.queryData({
                        topic: (<string>$$('sql_topic').getValue()),
                        topN: (<string>$$('sql_topN').getValue()),
                        messageType: (<string>$$('sql_message_type').getValue()),
                        filter: (<string>$$('sql_filter').getValue()),
                        orderBy: (<string>$$('sql_orderby').getValue())
                    });
                }
            }
        ]};

        // Create the form itself
        const form = {
            view: 'form',
            id: 'sql_form',
            fillspace: true,
            margin: 5,
            elements: [
                {cols: [populateSowButton, randomizerCheckbox]},
                {cols: [typeOption, topicOption]},
                {cols: [filterOption, {width: 12}]},
                {cols: [
                    topNOption,
                    orderByOption,
                    {view: 'spacer'},
                    executeButton,
                    {width: 12}
                ]}
            ]
        };

        // Create the results table
        const table = {
            id: 'sql_table',
            view: 'datatable',
            resizeColumn: true,
            autoConfig: true
        };

        // Build the UI together
        this.id = 'sql_widget';
        this.type = 'clean';
        this.rows = [
            {
                view: 'template',
                template: '<img src="img/logo.png" id="logo" /> AMPS Webix Datatable Demo',
                // height: ,
                type: 'header',
                css: 'component-header'
            },
            form,
            {
                id: 'table_header',
                view: 'template',
                template: 'Results',
                height: 28,
                type: 'header',
                css: 'results-header'
            },
            table
        ];
    }

    /**
     * This is a helper private method that switches the query form state.
     * @param enable The form is enabled if true, disabled otherwise.
     */
    private enableFormControls(enable: boolean = true): void {
        const button = $$('execute_button');
        const sqlTable = $$('sql_table');
        const method = enable ? 'enable' : 'disable';

        $$('sql_topN')[method]();
        $$('sql_filter')[method]();
        $$('sql_orderby')[method]();
        $$('sql_topic')[method]();
        $$('sql_message_type')[method]();
        button.setValue(enable ? 'Execute' : 'Stop');
        button.refresh();
    }

    queryData(queryParams: QueryOptions): void  {
        const sqlTable = $$('sql_table');

        // get data from AMPS and display it
        this._query = new AMPSQuery(); 
        this._query.getData(
            queryParams,

            // SOW loaded
            messages => {
                // detect new column names
                const newColumns: any[] = [];
                for (const columnName in messages[0]) {
                    if (columnName === 'id' || columnName === 'rowId') { continue; }
                    
                    newColumns.push({id: columnName, header: columnName, fillspace: true });
                }
                sqlTable.config.columns = JSON.parse(JSON.stringify(newColumns));
                sqlTable.refreshColumns();

                // set the grid data
                sqlTable.parse(messages);
            },

            // New message received
            message => {
                sqlTable.add(message);
                sqlTable.showItem(message.id);
                sqlTable.addRowCss(message.id, 'new-sql-row');
                setTimeout(() => { sqlTable.removeRowCss(message.id, 'new-sql-row'); }, 800);
            },

            // Update message received
            message => {
                sqlTable.showItem(message.id);

                // set 'updated' animation
                sqlTable.addRowCss(message.id, 'updated-sql-row');

                // update the cell data
                sqlTable.updateItem(message.id, message);
                setTimeout(() => { sqlTable.removeRowCss(message.id, 'updated-sql-row'); }, 800);
            },

            // OOF (delete) message received
            message => {
                // set removal animation
                sqlTable.showItem(message.id);
                sqlTable.addRowCss(message.id, 'removed-sql-row');
                sqlTable.updateItem(message.id, message);

                // remove it from the table
                setTimeout(() => {
                    try {
                        if (sqlTable.getItem(message.id) && sqlTable.hasCss(message.id, 'removed-sql-row')) {
                            sqlTable.remove(message.id);
                        }
                    }
                    catch (err) {
                        console.error('err: ', err);
                    }
                }, 800);
            },

            // Error occurred
            err => this.reportError
        );
    }

    /**
     * This method wipes the existing SOW contents and re-populates the AMPS topic `orders` 
     * with the fresh random data. Modify the `populate_sow.js` file in order to change parameters.
     */
    handlePopulateSOW(): void {
        populateSOW(20000);
    }

    /**
     * This method publishes random updates to the `orders` topic with the fresh data. 
     * Modify the `populate_sow.js` file in order to change parameters.
     */
    handleRandomDataUpdates(enabled: boolean): void {
        randomDataUpdates(enabled);
    }

    /**
     * This method allows to report an error using GUI alert form.
     */
    reportError(error: Error, resetUi: boolean = true): void {
        webix.message({
            text: error.message ? error.message : 'Connection Error',
            type: 'error',
            expire: 5000
        });

        if (resetUi) {
            this.enableFormControls(true);
        }
    }
}
