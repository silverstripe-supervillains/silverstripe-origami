/**
 * Origami Application File - The main entry point for Browserify
 */

global.origamiApp = angular.module('origami', [
    'ngRoute',
    'ngSanitize',
    'ngAnimate'
]);

require('./factories');
require('./directives');
require('./pages');

// configure
require('./appConfig.es6');

require('./handlers');

global.origamiApp.run([
    '$rootScope',
    'ServerConfig',
    'Socket',
    ($rootScope, ServerConfig, Socket) => {
        // would normally handle socket authentication here
        Socket.emit('user/login');

        $rootScope.config = ServerConfig;
    }
]);
