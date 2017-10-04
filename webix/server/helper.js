var amps = require('amps');
var constants = require('./../src/constants');


var client = new amps.Client('populate-sow');
var teslas = ['S', '3', 'X', 'Roadster'];


client.connect(constants.URI + 'json')
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
    .then(function() {
        console.log('20,000 records have been added to the topic `orders`!');
        return client.disconnect();
    })
    .catch(function(err) {
        console.log('err: ', err);
        console.error('Connection Error: AMPS Server is not available')
    });

