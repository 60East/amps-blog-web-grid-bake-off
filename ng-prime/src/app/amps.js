'use strict';

// Node environment module
if (typeof window === 'undefined' && typeof module !== 'undefined' && module.exports) {
    var WebSocket = require('websocket').w3cwebsocket; // jshint ignore:line
    if (typeof Promise !== 'function') {
        var Promise = require('es6-promise').Promise; // jshint ignore:line
    }
}
else {
    if (typeof Promise !== 'function') {
        throw new Error('Promise support is required. Please include es6-promise library');
    }
}


var amps = amps || {};


/**
 * This is the constructor for the DefaultAuthenticator class. 
 * Provides the default authentication for simple scenarios when no external actions are required.
 * @example
 * var myAuthenticator = {
 *     authenticate: function(username, password) {
 *         return new Promise(function(resolve, reject) {
 *             // invoke your authentication mechanism here
 *             verySecureAuthentication(function(err, token) {
 *                 if (err) { return reject(err); }
 *                 resolve(token);
 *             });
 *         });
 *     },
 *     retry: function(username, password) {
 *         return new Promise(function(resolve, reject) {
 *             // invoke your authentication mechanism here - retry the authentication
 *             retryVerySecureAuthentication(function(err, token) {
 *                 if (err) { return reject(err); }
 *                 
 *                 resolve(token);
 *             });
 *         });
 *     },
 *     completed: function(username, password, reason) {
 *         // This method will be invoked upon successful authorization with AMPS
 *         console.log('completed method called: ', reason);
 *     }
 * };
 * 
 * var client = new amps.Client()
 * client.connect('ws://localhost:9100/amps/json', myAuthenticator)
 *     .then(function() {
 *         console.log('Connected!');
 *     })
 *     .catch(function(err) {
 *         console.error('connection err: ', err);
 *     });
 * @returns {amps.DefaultAuthenticator} The created authenticator object.
 * @constructor
 */
amps.DefaultAuthenticator = function() {
    /**
     * Called by {@link amps.Client}, just before the logon command is sent.
     *
     * @param {String} login The current value of the username as specified in the URI.
     * @param {String} password The current value of the password, as specified in the URI.
     * @returns {Promise} The Promise object which once fullfilled will contain the value that should be placed 
     * into the Password header for the logon attempt will be passed.
     */
    this.authenticate = function(login, password) {
        return new Promise(function(resolve) {
            resolve(password);
        });
    };

    /**
     * Called when a logon "ack" is received with a status of "retry". AMPS will continue trying to logon as long as 
     * the server returns "retry", and this method continues to succeed.
     *
     * @param {String} login The username returned by the server's ACK message.
     * @param {String} password The password or token returned in the server's ACK message.
     * @returns {Promise} The Promise object which once fullfilled will contain the value that should be placed 
     * into the Password header for the next logon attempt will be passed.
     */
    this.retry = function(login, password) {
        return new Promise(function(resolve) {
            resolve(password);
        });
    };

    /**
     * Called when a logon completes successfully. Once a logon has completed, this method is called with the username 
     * and password that caused a successful logon.
     *
     * @param {String} login The username that successfully logged on to the server.
     * @param {String} password The password that successfully logged on to the server.
     * @param {String} reason The reason for this successful completion.
     */
    this.completed = function(login, password, reason) {};
};


/**
 * This is a helper class that is used to register custom message types.
 * @name amps.TypeHelper
 * @static
 * @class
 */
