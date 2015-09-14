/**
 * Origami CMS Sidenav Directive - Displays the CMS Sidenav
 */

global.origamiApp.directive(
    'cmsSidenav',
    [
        'ServerConfig',
        (ServerConfig) => {
            return {
                templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/sidenav/sidenavDirective.html',
                restrict: 'A',
                link: (scope, el, attr) => {
                    scope.$on('$routeChangeStart', (e) => {
                        scope.$root.showMainNavMobileMenu = false;
                    });
                }
            }
        }
    ]
)
