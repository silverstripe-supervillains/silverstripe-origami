/**
 * Origami Page Edit Controller
 *
 * @requires module:angular-sanitize
 */

global.origamiApp.controller('editPageCtrl', [
    '$scope',
    'Queue',
    'Header',
    'Socket',
    'ServerConfig',
    'Vent',
    '$routeParams',
    'lodash',
    '$location',
    (scope, Queue, Header, Socket, ServerConfig, Vent, $routeParams, _, $location) => {
        var id,
            queue,
            fieldsCache = [],
            changedFields = [];

        id = $routeParams['pageId'];

        scope.loading = false;
        scope.id = id;

        scope.fields = [];
        scope.actions = [];
        scope.users = [];
        scope.breadcrumbs = [];

        Header.render(
            ServerConfig.OrigamiDir + 'src/js/pages/edit/editPageHeaderInclude.html',
            scope,
            'users.length'
        );

        var getCache = () => {
            return {
                fieldsCache: fieldsCache,
                fields: scope.fields,
                actions: scope.actions
            }
        }

        queue = Queue.register(
            `editpage-${id}`,
            $location.absUrl(),
            scope,
            'fields.Root.children.Root_Main.children.Title.value',
            'classname', // TODO make this point to something real
            getCache
        );

        scope.state = queue.stateData;
        scope.emitOnQueue = queue.emit;

        /**
         * Get changeFields. Do it with a function to prevent scope digest from getting into it; perf.
         */
        scope.getChangedFields = () => {
            return changedFields;
        }

        /**
         * Called on page load to handle if other users joining page
         */
        Socket.on('editform/view', (data) => {
            var users = [],
                scopeUsers = [];

            angular.forEach(data.Members, (value, key) => {
                users.push(value.firstname);
                scopeUsers.push(value);
            });

            var pluralization = (users.length > 1) ? 'are' : 'is',
                content = users.join(', ') + ' ' + pluralization + ' now viewing this page.';

            Vent.trigger('SystemMessage.set', {
                class: 'alert-info',
                content: content
            });

            // override the whole array to prevent pushing same user in twice
            scope.users = scopeUsers;
        });

        /**
         * Listen for users leaving the page
         */
        Socket.on('editform/leave', (data) => {
            var memberId = data.MemberID,
                content = data.MemberFirstName + ' has left the page.';

            Vent.trigger('SystemMessage.set', {
                class: 'alert-info',
                content: content
            });

            // remove user from list
            _.remove(scope.users, (user) => {
                return user.id === memberId;
            });
        });

        /**
         * Add action handlers for the front end
         *  - Set handlers here so they work in the current scope, even after applying the cache
         *
         * Origami specific field attributes:
         *  - field.showProcessingSpinner - will show a spinner when state.value === 'processing'
         *  - field.origamiOnly - will prevent origami from submitting the page
         *  - field.handler - will run before submitting the page for processing
         */
        var addActionHandlers = () => {
            var noChangeDisable = () => {
                return scope.state.value === 'unchanged';
            }
            if (scope.actions[''] != void 0) {
                let children = scope.actions[''].children;
                if (children.action_origami_reset != void 0) {
                    children.action_origami_reset.handler = (e) => {
                        resetForm();
                    }
                    children.action_origami_reset.isDisabled = noChangeDisable;
                }
                if (children.action_save != void 0) {
                    children.action_save.isDisabled = noChangeDisable;
                    children.action_save.showProcessingSpinner = true;
                }
            }
        }

        /**
         * transform action fields for the frontend
         */
        var transformActionFields = (actions) => {
            _.forIn(actions, (action, key) => {
                // delve into the children ( ͡° ͜ʖ ͡°)
                if (_.isObject(action.children)) {
                    transformActionFields(action.children);
                // transform the actions
                // - Adding a isDisabled to the action will disable the action when returning true. Be careful, these are expensive to call.
                } else {

                    // if this is an origami action, don't hit the server with it
                    if (action.name.match(/^action_origami/)) {
                        action.origamiOnly = true;
                    }
                }
            });
            return actions;
        }

        /**
         * Load page
         */
        // if cached, use cache
        if (queue.cache) {
            fieldsCache = queue.cache.fieldsCache;
            scope.fields = queue.cache.fields;
            scope.actions = queue.cache.actions;
            scope.breadcrumbs = queue.cache.breadcrumbs;
            addActionHandlers();
        // if not cached, call from server
        } else {
            scope.loading = true;
            Socket.emit('editform/get', { 'pageId': id }).then(
                (response) => {
                    var data = response.data;

                    if(data && data.body) {
                        if(data.body.fields) {
                            fieldsCache = data.body.fields;
                            scope.fields = _.cloneDeep(fieldsCache); // clone fieldsCache, break reference
                        }
                        if(data.body.actions) {
                            scope.actions = transformActionFields(data.body.actions);
                        }
                        if(data.body.breadcrumbs) {
                            scope.breadcrumbs = data.body.breadcrumbs;
                        }
                        addActionHandlers();
                        scope.loading = false;
                    }
                },
                (err) => {
                    // this should handle an error thrown by `EditFormOrigamiApi::get()`
                }
            );
        }

        /**
         * watch state and react to changes
         */
        scope.$watch('state.value', (newStatus, oldStatus) => {
            // handle success
            switch (newStatus) {
                case 'success':
                    fieldsCache = _.cloneDeep(scope.fields); // update fields cache if we saved it
                    break;
            }
        });

        // resets the form by cloning the fields stored
        var resetForm = () => {
            scope.fields = _.cloneDeep(fieldsCache);
        }

        /**
         * Expensive but necessary watch on scope.field changes
         *   - generates fields diff
         *   - updates page status
         */
        scope.$watch('fields', (newFields, oldFields) => {
            changedFields = {};

            /**
             * Generates a structure that contains only the changed field elements,
             * preserving structure and with the bare minimum required to have it saved.
             * Deep recursion algorithm.
             *      acc - Object : Accumulator - the structure that will hold changes
             */
            var buildFieldsDiff = function (fields, fieldsCache, acc) {

                // iterate over the fieldsCache for this level
                _.forIn(fieldsCache, (fieldCache, key) => {
                    var field = fields[key];

                    if (_.isFunction(fieldCache) || _.isRegExp(fieldCache)) return; //disallow Function & RegExp

                    // if the value is an object (Array, Object)
                    if (_.isObject(fieldCache)) {
                        var newAcc,
                            deeper;

                        // define the accumulator required for this level in the tree
                        if (_.isArray(fieldCache)) {
                            newAcc = [];
                        } else {
                            newAcc = {};
                        }

                        // build diff for this object
                        deeper = buildFieldsDiff(field, fieldCache, newAcc);

                        // if result not empty add to this level's accumulator
                        if (!_.isEmpty(deeper)) {
                            if (_.isArray(acc)) {
                                acc.push(deeper);
                            } else {
                                acc[key] = deeper;
                                //keep the name associated with parent objects
                                if (fields.name) {
                                    acc.name = fields.name;
                                }
                            }
                        }

                    // if this is a primitive variable type of key 'value', and it has changed
                    } else if (key == 'value' && !_.isEqual(field, fieldCache)) {
                        // populate accumulator
                        acc.value = field;
                        acc.name = fields.name;
                    }
                });

                return acc;
            }

            changedFields = buildFieldsDiff(newFields, fieldsCache, {});

            if (!_.isEmpty(changedFields)) {
                scope.state.value = 'changed';
            } else {
                scope.state.value = 'unchanged';
            }

        }, true); // the true here tells angular to do a deep watch - expensive. Use with care.

        scope.$on('$destroy', () => {
            // emit user leaving so server can let everyone else know
            Socket.emit('editform/leave', { 'pageId': id });
            Header.clear();
        });
    }
]);
