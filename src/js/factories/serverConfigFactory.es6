/**
 * Origami ServerConfig Factory - Make ServerConfig an available dependancy
 */

global.origamiApp.factory('ServerConfig', [
    () => {
        return window.serverConfig;
    }
]);
