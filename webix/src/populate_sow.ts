import { Client } from 'amps';

let randomizerTimerId: any;
let randomizerClient: Client;

export function populateSOW(count: number) {
    const client = new Client('populate-sow');
    const teslas = ['S', '2', 'X', 'Roadster'];

    client.connect('ws://localhost:9000/amps/json')
        .then(function() {
            console.log('Wiping the `orders` topic...');
            return client.sowDelete('orders', '1 = 1');
        })
        .then(function(/*stats*/) {
            console.log('Populating the SOW...');
            for (let i = 0; i < count; i++) {
                const currentRow: any = {
                    order_id: i + 1,
                    name: 'Tesla Model ' + teslas[Math.floor(Math.random() * 3)],
                    price_usd: Math.floor(Math.random() * 10000 + 20000),
                    quantity: Math.floor(Math.random() * 100 + 1)
                };
                currentRow.total = currentRow.quantity * currentRow.price_usd;

                client.publish('orders', currentRow);
            }

            return client.flush();
        })
        .then(function() { return new Promise(function(resolve: () => void) { setTimeout(resolve, 4000); }); })
        .then(function() {
            client.deltaPublish('orders', {order_id: 1, name: 'TEST', price_usd: 1000, quantity: 100});
            return client.flush();
        })
        .then(function() {
            console.log(count, 'records have been added to the topic `orders`!');
            return client.disconnect();
        })
        .catch(function(err: Error) {
            console.log('err: ', err);
            console.error('Connection Error: AMPS Server is not available');
        });
}


export function randomDataUpdates(checked: boolean) {
    clearInterval(randomizerTimerId);

    if (!checked) {
        if (randomizerClient) {
            randomizerClient.disconnect();
        }

        return;
    }

    randomizerClient = new Client('random-publisher' + new Date().getTime());
    randomizerClient
        .connect('ws://localhost:9000/amps/json')
        .then(function() {
            randomizerTimerId = setInterval(function() {
                if (randomizerClient.isConnected()) {
                    const orderId = Math.round(Math.random() * 20000);
                    randomizerClient.publish('orders', {
                        order_id: orderId,
                        name: '>>> TESLA UPDATE <<<',
                        price_usd: Math.floor(Math.random() * 10000 + 20000),
                        quantity: Math.floor(Math.random() * 100 + 1),
                        total: 10000
                    });
                }
            }, 3000);
        })
        .catch(function(err: Error) {
            console.log('Random publisher -- err: ', err);
            console.error('Random publisher -- Connection Error: AMPS Server is not available');
        });
}
