
// This the way to import a non-TS script.
declare function importScripts(...urls: string[]): void;
importScripts('app/amps.js');


export declare var amps: any;
let data: any[];


// This function will be called from the UI thread. Once it's called,
// the workers loads data from AMPS.
onmessage = (event: MessageEvent) => {
    // extract data
    const params = event.data;

    // Create the client object
    const client = new amps.Client('sow-loader-' + new Date() + '-' + Math.random() * 99999999);
    client.errorHandler((err: Error) => (<any>postMessage)({error: err}));

    // let's go!
    client.connect('ws://localhost:9000/amps/json')
        .then(function() {
            var nextId = 1;
            var sowKeyMap;
            var header;
            var rowId;

            // query data now
            return client.sowAndSubscribe(function(message: any) {
                header = message.header.command();
                // new query
                if (header === 'group_begin') {
                    data = [];
                    sowKeyMap = {};
                }
                // loading messages
                else if (header === 'sow') {
                    sowKeyMap[message.header.sowKey()] = nextId;
                    message.data.rowId = nextId++;
                    data.push(message.data);
                }
                // done loading, return data back to the UI process
                else if (header === 'group_end') {
                    (<any>postMessage)({sow: data});
                }
                else if (header === 'p') {
                    // either a new message or an update to an existing one

                    // Update case
                    rowId = sowKeyMap[message.header.sowKey()];
                    if (rowId !== undefined) {
                        const index = indexByRowId(rowId);
                        message.data.rowId = rowId;
                        data[index] = message.data;
                        (<any>postMessage)({u: message.data, rowIndex: index});
                    }
                    // new one
                    else {
                        sowKeyMap[message.header.sowKey()] = nextId;
                        message.data.rowId = nextId++;
                        data.push(message.data);
                        (<any>postMessage)({p: message.data, rowIndex: data.length});
                    }
                }
                else if (header === 'oof') {
                    // deleting the message
                    rowId = sowKeyMap[message.header.sowKey()];

                    if (rowId) {
                        const index = indexByRowId(rowId);
                        delete sowKeyMap[message.header.sowKey()];
                        data.splice(index, 1);
                        (<any>postMessage)({oof: message.data, rowIndex: index});
                    }
                }
            }, params.topic, params.filter ? params.filter : null, {
                options: 'oof',
                topN: params.topN || '',
                orderBy: params.orderBy || '',
                batchSize: 20000
            });
        })
        .catch(function(err: Error) {
            (<any>postMessage)({error: {message: err.message}});
        });
};


function indexByRowId(rowId: string | number): number {
    // Simple binary search for row index
    if (!data) { return -1; }
    
    var start = 0;
    var end = data.length;
    var mid;

    while (start < end) {
        mid = Math.floor((start + end) / 2);

        if (data[mid].rowId < rowId) {
            start = mid + 1;
        }
        else if (data[mid].rowId > rowId) {
            end = mid;
        }
        else {
            return mid;
        }
    }

    return -1;
}
