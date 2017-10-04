import { AMPSMessage } from './amps-message';


// This the way to import a non-TS script.
declare function importScripts(...urls: string[]): void;
importScripts('amps.js');


// the way to include AMPS here
declare const amps: any;


/**
 * This function sows all the messages from AMPS, then resolves.
 *
 * @param [filter] Optional filter value.
 * @returns {Promise<any[]>} The Promise object that resolves when all messages
 * have been received. Rejects in case of an error.
 */
function getTableData(filter?: string): Promise<any[]> {
    let data: any[] = [];
    let client = new amps.Client('my-application');

    return new Promise((resolve, reject) => {
        client
            .connect('ws://localhost:9000/amps/json')
            .then(() => client.sow(
                (message: AMPSMessage) => {
                    if (message.c === 'sow') {
                        data.push(message.data);
                    }

                    if (message.c === 'group_end') {
                        client.disconnect();

                        // return data provided
                        resolve(data);
                    }
                },
                'orders',
                filter,
                {topN: 19700}
            )).catch(reject);
    });
}


// This function will be called from the UI thread. Once it's called,
// the workers loads data from AMPS.
onmessage = (event: MessageEvent) => {
    getTableData(event.data.filter)
        .then(function(data) {
            (<any>postMessage)({success: true, data: data});
        })
        .catch(function(err) {
            (<any>postMessage)({success: false, error: err});
        });
};

