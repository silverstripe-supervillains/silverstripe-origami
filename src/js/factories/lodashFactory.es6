/**
 * Origami lodash Factory - Make lodash an available dependancy
 */

global.origamiApp.factory('lodash', [
    () => {
        return global.lodash;
    }
]);