amps.TypeHelper = (function() {
    var instance;

    function createInstance() {
        var Uint8ToString = function Uint8ToString(u8a) {
          var CHUNK_SZ = 0x8000;
          var c = [];
          for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
            c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
          }
          return c.join('');
        };

        var jsonTypeHelper = {
            serialize: function(data) {
                return [JSON.stringify(data)];
            },
            deserialize: function(data) {
                if (data.constructor === String) {
                    return JSON.parse(data);
                } else {
                    // Binary buffer, need to decode utf8
                    return JSON.parse(decodeURIComponent(escape(Uint8ToString(data))));
                }
            }
        };

        var binaryTypeHelper = {
            serialize: function(data) {
                return [data];
            },
            deserialize: function(data) {
                return data;
            }
        };

        var nvfixTypeHelper = {
            serialize: function(data) {
                // already formatted fix/nvfix string
                if (typeof data === 'string') { return [data]; }

                // otherwise, we assume it's an object with keys and values
                return [Object.keys(data).map(function(key) { return key + '=' + data[key]; }).join('\\x01') + '\\x01'];
            },
            deserialize: function(data) {

                var parsedData = {};

                decodeURIComponent(escape(Uint8ToString(new Uint8Array(data))))
                    .split('\\x01')
                    .slice(0, -1)
                    .map(function(keyValue) {
                        var keyValueTuple = keyValue.split('=');
                        var key = keyValueTuple[0];

                        // no '=' inside of the value
                        if (keyValueTuple.length === 2) {
                            parsedData[key] = keyValueTuple[1];
                        }
                        else {
                            parsedData[key] = keyValue.slice(key.length + 1);
                        }
                    });

                return parsedData;
            }
        };

        return {
            'json': jsonTypeHelper,
            'binary': binaryTypeHelper,
            'fix': nvfixTypeHelper,
            'nvfix': nvfixTypeHelper
        };
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        },
        /**
         * This method provides a helper for parsing messages of different types. If a helper was provided by a user,
         * registers it for future use.
         * @memberof amps.TypeHelper
         * @example <caption>Create a custom helper for XML messages:</caption>
         * var xmlTypeHelper = {
         *     serialize: function(data) {
         *         return [new XMLSerializer().serializeToString(data)];
         *     },
         *     deserialize: function(data) {
         *         if (data.constructor === String) {
         *             return new DOMParser().parseFromString(data);
         *         } else {
         *             // Binary buffer, need to decode utf8
         *             return new DOMParser().parseFromString(decodeURIComponent(escape(Uint8ToString(data))));
         *         }
         *     }
         * };
         *
         * // Register the above XML custom helper for parsing all XML messages automatically
         * amps.TypeHelper.helper('xml', xmlTypeHelper);
         *
         * @example <caption>In case the custom parsing behavior is expected, it is possible to override the default
         * type helper:</caption>
         * // create a JSON type helper that does not parse JSON data into native JS objects keeping it as a string
         * var jsonHelper = {
         *     serialize: function(data) {
         *         return [data];
         *     },
         *     deserialize: function(data) {
         *         return JSON.stringify(data);
         *     }
         * };
         *
         * // override the default type helper
		 * amps.TypeHelper.helper('json', jsonHelper);
         * @example <caption>Register the json-json-json-binary composite message type with the type helper:</caption>
         * amps.TypeHelper.helper('compositejjjbl', amps.TypeHelper.compositeHelper('json', 'json', 'json', 'binary'));
         * @example <caption>Register the custom helper for NVFIX format:</caption>
         * var nvfixTypeHelper = {
         *     serialize: function(data) {
         *         // already formatted fix/nvfix string
         *         if (typeof data === 'string') {
         *             return [data];
         *         }
         *
         *         // otherwise, we assume it's an object with keys and values
         *         return [
         *             Object.keys(data).map(function(key) { return key + '=' + data[key]; }).join('\\x01') + '\\x01'
         *         ];
         *     },
         *     deserialize: function(data) {
         *         var parsedData = {};
         *         String.fromCharCode.apply(null, new Int8Array(data))
         *             .split('\\x01')
         *             .slice(0, -1)
         *             .map(function(keyValue) {
                            var keyValueTuple = keyValue.split('=');
                            var key = keyValueTuple[0];

                            // no '=' inside of the value
                            if (keyValueTuple.length === 2) {
                                parsedData[key] = keyValueTuple[1];
                            }
                            else {
                                parsedData[key] = keyValue.slice(key.length + 1);
                            }
         *             });
         *
         *         return parsedData;
         *     }
    	 * };
         *
		 * // Register the above NVFIX custom helper for parsing all NVFIX messages automatically
		 * amps.TypeHelper.helper('nvfix', nvfixTypeHelper);
         * @param {String} messageType The type of message to handle.
         * @param {object} [newHelper] a helper object with predefined functions that can be provided for custom
         * parsing/handling of a message type.
         * @static
         * @returns {object} The helper object assigned/registered.
         */
        helper: function(messageType, newHelper) {
            var typeHelper = amps.TypeHelper.getInstance();
            if (newHelper !== undefined) {
                typeHelper[messageType] = newHelper;
                return typeHelper;
            }
            else {
                // Just fetching the value, when it exists
                if (typeHelper[messageType] !== undefined) {
                    return typeHelper[messageType];
                }
                else {
                    return typeHelper.binary;
                }
            }
        },
        littleEndianSizeBuffer: function(size) {
            var result = new Uint32Array(1);
            result[0] = size;
            return result;
        },
        bigEndianSizeBuffer: function(size) {
            var result = new Uint32Array(1);
            result[0] = ((size & 0x000000FF) << 24)
                | ((size & 0x0000FF00) << 8)
                | ((size & 0x00FF0000) >>> 8)
                | ((size & 0xFF000000) >>> 24);
            return result;
        },
        /**
         * This method is used to create composite message types from other types, such as JSON, XML, etc.
         * @memberof amps.TypeHelper
         * @example
         * // Register the json-xml-json-binary composite message type with the type helper
         * amps.TypeHelper.helper('compositejxjb', amps.TypeHelper.compositeHelper('json', 'xml', 'json', 'binary'));
         * @param {...string} messageType previously registered types of messages.
         * @returns {amps.TypeHelper} a TypeHelper object.
         */
        compositeHelper: function() {
            var lookupHelpers = function(l) {
                var result = [];
                for (var i = 0; i < l.length; ++i) {
                    result.push(amps.TypeHelper.helper(l[i]));
                }
                return result;
            };
            var convertToArrayBuffers = function(data) {
                var result = [];
                for (var k = 0; k < data.length; ++k) {
                    if (data[k].constructor === String) {
                        // Need to convert to an ArrayBuffer
                        var encoded = unescape(encodeURIComponent(data[k]));
                        var arrayified = new Uint8Array(encoded.length);
                        for (var i = 0; i < encoded.length; ++i) {
                            arrayified[i] = encoded.charCodeAt(i);
                        }
                        result.push(arrayified);
                    } else {
                        result.push(data[k]);
                    }
                }
                return result;
            };

            return {
                // The list of types this composite helps with
                helpers: lookupHelpers(arguments),
                serialize: function(data) {
                    if (data.length > this.helpers.length) {
                        throw 'too many elements to serialize';
                    }
                    var result = [];
                    for (var i = 0; i < data.length; ++i) {
                        var part = convertToArrayBuffers(this.helpers[i].serialize(data[i]));
                        result = result.concat(amps.TypeHelper.bigEndianSizeBuffer(part[0].length), part);
                    }
                    return result;
                },
                deserialize: function(data) {
                    var result = [];
                    var position = 0;
                    var index = 0;
                    while (data.byteLength - position > 0) {
                        var sizeBuffer = new Uint8Array(data, position, 4);
                        position += 4;
                        var bytes = (sizeBuffer[0] << 24)
                            | (sizeBuffer[1] << 16)
                            | (sizeBuffer[2] << 8)
                            | (sizeBuffer[3]);
                        result.push(this.helpers[index].deserialize(new Uint8Array(data, position, bytes)));
                        position += bytes;
                        ++index;
                    }
                    return result;
                }
            };
        }
    };
})();


/**
 * This is the constructor for the Command class. Below are indentical setter/getter methods for different fields.
 * @param {String} command The name of the command.
 * @returns {amps.Command} The created command object.
 * @constructor
 */
