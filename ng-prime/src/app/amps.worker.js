"use strict";
importScripts('amps.js');
/**
 * This function sows all the messages from AMPS, then resolves.
 *
 * @param [filter] Optional filter value.
 * @returns {Promise<any[]>} The Promise object that resolves when all messages
 * have been received. Rejects in case of an error.
 */
function getTableData(filter) {
    var data = [];
    var client = new amps.Client('my-application');
    return new Promise(function (resolve, reject) {
        client
            .connect('ws://localhost:9000/amps/json')
            .then(function () { return client.sow(function (message) {
            if (message.c === 'sow') {
                data.push(message.data);
            }
            if (message.c === 'group_end') {
                client.disconnect();
                // return data provided
                resolve(data);
            }
        }, 'orders', filter, { topN: 19700 }); }).catch(reject);
    });
}
// This function will be called from the UI thread. Once it's called,
// the workers loads data from AMPS.
onmessage = function (event) {
    getTableData(event.data.filter)
        .then(function (data) {
        postMessage({ success: true, data: data });
    })
        .catch(function (err) {
        postMessage({ success: false, error: err });
    });
};
//# sourceMappingURL=amps.worker.js.map