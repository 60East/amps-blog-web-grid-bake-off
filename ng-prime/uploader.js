/**
 * This is a file that populates SOW on the server.
 * The server should have a 'pimco-sow' topic, otherwise
 * please change the topic value on line 21
 * Usage: node uploader.js
*/
var amps = require('./src/app/amps.js');

var client = new amps.Client('pimco-sow-publisher');

client
    .connect('ws://localhost:9000/amps/json')
    .then(function() {
        console.log('Connected, sending messages...');
        return new Promise(function(resolve, reject) {
            for (var i = 0, len = 5000; i < len; i++) {
                if ((i % 1000) === 0) {
                    console.log('1/4 sent');
                }
                
                client.publish('pimco-sow', {
                    id: i,                                                                                           
                    acctName: 'Account ' + i,                                                                        
                    acctStrategy: 'Strategy ' + i,                                                                   
                    acctManager: 'Manager ' + i,                                                                    
                    specialAccountCode: '123',                                                                       
                    inceptionDate: 'June 1 1970'
                });
            }

            client.execute(new amps.Command('flush').ackType('completed'), function(message) {
                client.disconnect();
                resolve();
            }).catch(reject);
        });
    })
    .then(function() {
        console.log('All message have been sent');
    })
    .catch(function(err) {
        console.error('err: ', err);
    });