amps.Command = function(command) {
    this.members = {
        command: command
    };

    /**
     * This method parses an object with options into a set of command options. For example,
     * an object &#123; expiration: 30, filter: '/age > 20' &#125; will be equivalent to make a command using
     * new amps.Command().expiration(30).filter('/age > 20');
     * @param {object} options an object with options
     * @returns {amps.Command} the updated command object.
     * @ignore
     */
    this.addOptions = function(options) {
        // Set options, if any
        if (options) {
            var optionsKeys = Object.keys(options);
            for (var i = 0; i < optionsKeys.length; ++i) {
                var option = optionsKeys[i];

                // if we have such option
                if (COMMAND_OPTIONS[option] !== undefined) {
                    this[option](options[option]);
                }
            }
        }

        return this;
    };

    /**
     * Adds/Returns a subscription id value. Works as a getter if no parameter set.
     * @name amps.Command#subId
     * @param {String} value subscription id value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns an acknowledgement type value(s). Works as a getter if no parameter set.
     * @name amps.Command#ackType
     * @param {String} value acknowledgement type value (comma delimited)
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a message data value. Works as a getter if no parameter set.
     * @name amps.Command#topic
     * @param {String} value message data value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a topic value. Works as a getter if no parameter set.
     * @name amps.Command#topic
     * @param {String} value topic value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a filter value. Works as a getter if no parameter set.
     * @name amps.Command#filter
     * @param {String} value filter value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a bookmark value. Works as a getter if no parameter set.
     * @name amps.Command#bookmark
     * @param {String} value bookmark value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns an options value. Works as a getter if no parameter set.
     * @name amps.Command#options
     * @param {String} value options value (a String with options delimited by comma)
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a correlation id value. Works as a getter if no parameter set.
     * @name amps.Command#correlationId
     * @param {String} value correlation id value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns an 'order by' value. Works as a getter if no parameter set.
     * @name amps.Command#orderBy
     * @param {String} value 'order by' value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a sow key value. Works as a getter if no parameter set.
     * @name amps.Command#sowKey
     * @param {String} value sow key value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns the sow keys values. Works as a getter if no parameter set.
     * @name amps.Command#sowKeys
     * @param {String} value sowKeys value (a String with sow keys delimited by comma)
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a expiration value. Works as a getter if no parameter set.
     * @name amps.Command#expiration
     * @param {String} value expiration value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a client name value. Works as a getter if no parameter set.
     * @name amps.Command#clientName
     * @param {String} value the client's name value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a sequence id value. Works as a getter if no parameter set.
     * @name amps.Command#sequenceId
     * @param {String} value sequence id value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a transmission time value. Works as a getter if no parameter set.
     * @name amps.Command#transmissionTime
     * @param {String} value transmission time value in seconds
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a 'send empty' value. Works as a getter if no parameter set.
     * @name amps.Command#sendEmpty
     * @param {String} value the 'send empty' value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a 'data only' value. Works as a getter if no parameter set.
     * @name amps.Command#dataOnly
     * @param {String} value the 'data only' value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a 'send subscription ids' value. Works as a getter if no parameter set.
     * @name amps.Command#sendSubscriptionIds
     * @param {String} value the 'send subscription ids' value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns the subscription ids value. Works as a getter if no parameter set.
     * @name amps.Command#subscriptionIds
     * @param {String} value the subscription ids value (a String with sow keys delimited by comma)
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a 'send OOF' (Out-Of-Focus) value. Works as a getter if no parameter set.
     * @name amps.Command#sendOOF
     * @param {String} value the 'send OOF' (Out-Of-Focus) value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    /**
     * Adds/Returns a 'send keys' value. Works as a getter if no parameter set.
     * @name amps.Command#sendKeys
     * @param {String} value the 'send keys' value
     * @returns {amps.Command|String} the updated command object / the command value (in case of a getter).
     * @function
     */

    return this;
};

// Assign properties (special properties have null - that means they are being handled in a special way in the execute()
var COMMAND_OPTIONS = {
    topic: 't', batchSize: 'bs', filter: 'filter', bookmark: 'bm', topN: 'top_n', options: 'o', correlationId: 'x',
    orderBy: 'orderby', sowKey: 'k', sowKeys: 'sow_keys', expiration: 'e',
    clientName: 'client_name', sequenceId: 's', transmissionTime: 'transmission_time', sendEmpty: 'send_empty',
    dataOnly: 'data_only', sendSubscriptionIds: 'send_subscription_ids', subscriptionIds: 'sids', sendOOF: 'send_oof',
    sendKeys: 'send_keys', subId: null, queryId: null, ackType: null, data: null, command: null
};
Object.keys(COMMAND_OPTIONS).forEach(function(propertyName) {
    amps.Command.prototype[propertyName] = function(x) {
        if (!arguments.length) {
            return this.members[propertyName];
        }
        this.members[propertyName] = x;
        return this;
    };
});


/**
 * This is the constructor of Client class.
 * @param {string} name Unique name for the client (important for queues and sow).
 * @returns {amps.Client}
 * @constructor
 */
