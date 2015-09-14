/**
 * Origami CMS Header Directive - Displays the CMS Header
 */

global.origamiApp.directive(
    'cmsHeader',
    [
        'Storage',
        'ServerConfig',
        'Header',
        (Storage, ServerConfig, Header) => {
            return {
                templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/header/headerDirective.html',
                restrict: 'A',
                scope: true,
                link: (scope, el, attr) => {
                    // get existing userdata
                    scope.user = Storage.getSession('userdata');
                    scope.include = Header.getData();

                    // bind a listener to userdata data change
                    var removeUserDataEvent = Storage.onSessionChange('userdata', (user) => {
                        scope.user = user;
                    });

                    // remove storage event when directive is destroyed - prevent memory leak
                    scope.$on('$destroy', () => {
                        removeUserDataEvent();
                    });
                }
            }
        }
    ]
);
