/**
 * Origami Storage Factory - Manages event driven global storage - LocalStorage and in memory storage.
 *
    if used inside of a page or a directive, please destroy
    the listener when the entity is:

        var removeStorageListener = Storage.onLocal(<< brevity >>);

        scope.$on('$destroy', () => {
            removeStorageListener();
        });
 */
global.origamiApp.factory('Storage', [
    '$rootScope',
    ($rootScope) => {

        var events = {
            localStorage: {},
            sessionStorage: {}
        }; //event store

        global.addEventListener('storage', (e) => {
            [name, value] = e.originalEvent;
            emitStorageChange('localStorage', name, value);
        });

        var emitStorageChange = (medium, name, value) => {
            var value = JSON.parse(value);
            $rootScope.$apply(() => {
                for (let handlerKey in events[medium][name]) {
                    events[medium][name][handlerKey](value);
                }
            });
        }

        var get = (medium, name) => {
            try {
                return JSON.parse(global[medium][name]);
            } catch (e) {
                return undefined;
            }
        }

        var set = (medium, name, value) => {
            if (value == undefined && global[medium][name]) {
                global[medium].removeItem(name);
            } else if (global[medium][name] !== value) {
                value = JSON.stringify(value);
                global[medium][name] = value;
            }
    
            emitStorageChange(medium, name, value);

            return true;
        }

        var onChange = (medium, name, handler) => { //bind new event, return unbind function
            if (!events[medium][name]) {events[medium][name] = []}
            events[medium][name].push(handler);
            return () => { // remove handler
                events[medium][name].splice(events[medium][name].indexOf(handler), 1);
            };
        }

        return {
            getLocal: (name) => {
                return get('localStorage', name);
            },
            setLocal: (name, value) => {
                return set('localStorage', name, value);
            },
            onLocalChange: (name, handler) => {
                return onChange('localStorage', name, handler);
            },

            getSession: (name) => {
                return get('sessionStorage', name);
            },
            setSession: (name, value) => {
                return set('sessionStorage', name, value);
            },
            onSessionChange: (name, handler) => {
                return onChange('sessionStorage', name, handler);
            }
        };
    }
]);