amps.Client = function(name) {
    var self = this;
    this.members = {
        name: name,
        serverVersion: null,
        nextSubId: 1,
        subscriptions: {},
        connection: null,
        typeHelper: null,
        errorHandler: null,
        publish_header: null,
        binaryBuffer: null,
        heartbeat: null,
        authenticator: null,
        message_state: {
            in_group: false,
            current_sow: null,
            merged_header: false,
            records_remaining: 0
        }
    };
    this.timeouts = {};

    // parseUri 1.2.2
    // (c) Steven Levithan <stevenlevithan.com>
    // MIT License
    this.parseUri = function(str) {
        var o = this.parseUri.options,
            m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str),
            uri = {},
            i = 14;

        while (i--) {
            uri[o.key[i]] = m[i] || '';
        }

        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) {
            if ($1) {
                uri[o.q.name][$1] = $2;
            }
        });

        return uri;
    };
    this.parseUri.options = {
        strictMode: false,
        key: [
            'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative',
            'path', 'directory', 'file', 'query', 'anchor'
        ],
        q: {
            name: 'queryKey',
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/, // jshint ignore:line
            loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // jshint ignore:line
        }
    };

    /**
     * This is a private internal method that parses a string with acks (ex: 'processed,completed') into a list of
     * predefined ackTypes. Clears bad types, duplicates, etc. Returns an empty list if the ack string is empty, null,
     * or does not contain any valuable information.
     * @param {string} ackString the string to parse.
     * @ignore
     */
    var parseAcks = function(ackString) {
        // non-string, null, undefined, etc.
        if (typeof ackString !== 'string') { return []; }
        var acksInfo = {received: false, processed: false, completed: false, persisted: false, stats: false};
        ackString.split(',').map(function(ack) { if (acksInfo[ack] !== undefined) { acksInfo[ack] = true; } });

        return Object.keys(acksInfo).filter(function(ack) { return acksInfo[ack] === true; });
    };

    /**
     * This is a helper method that creates a command handler for the client.
     * @param {function} messageHandler A callback for a message/requested ack message
     * @param {function} resolve a callback for execution report (success)
     * @param {function} reject a callback for execution report (failure)
     * @param {string} acks command-required ackType(s).
     * @param {string} userAcks ackTypes requested by a user.
     * @param {string} commandName the name of the command.
     * @param {string} subscriptionId the id of the subscription (can be either a command id or a subscription id).
     * @ignore
     */
    this.makeCommandHandler = function(messageHandler, resolve, reject, acks, userAcks, commandName, subscriptionId) {
        var self = this;

        // Parse the acks into lists of unique values
        userAcks = parseAcks(userAcks);
        acks = parseAcks(acks);

        self.members.subscriptions[subscriptionId] = function(message) {
            // cancel the timeout (if any)
            clearTimeout(self.timeouts[message.cid]);
            delete self.timeouts[message.cid];

            // Detect an Ack message
            if (message.c === 'ack') {
                if (message.a === 'processed') {
                    // Detect error/success
                    if (message.status === 'failure') {
                        if (reject) {
                            reject({commandId: subscriptionId, message: message});
                        }
                    }
                    else {
                        // if it's not a logon command, we only pass the subscription id back to then()
                        if (resolve) {
                            resolve(commandName === 'logon' ? {
                            commandId: subscriptionId,
                            message: message
                            } : subscriptionId);
                        }
                    }
                }

                var userAckIndex = userAcks.indexOf(message.a);
                var ackIndex = acks.indexOf(message.a);

                // Detect if the message should be reported to the message handler
                if (userAckIndex >= 0 && messageHandler) {
                    // Deliver the message
                    messageHandler(message);
                }

                // If the command is a subscribe type
                var isSubscribe = [
                        'subscribe', 'sow_and_subscribe', 'delta_subscribe', 'sow_and_delta_subscribe'
                    ].indexOf(commandName) >= 0;

                // Delete acks from the delivery lists
                if (ackIndex >= 0) {
                    acks.splice(ackIndex, 1);
                }
                if (userAckIndex >= 0) {
                    userAcks.splice(userAckIndex, 1);
                }

                // Delete the handler after getting all the acknowledgment messages in order to not overflow the heap
                if (userAcks.length === 0 && acks.length === 0 && !isSubscribe) {
                    delete self.members.subscriptions[subscriptionId];
                }
            }
            // Timeout error
            else if (message.c === 'timeout') {
                reject({commandId: subscriptionId, message: message});
            }
            else if (messageHandler) {
                messageHandler(message);
                resolve(subscriptionId);
            }
        };
    };

    /**
     * This internal method invokes the corresponding callback handler (if any), based on id.
     * @param {string} id the id of the message to handle.
     * @param {object} message message to handle.
     * @ignore
     */
    var invokeHandlerInternal = function(id, message) {
        if (self.members.subscriptions[id]) {
            try {
                self.members.subscriptions[id](message);
            } catch (e) {
                console.error('User message handler threw exception:\n' + e.stack);
            }
        }
    };

    /**
     * This internal method is being invoked by the WebSocket connection's onmessage event handler.
     * @param event message event from the WebSocket connection.
     * @ignore
     */
    this.onMessageInternal = function(event) {
        /* State Machine

         SOW command
         |- 'ack' failure
         |     |- done
         |- 'ack' success
         |- 'group_begin'
         |- 0 or more of 'sow' batch  (bs contains number of records following)
         |     |- record header
         |     |- record data
         |- 'group_end'
         |- done

         */

        var state = self.members.message_state;
        try {
            var message;

            if (!state.records_remaining) {
                if (state.publish_header) {
                    // This event contains data for our last publish.
                    state.publish_header.data = self.members.typeHelper.deserialize(event.data);
                    var sub_ids = state.publish_header.sids.split(',');
                    for (var i = 0; i < sub_ids.length; ++i) {
                        invokeHandlerInternal(sub_ids[i], state.publish_header);
                    }
                    state.publish_header = null;
                    return;
                }
                // Otherwise, this is the message header.
                message = JSON.parse(event.data);
                switch (message.c) {
                    case 'p': case 'publish': case 'oof':
                        state.publish_header = message;
                        invokeHandlerInternal(message.cid, message);
                        break;
                    case 'sow':
                        state.current_sow = message;
                        state.merged_header = false; // TODO figure implicit declaration here
                        state.records_remaining = message.bs;
                        break;
                    case 'group_begin':
                        state.in_group = true;
                        invokeHandlerInternal(message.query_id, message);
                        break;
                    case 'group_end':
                        state.in_group = false;
                        invokeHandlerInternal(message.query_id, message);
                        break;
                    case 'ack':
                        invokeHandlerInternal(message.cid, message);
                }
            } else {
                // SOW Batch Processing Logic
                if (!state.merged_header) {
                    message = JSON.parse(event.data);
                    state.current_sow.k = message.k;
                    state.current_sow.x = message.x;
                    state.merged_header = true;
                } else {
                    state.current_sow.data = self.members.typeHelper.deserialize(event.data);
                    state.merged_header = false;
                    --state.records_remaining;
                    invokeHandlerInternal(state.current_sow.query_id, state.current_sow);
                }
            }
        } catch (e) {
            self.onError({
                code: 997, reason:'Error ' +
                e.message + ' encountered while processing a message (' +
                event.data + ') from AMPS'
            });
        }
    };

    /**
     * This is the private method that sends commands to an AMPS server.
     * @ignore
     */
    var send = function() {
        if (self.members.connection === undefined) {
            throw 'must connect before sending data';
        }
        if (arguments.length === 0) {
            throw 'command not found';
        }

        // First argument is the command object, let's serialize it.
        var serializedCommand= arguments[0];

        if (!serializedCommand.a) {
            serializedCommand.a = '';
        }
        serializedCommand = JSON.stringify(serializedCommand);

        if (arguments.length === 1) {
            self.members.connection.send(amps.TypeHelper.littleEndianSizeBuffer(1)); // Could be made more efficient.
            self.members.connection.send(serializedCommand);
        }
        else if (arguments.length === 2) {
            // If there's a second argument, we need to serialize it as well.
            var parts = self.members.typeHelper.serialize(arguments[1]);
            self.members.connection.send(amps.TypeHelper.littleEndianSizeBuffer(parts.length + 1));
            self.members.connection.send(serializedCommand);

            for (var i = 0; i < parts.length; ++i) {
                self.members.connection.send(parts[i]);
            }
        }
        else {
            throw 'Too many arguments to send.';
        }
    };

    /**
     * This is the private event that handles the execution of a command that has been timed out.
     * @param {string} commandId the id of a command to time out.
     * @ignore
     */
    var onTimeout = function(commandId) {
        invokeHandlerInternal(commandId, {c: 'timeout', reason: 'The command has been timed out.'});
        delete self.members.subscriptions[commandId];
    };

    /**
     * This is a general method that is executed if an error occured. It reports the error to the client's
     * connect() execution handler.
     * @param {Error} err the error to report.
     * @ignore
     */
    this.onError = function(err) {
        if (err.code && err.reason) {
            // The close was initiated by websocket/server - Error case
            err = new Error(err.code + ': ' + err.reason);
        }

        // Report the general error to the error handler (if any)
        if (self.members.errorHandler) {
            self.members.errorHandler(err);
        }
    };

    /**
     * This is the command execution interface method that allows to send commands that don't have a convenience
     * method or require
     * additional settings that are not provided by the convenience methods.
     * The purpose of the method is to execute Command objects.
     * @example
     * var subscribeCommand = new amps.Command('subscribe')
     *   .topic('messages')
     *   .filter('/id > 20');
     *
     * client.execute(subscribeCommand, function(message) {
     *     console.log('message: ', message.data);
     * }).then(function(commandId) {
     *     console.log('commandId: ', commandId);
     * });
     * @param {amps.Command} command a Command object.
     * @param {function} handler a callback to report the messages (including ack messages if they were requested).
     * @param {int} [timeout] a timeout value for the command execution in milliseconds.
     * @returns {Promise} The promise object fullfilled with the command id created.
     */
    this.execute = function(command, handler, timeout) {
        return new Promise((function(resolve, reject) {
            var commandId = (self.members.nextSubId++).toString();
            var header = { c: command.command(), cid: commandId, a: '' };
            var isSubscribe = false;

            switch (command.command()) {
                case 'subscribe':
                case 'delta_subscribe':
                case 'sow_and_subscribe':
                case 'sow_and_delta_subscribe':
                    header.sub_id = command.subId() ? command.subId().toString() : commandId;
                    isSubscribe = true;
                    /* falls through */
                case 'sow':
                    header.query_id = command.queryId() ?
                        command.queryId().toString() :
                        (header.sub_id ? header.sub_id : commandId);
                    header.a = 'processed';

                    // for SOW only, we get a completed ack so we know when to remove the handler
                    if (isSubscribe === false) {
                        header.a += ',completed';
                    }

                    // Assign the handler
                    this.makeCommandHandler(
                        handler,
                        resolve,
                        reject,
                        header.a,
                        command.ackType(),
                        command.command(),
                        isSubscribe ? header.sub_id : header.cid
                    );

                    break;
                case 'unsubscribe':
                    var subId = command.subId() ? command.subId().toString() : 'all';
                    header.sub_id = subId;

                    // delete all subscriptions
                    if (subId === 'all') {
                        self.members.subscriptions = {};
                    }
                    else {
                        delete self.members.subscriptions[subId];
                    }
                    /* falls through */
                // The below commands can have ack messages received, even though it can only be in the message handler
                case 'flush':
                case 'heartbeat':
                case 'stop_timer':
                case 'sow_delete':
                    header.a = 'processed';

                    // Assign the handler
                    this.makeCommandHandler(
                        handler,
                        resolve,
                        reject,
                        header.a,
                        command.ackType(),
                        command.command(),
                        isSubscribe ? header.sub_id : header.cid
                    );
                    break;
                case 'delta_publish':
                case 'publish':
                    header.a = 'processed';
                    // Assign the handler (fall through) but only if a user requested an acknowledgment
                    if (command.ackType() !== undefined) {
                        this.makeCommandHandler(
                            handler,
                            null,
                            null,
                            header.a,
                            command.ackType(),
                            command.command(),
                            commandId
                        );
                    }

                    // Resolve right away
                    resolve(commandId);
                    break;
                default: break;
            }

            // Add user-requested acks (those will be delivered in the message handler as well)
            if (command.ackType() !== undefined) {
                header.a += ',' + command.ackType();
            }

            // Add credentials in case of the logon command
            if (command.command() === 'logon') {
                header.a = 'processed';
                header.version = this.version();
                if (this.members.name) {
                    header.client_name = this.members.name;
                }
                else {
                    header.client_name = 'AMPS-JavaScript-' + new Date().getTime();
                }

                if (self.members.username !== undefined) {
                    header.user_id = self.members.username;
                    if (self.members.password !== undefined && self.members.password.length) {
                        header.pw = self.members.password;
                    }
                }

                this.makeCommandHandler(
                    handler,
                    resolve,
                    reject,
                    header.a,
                    'processed',
                    command.command(),
                    commandId
                );
            }

            // Assign values of additional properties
            var properties = Object.keys(command.members);
            for (var i = 0; i < properties.length; ++i) {
                var property = properties[i];
                var propertyCode = COMMAND_OPTIONS[property];

                if (propertyCode) {
                    header[propertyCode] = command[property]();
                }
            }

            // set the command timeout, if any
            if (timeout !== undefined) {
                this.timeouts[commandId] = setTimeout(function() { onTimeout(commandId); }, timeout);
            }

            // Send the command
            try {
                if (command.data() !== undefined) {
                    send(header, command.data());
                } else {
                    send(header);
                }
            }
            catch (err) {
                reject(commandId, err);
            }
        }).bind(this));
    };
};

