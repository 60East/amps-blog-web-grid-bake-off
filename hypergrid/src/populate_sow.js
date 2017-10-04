/* global amps */

var randomizerTimerId;
var randomizerClient;

function populateSOW() {
    var client = new amps.Client('populate-sow');
    var teslas = ['S', '3', 'X', 'Roadster'];

    client.connect('ws://localhost:9000/amps/json')
        .then(function() {
            console.log('Wiping the `orders` topic...');
            return client.sowDelete('orders', '1 = 1');
        })
        .then(function(/*stats*/) {
            console.log('Populating the SOW...');
            for (var i = 0, len = 20000; i < len; i++) {
                var currentRow = {
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
        .then(function() { return new Promise(function(resolve) { setTimeout(resolve, 4000); }); })
        .then(function() {
            client.deltaPublish('orders', {order_id: 1, name: 'TEST', price_usd: 1000, quantity: 100})
            return client.flush();
        })
        .then(function() {
            console.log('20,000 records have been added to the topic `orders`!');
            return client.disconnect();
        })
        .catch(function(err) {
            console.log('err: ', err);
            console.error('Connection Error: AMPS Server is not available')
        });
}


function randomDataUpdates() {
    clearInterval(randomizerTimerId);

    if (!document.getElementById('randomizer').checked) {
        if (randomizerClient) {
            randomizerClient.disconnect();
        }

        return;
    }

    randomizerClient = new amps.Client('random-publisher' + new Date().getTime());
    randomizerClient
        .connect('ws://localhost:9000/amps/json')
        .then(function() {
            randomizerTimerId = setInterval(function() {
                var orderId = Math.round(Math.random() * 20000);
                randomizerClient.publish('orders', {
                    order_id: orderId,
                    name: '>>> TESLA UPDATE <<<',
                    price_usd: Math.floor(Math.random() * 10000 + 20000),
                    quantity: Math.floor(Math.random() * 100 + 1),
                    total: 10000
                });
            }, 3000);
        })
        .catch(function(err) {
            console.log('Random publisher -- err: ', err);
            console.error('Random publisher -- Connection Error: AMPS Server is not available')
        });
}
