/**
 * Origami Queue Factory. Handles Socket.emit()s (with register.emit()) that update state, and caches changed page data until page is saved.
 */

global.origamiApp.factory('Queue', [
    '$rootScope',
    '$cacheFactory',
    '$timeout',
    '$q',
    'Socket',
    'lodash',
    ($rootScope, $cacheFactory, timeout, q, Socket, _) => {
        var unchangedPages = {}, // queue rendering data for unchanged, active pages
            changedPages = {}, // queue rendering data for changed pages
            registrations = {}; // registration data against page


        var register = (id, link, scope, titleExpression, typeExpression, getCache) => {
            var stateData,
                states,
                cache,
                moveToUnchangedPages,
                moveToChangedPages,
                emit,
                message = {},
                states = {
                    unchanged: 'unchanged',
                    changed: 'changed',
                    processing: 'processing',
                    failure: 'failure',
                    success: 'success',
                }

            // get the cache unique to this page.
            cache = $cacheFactory.get(`queueCache-${id}`);
            if (!cache) {
                cache = $cacheFactory(`queueCache-${id}`);
            }

            // if we haven't registered this page already, build a new registration for it.
            if (!registrations[id]) {

                stateData = $rootScope.$new();

                stateData.value = cache.get('statusCache') || states.unchanged;

                // when the host scope is destroyed
                scope.$on('$destroy', () => {
                    // when the state is unchanged, destroy the registration
                    if (stateData.value == states.unchanged) {
                        delete registrations[id];
                        delete unchangedPages[id];
                        delete changedPages[id];
                        stateData.$destroy();
                        cache.destroy();
                        message = {};
                    // if it is changed, cache the things
                    } else {
                        cache.put('controllerCache', getCache());
                        cache.put('statusCache', stateData);
                    }
                });

                // add to unchangedPages
                unchangedPages[id] = {
                    scope: scope,
                    state: stateData,
                    link: link,
                    titleExpression: titleExpression,
                    typeExpression: typeExpression
                }

                // respond to state changes
                stateData.$watch('value', (newStatus, oldStatus) => {
                    if (newStatus != oldStatus) {
                        // handle success
                        switch (newStatus) {
                            case states.changed:
                                moveToChangedPages()
                                break;
                            case states.unchanged:
                                moveToUnchangedPages();
                                break;
                            // success is reset after 1 second
                            case states.success:
                                timeout(() => {
                                    stateData.value = 'unchanged';
                                }, 1000);
                                break;
                        }
                    }
                });

                moveToChangedPages = () => {
                    if (unchangedPages[id]) {
                        changedPages[id] = unchangedPages[id];
                        delete unchangedPages[id];
                    }
                };

                moveToUnchangedPages = () => {
                    if (changedPages[id]) {
                        unchangedPages[id] = changedPages[id];
                        delete changedPages[id];
                    }
                };

                emit = (channel, message) => {
                    var deferred = q.defer();

                    stateData.value = 'processing';

                    Socket.emit(channel, message).then(
                        (response) => {
                            message = {
                                class: 'alert-success',
                                message: response.data.body
                            }
                            stateData.value = 'success';
                            deferred.resolve(response);
                        },
                        (err) => {
                            message = {
                                class: 'alert-danger',
                                message: err.data.body || err.data
                            }
                            stateData.value = 'failure';
                            deferred.reject(err);
                        }
                    );
                    return deferred.promise;
                };

                registrations[id] = {
                    stateData: stateData,
                    emit: emit,
                    cache: {},
                    message: {}
                }
            }

            // return these fresh every time, even if there is an existing registration
            registrations[id].cache = cache.get('controllerCache');
            registrations[id].message = message;

            return registrations[id];
        }

        return {
            register: register,
            getChanges: (pageId) => {
                if (pageId != void 0) {
                    return changedPages[pageId];
                }
                return changedPages;
            },
            noChanges: () => {
                return _.isEmpty(changedPages);
            }
        };
    }
]);