/**
 * This method connects the AMPS client to the server. It automatically calls logon() upon successful connection.
 * @example
 * var client = new amps.Client('my-application');
 *
 * client.connect('ws://localhost:9100/amps/json')
 *     .then(function() {
 *         // now the client is ready to send and receive any commands
 *         // ...
 *     })
 *     .catch(function(err) {
 *         console.error('Connection error: ', err);
 *     });
 * @param {string} uri The URI containing all required credentials/addresses/types.
 * @param {object} [authenticator] The authenticator object for custom authentication scenarios. The default
 * authenticator is provided. See {@link amps.DefaultAuthenticator} for details.
 * @returns {Promise} The promise object with the result of fullfilling/failing the connection promise.
 */
amps.Client.prototype.connect = function(uri, authenticator) {
    var self = this;

    /**
     * This internal method initiates a new connection.
     * @ignore
     */
    var openConnection = function() {

        return new Promise(function(resolve, reject) {
            // Take care of the authenticator
            if (!authenticator) {
                authenticator = new amps.DefaultAuthenticator();
            }
            self.members.authenticator = authenticator;
            var parsedURI = self.parseUri(uri);

            // Node.js
            if (typeof window === 'undefined' && typeof module !== 'undefined' && module.exports) {
                var headers = {};

                if (parsedURI.user.length > 0 || parsedURI.password.length > 0) {
                    headers.Authorization = 'Basic ' +
                        new Buffer(parsedURI.user + ':' + parsedURI.password).toString('base64');
                }

                self.members.connection = new WebSocket(uri, null, null, headers, null, {
                    maxReceivedFrameSize: 0x10000000000,  // support large messages
                    assembleFragments: true
                });
            }
            // everything else
            else {
                self.members.connection = new WebSocket(uri);
            }

            self.members.connection.binaryType = 'arraybuffer';

            var messageType = uri.split('/').pop();
            self.members.typeHelper = amps.TypeHelper.helper(messageType);

            var isOpen = false;
            self.members.connection.onopen = function() {
                self.members.uri = uri;
                self.members.username = parsedURI.user;
                self.members.password = parsedURI.password;

                if (messageType === 'json') {
                    self.members.connection.send('text');
                }
                else {
                    self.members.connection.send('binary');
                }

                isOpen = true;
                resolve();
            };

            self.members.connection.onclose = function(err) {
                // The close was initiated by websocket/server - Error case
                if (err.code && err.reason) {
                    err = Error(err.code + ': ' + err.reason);
                }

                if (err) {
                    if (isOpen) {
                        // report the error to the error handler
                        if(self.members.errorHandler) {
                            self.members.errorHandler(err);
                        }
                    }
                    else {
                        reject(err);
                    }

                    self.disconnect();
                }

                // turn the connection flag off
                isOpen = false;
            };

            self.members.connection.onerror = function(err) {};

            self.members.connection.onmessage = self.onMessageInternal.bind(self);
        });
    };

    /**
     * This internal method is being called right before the logon (mainly in order to use authenticator methods).
     * @ignore
     */
    var beforeLogon = function() {
        return self.members.authenticator.authenticate(self.members.username, self.members.password)
            .then(function(passwordHeader) {
                self.members.password = passwordHeader;
            });
    };

    /**
     * This internal method performs the logon command. Upon result, the promise object will be fullfilled.
     * of failure.
     * @ignore
     */
    var logon = function() {
        /**
         * This internal function is called once the ack for the logon command has been received. It's used for
         * setting up the serverVersion variable and proceed with the authenticator methods.
         *
         * @param {object} message The ack message from the server.
         * @returns {Promise} The promise object.
         * @ignore
         */
        var uponLogonAttempt = function(result) {
            var message = result.message;

            return new Promise(function(resolve, reject) {
                // Successful logon
                if (message.c === 'ack' && message.a === 'processed' && message.status === 'success') {
                    self.members.serverVersion = message.version;
                    self.members.authenticator.completed(
                        self.members.username,
                        self.members.password,
                        message.reason ? message.reason : ''
                    );

                    resolve();
                }
                // Retry case
                if (message.c === 'ack' && message.a === 'processed' && message.status === 'retry') {
                    self.members.authenticator.retry(message.user_id, message.pw).then(function(passwordHeader) {
                        self.members.password = passwordHeader;

                        logon().then(resolve).catch(reject);
                    });
                }
                // Authentication failure
                else if (message.c === 'ack' && message.a === 'processed' && message.status === 'failure') {
                    reject(Error(message.reason));
                }
            });
        };

        return self.execute(new amps.Command('logon').ackType('processed')).then(uponLogonAttempt);
    };

    /**
     * This internal method is being called upon successful logon. In case of the heartbeat option enabled, it
     * sets up and intiates the heartbeat protocol.
     * @ignore
     */
    var afterLogon = function() {
        if (self.members.heartbeat) {
            self.members.heartbeat.onHeartbeatAbsence = function() {
                self.onError(new Error(4000, 'Heartbeat absence error'));
            };

            self.members.heartbeat.onPulse = function() {
                // if we are already disconnected, stop
                if (!self.members.connection) {
                    return;
                }

                // Clear the previous timeouts (if any)
                clearTimeout(self.members.heartbeat.timeoutId);

                // Set new timeout
                self.members.heartbeat.timeoutId = setTimeout(
                    self.members.heartbeat.onHeartbeatAbsence,
                    self.members.heartbeat.timeout * 1000
                );

                // Do the beat
                self.execute(
                    new amps.Command('heartbeat').ackType('received').options('beat'),
                    function(message) {
                        if (message.c === 'ack' && message.a === 'received' && message.status === 'success') {
                            self.members.heartbeat.pulseId = setTimeout(
                                self.members.heartbeat.onPulse,
                                self.members.heartbeat.interval * 1000
                            );
                        }
                    }
                );
            };

            // Initiate the heartbeat procedure
            self.execute(
                new amps.Command('heartbeat')
                    .ackType('received')
                    .options('start,' + self.members.heartbeat.interval),
                function(message) {
                    if (message.c === 'ack' &&
                        message.a === 'received' &&
                        message.status === 'success') {
                        // Starting from here, we have a heartbeat mode with the server enabled
                        self.members.heartbeat.onPulse();
                    }
                }).catch(function(err) {
                    err = new Error(4000, 'Heartbeat connection error');
                    self.onError(err);
                });
        }
    };

    return openConnection().then(beforeLogon).then(logon).then(afterLogon);
};

