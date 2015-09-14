/**
 * Origami Application Configuration - Defines routing
 */

global.origamiApp.config([
    '$routeProvider',
    '$locationProvider',
    ($routeProvider, $locationProvider) => {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/', {
                templateUrl: global.serverConfig.OrigamiDir + 'src/js/pages/home/homePage.html',
                controller: 'homePageCtrl'
            })
            .when('/edit/:pageId', {
                templateUrl: global.serverConfig.OrigamiDir + 'src/js/pages/edit/editPage.html',
                controller: 'editPageCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    }
]);
