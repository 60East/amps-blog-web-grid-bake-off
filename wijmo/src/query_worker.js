/* global amps */
importScripts('amps.min.js');  // eslint-disable-line

var data;

// Listening for a message from UI process to start
self.addEventListener('message', function(event) {
    // extract data
    var params = event.data;

    // Create the client object
    var client = new amps.Client('sow-loader-' + new Date() + '-' + Math.random() * 100000000);
    client.errorHandler(function(err) { self.postMessage({error: err}); });

    // let's go!
    client.connect('ws://localhost:9000/amps/json')
        .then(function() {
            var nextId = 0;
            var sowKeyMap;
            var header;
            var rowId;

            // query data now
            // return client.subscribe(function(message) {
            return client.sowAndSubscribe(function(message) {
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
                    self.postMessage({sow: data});
                }
                else if (header === 'p') {
                    // either a new message or an update to an existing one

                    // Update case
                    rowId = sowKeyMap[message.header.sowKey()];
                    if (rowId !== undefined) {
                        var index = indexByRowId(rowId);
                        message.data.rowId = rowId;
                        data[index] = message.data;
                        self.postMessage({u: message.data, rowIndex: index});
                    }
                    // new one
                    else {
                        sowKeyMap[message.header.sowKey()] = nextId;
                        message.data.rowId = nextId++;
                        data.push(message.data);
                        self.postMessage({p: message.data, rowIndex: data.length});
                    }
                }
                else if (header === 'oof') {
                    // deleting the message
                    rowId = sowKeyMap[message.header.sowKey()];

                    if (rowId) {
                        var index = indexByRowId(rowId);
                        delete sowKeyMap[message.header.sowKey()];
                        data.splice(index, 1);
                        self.postMessage({oof: message.data, rowIndex: index});
                    }
                }
            }, params.topic, params.filter || null, {
                options: 'oof',
                topN: params.topN || '',
                orderBy: params.orderBy || ''
            });
        })
        .catch(function(err) {
            self.postMessage({error: {message: err.message}});
        });
}, false);


function indexByRowId(rowId) {
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