/**
 * This method sets up the error handler for all general errors such as connection issues, exceptions, etc.
 * @example
 * var client = new amps.Client().errorHandler(function(err) {
 *     console.error('err: ', err);
 * });
 * @param {function} errorHandler the callback function that will be invoked in case of a general error.
 * @returns {amps.Client} the {@link amps.Client} object.
 */
amps.Client.prototype.errorHandler = function(errorHandler) {
    if (typeof errorHandler === 'function') {
        this.members.errorHandler = errorHandler;
    }

    return this;
};

/**
 * This method sets up the heartbeat mode with the server. It sends a command to AMPS that starts or refreshes
 * a heartbeat timer. When a heartbeat timer is active, AMPS publishes periodic heartbeat messages to AMPS and expects
 * the client to respond with a heartbeat message. If the client does not provide a heartbeat within the time specified,
 * AMPS logs an error and disconnects the connection.
 * @example
 * // Initialize a client with the heartbeat of 5 seconds
 * var client = new amps.Client().heartbeat(5);
 * @param {int} interval the heartbeat value in seconds.
 * @param {int} [timeout] the timeout value in seconds. By default it is the heartbeat interval value times 2.
 * @returns {amps.Client} the client object.
 */
amps.Client.prototype.heartbeat = function(interval, timeout) {
    // Set up the default timeout value
    if (timeout === undefined) { timeout = interval * 2; }

    this.members.heartbeat = {
        interval: interval,
        timeout: timeout
    };

    return this;
};

/**
 * This method disconnects the client from an AMPS server (if the connection existed).
 */
