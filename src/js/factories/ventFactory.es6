/*
 * Origami Vent Factory - Provides a common event bus throughout the app
 *
    if used inside of a page or a directive, please destroy
    the listener when the entity is:

        var removeVentListener = Vent.on(<< brevity >>);

        scope.$on('$destroy', () => {
            removeVentListener();
        });
 */

global.origamiApp.factory('Vent', [
    '$rootScope',
    ($rootScope) => {
        return {
            on: (eventName, handler) => {
                return $rootScope.$on(eventName, handler);
            },
            trigger: (eventName, ...args) => {
                if (!args) {args = []}
                $rootScope.$broadcast(eventName, ...args);
            }
        }
    }
]);