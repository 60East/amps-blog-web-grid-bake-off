/**
 * This is a file that populates SOW on the server.
 * Usage: node uploader.js
 *
 * Optional environment variables:
 *   AMPS_URL=ws://localhost:9000/amps/json
 *   AMPS_TOPIC=orders
 *   AMPS_RECORDS=5000
*/
var amps = require('./src/app/amps.js');

var endpoint = process.env.AMPS_URL || 'ws://localhost:9000/amps/json';
var topic = process.env.AMPS_TOPIC || 'orders';
var recordCount = Number(process.env.AMPS_RECORDS || 5000);

if (!Number.isSafeInteger(recordCount) || recordCount < 1) {
    throw new Error('AMPS_RECORDS must be a positive integer.');
}

var client = new amps.Client('orders-sow-publisher');

client
    .connect(endpoint)
    .then(function() {
        console.log('Connected to ' + endpoint + ', publishing to ' + topic + '...');
        return new Promise(function(resolve, reject) {
            for (var i = 0; i < recordCount; i++) {
                if ((i % 1000) === 0) {
                    console.log(i + '/' + recordCount + ' sent');
                }
                
                var quantity = (i % 100) + 1;
                var price = Number((25 + (i % 500) * 0.25).toFixed(2));

                client.publish(topic, {
                    order_id: i,
                    name: 'Order ' + i,
                    price_usd: price,
                    quantity: quantity,
                    total: Number((price * quantity).toFixed(2))
                });
            }

            client.execute(
                new amps.Command('flush').ackType('completed'),
                function(message) {
                    if (message.c === 'ack' && message.a === 'completed') {
                        client.disconnect();
                        resolve();
                    }
                }
            ).catch(reject);
        });
    })
    .then(function() {
        console.log(recordCount + ' records published to ' + topic);
    })
    .catch(function(err) {
        console.error('err: ', err);
    });