amps.Client.prototype.disconnect = function() {
    var self = this;

    return new Promise(function(resolve) {
        // take care of heartbeat
        if (self.members.heartbeat) {
            clearTimeout(self.members.heartbeat.pulseId);
            clearTimeout(self.members.heartbeat.timeoutId);
            delete self.members.heartbeat.onPulse;
            delete self.members.heartbeat.onHeartbeatAbsence;

            self.members.heartbeat = null;
        }

        // delete all subscriptions
        var timeoutIds = Object.keys(self.timeouts);
        for (var i = 0; i < timeoutIds.length; ++i) {
            clearTimeout(self.timeouts[timeoutIds[i]]);
            delete self.timeouts[timeoutIds[i]];
        }

        if (self.members.connection) {
            // null connection-related stuff
            self.members.uri = undefined;
            self.members.username = undefined;
            self.members.password = undefined;
            self.members.authenticator = null;
            self.members.connection.onclose = null;
            self.members.connection.onopen = null;

            // close the connection
            self.members.connection.close(1000, 'Disconnect from the client');
            self.members.connection = undefined;
        }

        // resolve the promise
        resolve();
    });
};

/**
 * This method returns the server version returned by the AMPS server in the logon acknowledgement.
 * If logon has not been performed yet, returns null.
 * @returns {string} the version of the AMPS server.
 */
amps.Client.prototype.serverVersion = function() {
    return this.members.serverVersion;
};

/**
 * This method returns a static string built into amps.js.
 * @returns {string} the version of this AMPS client.
 */
amps.Client.prototype.version = function() {
    return '5.2.1.0.226263.6dcb6e2';
};

/**
 * This method performs the publish command.
 * The publish command is the primary way to inject messages into the AMPS processing stream. A publish command
 * received by AMPS will be forwarded to other connected clients with matching subscriptions.
 * @example
 * client.publish('topic', '{"id": 1}');
 * @param {string} topic the topic to publish data.
 * @param data the data to publish to a topic.
 * @param {object} [options] an object with options, like: &#123;expiration: 30, ...&#125;
 */
amps.Client.prototype.publish = function(topic, data, options) {
    // TODO rewrite to NOT use execute() interface
    var publishCommand = new amps.Command('publish').topic(topic).data(data).addOptions(options);

    return this.execute(publishCommand);
};

/**
 * This method performs the subscribe command. The subscribe command is the primary way to retrieve messages
 * from the AMPS processing stream. A client can issue a subscribe command on a topic to receive all published messages
 * to that topic in the future. Additionally, content filtering can be used to choose which messages the client is
 * interested in receiving.
 * @example
 * client.subscribe(function(message) { console.log(message); }, 'topic')
 *     .then(function(subscriptionId) { console.log(subscriptionId); })
 *     .catch(function(err) { console.error('err: ', err); });
 * @param {function} onMessage a message handler that will be called each time a message is received.
 * @param {string} topic The topic argument in subscribe (must be a string).
 * @param {string} [filter] The filter argument in subscribe (must be a string).
 * @param {object} [options] The options like ackType, bookmark, commandId, etc in an object.
 * @returns {Promise} The promise object with the results of execution of the command.
 */
amps.Client.prototype.subscribe = function(onMessage, topic, filter, options) {
    if (typeof topic !== 'string') {
        throw 'The topic argument in subscribe must be a string, not a "' + (typeof topic) + '"';
    }
    if (typeof onMessage !== 'function') {
        throw 'The message handler argument in subscribe must be a function, not a "' + (typeof onMessage) + '"';
    }
    if (filter === undefined || filter === null) {
        filter = '';
    }
    else if (typeof filter !== 'string') {
        throw 'The filter argument in subscribe must be a string, not a "' + (typeof filter) + '"';
    }

    return this.execute(
        new amps.Command('subscribe')
            .topic(topic)
            .filter(filter)
            .addOptions(options),
        onMessage
    );
};

/**
 * This method performs the sow command. The sow command is use to query the contents of a previously defined SOW Topic.
 * A sow command can be used to query an entire SOW Topic, or a filter can be used to further refine the results found
 * inside a SOW Topic. For more information, see the State of the World and SOW Queries chapters in the AMPS User Guide.
 * @example
 * client.sow(function(message) { console.log(message); }, 'sow-topic')
 *     .then(function(subscriptionId) { console.log(subscriptionId); })
 *     .catch(function(err) { console.error('err: ', err); });
 * @param {function} onMessage a message handler that will be called each time a message is received.
 * @param {string} topic The topic argument in sow (must be a string).
 * @param {string} [filter] The filter argument in sow (must be a string).
 * @param {object} [options] The options like ackType, bookmark, commandId, etc in an object.
 * @returns {Promise} The promise object with the results of execution of the command.
 */
amps.Client.prototype.sow = function(onMessage, topic, filter, options) {
    if (typeof topic !== 'string') {
        throw 'The topic argument in sow must be a string, not a "' + (typeof topic) + '"';
    }
    if (typeof onMessage !== 'function') {
        throw 'The message handler argument in sow must be a function, not a "' + (typeof onMessage) + '"';
    }
    if (filter === undefined || filter === null) {
        filter = '';
    }
    else if (typeof filter !== 'string') {
        throw 'The filter argument in sow must be a string, not a "' + (typeof filter) + '"';
    }

    return this.execute(
        new amps.Command('sow')
            .topic(topic)
            .filter(filter)
            .addOptions(options),
        onMessage
    );
};

/**
 * This method performs the sow_and_subscribe command. A sow_and_subscribe command is used to combine the functionality
 * of sow and a subscribe command in a single command. The sow_and_subscribe command is used
 *      (a) to query the contents of a SOW topic (this is the sow command); and
 *      (b) to place a subscription such that any messages matching the subscribed SOW topic and query filter will be
 * published to the AMPS client (this is the subscribe command). As with the subscribe command, publish messages
 * representing updates to SOW records will contain only information that has changed.
 * @example
 * client.sowAndSubscribe(function(message) { console.log(message); }, 'sow-topic')
 *     .then(function(subscriptionId) { console.log(subscriptionId); })
 *     .catch(function(err) { console.error('err: ', err); });
 * @param {function} onMessage a message handler that will be called each time a message is received.
 * @param {string} topic The topic argument in sow (must be a string).
 * @param {string} [filter] The filter argument in sow (must be a string).
 * @param {object} [options] The options like ackType, bookmark, commandId, etc in an object.
 * @returns {Promise} The promise object with the results of execution of the command.
 */
