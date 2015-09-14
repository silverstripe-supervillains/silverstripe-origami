/**
 * Origami Socket Factory - Talks to the SilverStripe CMS over WebSockets
 */

global.origamiApp.factory('Socket', [
    'ServerConfig',
    'Vent',
    '$http',
    '$q',
    (ServerConfig, Vent, http, q) => {

        var _data = {
            conn: {},
            socketId: null,
            connected: false,
            channelListeners: {}, // holds handlers for each channel registered
            queue: [] // holds handlers for each channel registered
        };

        // connect websocket and bind handlers
        var connect = (websocketServerLocation) => {
            Vent.trigger('Socket:connecting');
            _data.conn = new WebSocket(websocketServerLocation);

            // no default onopen behaviour needed
            _data.conn.onopen = (e) => {
                // connection established
            };

            _data.conn.onmessage = (e) => {
                var body = {},
                    data = JSON.parse(e.data);

                // if body is JSON, parse it
                try {
                    body = JSON.parse(data.body);
                } catch(e) {
                    body = data.body;
                }

                // if this is the onopen message with a socketId, then we're connected
                if (data.channel === 'onopen') {
                    if (data.socketId) {
                        _data.connected = true;
                        _data.socketId = data.socketId;
                        processQueue();
                        Vent.trigger('Socket:connected');
                    }
                // otherwise handle as a message
                } else {
                    if (_data.channelListeners[data.channel]) {
                        _data.channelListeners[data.channel].forEach((handler) => {
                            handler(body);
                        });
                    }
                }
            };

            // when the socket closes, register the close
            _data.conn.onclose = () => {
                _data.connected = false;
                _data.socketId = null;
                Vent.trigger('Socket:disconnected');
                //try to reconnect in 5 seconds
                setTimeout(() => {
                    Vent.trigger('Socket:reconnecting');
                    connect(websocketServerLocation);
                }, 5000);
            };
        }

        connect('ws://localhost:8080');

        var addToQueue = (channel, message) => {
            var deferred = q.defer();
            _data.queue.push({
                channel: channel,
                message: message,
                deferred: deferred
            });
            return deferred.promise;
        }

        var processQueue = () => {
            _data.queue.forEach((itemData, i) => {
                emitMessage(itemData.channel, itemData.message).then(
                    (response) => {
                        itemData.deferred.resolve(response);
                    },
                    (err) => {
                        itemData.deferred.reject(err);
                    }
                );
                _data.queue.splice(i, 1);
            });
        }

        var emitMessage = (channel, message) => {
            if (_data.socketId && _data.connected) {
                var deferred = q.defer(),
                    envelope = {
                        'channel': channel,
                        'body': message,
                        'socketId': _data.socketId
                    };

                http.post(`${ServerConfig.BaseHref}/${ServerConfig.WebSocket.endpoint}${channel}`, envelope).then(
                    (resp) => {
                        if(((resp.data.hasOwnProperty('success') && resp.data.success === 1)
                            || !resp.data.hasOwnProperty('success')) &&
                            resp.status === 200) {
                            deferred.resolve(resp);
                        } else {
                            displayErrorNotification(resp);
                            deferred.reject(resp);
                        }
                    },
                    (err) => {
                        displayErrorNotification(err);
                        deferred.reject(err);
                    });

                return deferred.promise;
            } else {
                // if emit fails because of disconnect, register in queue and return promise.
                return addToQueue(channel, message);
            }
        }

        var displayErrorNotification = (err) => {
            var content = err.data;

            if(typeof content == 'string') {
                Vent.trigger('SystemMessage.set', {
                    class: 'alert-danger',
                    content: content
                });
            }
        }

        var onMessage = (channel, handler) => {
            if (typeof channel == 'string' && handler instanceof Function) {
                if (!_data.channelListeners[channel]) {
                    _data.channelListeners[channel] = [];
                }
                _data.channelListeners[channel].push(handler);
            }
        }

        return {
            _data: _data,
            emit: emitMessage,
            on: onMessage
        };

    }
]);