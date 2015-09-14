/**
 * Origami Hidden Field Directive - Displays a hidden field
 */

global.origamiApp.directive(
    'ffHiddenField',
    [
    	'ServerConfig',
        (ServerConfig) => {
            return {
                templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffHiddenField/ffHiddenFieldDirective.html',
                restrict: 'A',
                scope: {
                	field: '=',
                    top: '=topScope'
                }
            }
        }
    ]
)