amps.Client.prototype.sowAndSubscribe = function(onMessage, topic, filter, options) {
    if (typeof topic !== 'string') {
        throw 'The topic argument in sow_and_subscribe must be a string, not a "' + (typeof topic) + '"';
    }
    if (typeof onMessage !== 'function') {
        throw 'The message handler arg in sow_and_subscribe must be a function, not a "' + (typeof onMessage) + '"';
    }
    if (filter === undefined || filter === null) {
        filter = '';
    }
    else if (typeof filter !== 'string') {
        throw 'The filter argument in sow_and_subscribe must be a string, not a "' + (typeof filter) + '"';
    }

    return this.execute(
        new amps.Command('sow_and_subscribe')
            .topic(topic)
            .filter(filter)
            .addOptions(options),
        onMessage
    );
};

/**
 * This method performs the delta_subscribe command. The delta_subscribe command is like the subscribe command except
 * that subscriptions placed through delta_subscribe will receive only messages that have changed between
 * the SOW record and the new update. If delta_subscribe is used on a record which does not currently exist in the SOW
 * or if it is used on a topic which does not have a SOW-topic store defined, then delta_subscribe behaves
 * like a subscribe command.
 * @example
 * client.deltaSubscribe(function(message) { console.log(message); }, 'topic')
 *     .then(function(subscriptionId) { console.log(subscriptionId); })
 *     .catch(function(err) { console.error('err: ', err); });
 * @param {function} onMessage a message handler that will be called each time a message is received.
 * @param {string} topic The topic argument in sow (must be a string).
 * @param {string} [filter] The filter argument in sow (must be a string).
 * @param {object} [options] The options like ackType, bookmark, commandId, etc in an object.
 * @returns {Promise} The promise object with the results of execution of the command.
 */
amps.Client.prototype.deltaSubscribe = function(onMessage, topic, filter, options) {
    if (typeof topic !== 'string') {
        throw 'The topic argument in delta_subscribe must be a string, not a "' + (typeof topic) + '"';
    }
    if (typeof onMessage !== 'function') {
        throw 'The message handler arg in delta_subscribe must be a function, not a "' + (typeof onMessage) + '"';
    }
    if (filter === undefined || filter === null) {
        filter = '';
    }
    else if (typeof filter !== 'string') {
        throw 'The filter argument in delta_subscribe be a string, not a "' + (typeof filter) + '"';
    }

    return this.execute(
        new amps.Command('delta_subscribe')
            .topic(topic)
            .filter(filter)
            .addOptions(options),
        onMessage
    );
};

/**
 * This method performs the sow_and_delta_subscribe command.
 * A sow_and_delta_subscribe command is used to combine the functionality of commands sow and a delta_subscribe
 * in a single command. The sow_and_delta_subscribe command is used
 *          (a) to query the contents of a SOW topic (this is the sow command); and
 *          (b) to place a subscription such that any messages matching the subscribed SOW topic and query filter
 *          will be published to the AMPS client (this is the delta_subscribe command).
 * As with the delta_subscribe command, publish messages representing updates to SOW records will contain only the
 * information that has changed. If a sow_and_delta_subscribe is issued on a record that does not currently exist
 * in the SOW topic, or if it is used on a topic that does not have a SOW-topic store defined,
 * then a sow_and_delta_subscribe will behave like a sow_and_subscribe command.
 * @example
 * client.sowAndDeltaSubscribe(function(message) { console.log(message); }, 'sow-topic')
 *     .then(function(subscriptionId) { console.log(subscriptionId); })
 *     .catch(function(err) { console.error('err: ', err); });
 * @param {function} onMessage a message handler that will be called each time a message is received.
 * @param {string} topic The topic argument in sow (must be a string).
 * @param {string} [filter] The filter argument in sow (must be a string).
 * @param {object} [options] The options like ackType, bookmark, commandId, etc in an object.
 * @returns {Promise} The promise object with the results of execution of the command.
 */
amps.Client.prototype.sowAndDeltaSubscribe = function(onMessage, topic, filter, options) {
    if (typeof topic !== 'string') {
        throw 'The topic argument in sow_and_delta_subscribe must be a string, not a "' + (typeof topic) + '"';
    }
    if (typeof onMessage !== 'function') {
        throw 'The message handler arg in sow_and_delta_subscribe must be a function, not a "' +
        (typeof onMessage) + '"';
    }
    if (filter === undefined || filter === null) {
        filter = '';
    }
    else if (typeof filter !== 'string') {
        throw 'The filter argument in sow_and_delta_subscribe must be a string, not a "' + (typeof filter) + '"';
    }

    return this.execute(
        new amps.Command('sow_and_delta_subscribe')
            .topic(topic)
            .filter(filter)
            .addOptions(options),
        onMessage
    );
};

/**
 * This method performs the unsubscribe command. The unsubscribe command unsubscribes the client from the topic
 * which messages the client is is no more interested in receiving.
 * @example
 * client.unsubscribe('123');
 * @param {string} subId The id of the subscription.
 * @returns {Promise} The promise object with the results of execution of the command.
 */
amps.Client.prototype.unsubscribe = function(subId) {
    if (typeof subId !== 'string') {
        throw 'The subId argument in unsubscribe must be a string, not a "' + (typeof subId) + '"';
    }

    return this.execute(new amps.Command('unsubscribe').subId(subId).ackType('received'));
};


/**
 * This method ACKs a message queue message using the message object.
 * @name amps.Client#ack
 * @example
 * client.ack(queueMessage);
 * @param {object} message AMPS message object.
 * @returns {Promise} The promise object with the results of execution of the command.
 * @function
 */
/**
 * This method ACKs a message queue message using the topic and bookmark values.
 * @example
 * client.ack('queue-topic', '12290412031115262887|1484244707000000008|');
 * @param {String} topic The topic of the message to ACK.
 * @param {String} bookmark The bookmark of the message to ACK.
 * @returns {Promise} The promise object with the results of execution of the command.
 */
amps.Client.prototype.ack = function() {
    // data required
    var topic, bookmark;

    // message case
    if (arguments.length === 1) {
        var message = arguments[0];
        topic = message.t;
        bookmark = message.bm;
    }
    // topic/bookmark case
    else if (arguments.length === 2) {
        topic = arguments[0];
        bookmark = arguments[1];

        if (typeof topic !== 'string') {
            throw 'The subId argument in ack() must be a string, not a "' + (typeof topic) + '"';
        }
        if (typeof bookmark !== 'string') {
            throw 'The subId argument in ack() must be a string, not a "' + (typeof bookmark) + '"';
        }
    }
    else {
        throw 'Either a message object or a topic and bookmark strings should be provided in ack()';
    }

    return this.execute(new amps.Command('sow_delete').topic(topic).bookmark(bookmark).ackType('persisted'));
};



// Node environment module
if (typeof window === 'undefined' && typeof module !== 'undefined' && module.exports) {
    module.exports = amps;
}
