/**
 * Origami Toggle Composite Field Directive
 * Displays a button and related set of fields that show/hide
 */

global.origamiApp.directive(
    'ffToggleCompositeField',
    [
    	'ServerConfig',
        (ServerConfig) => {
            return {
                templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffToggleCompositeField/ffToggleCompositeFieldDirective.html',
                restrict: 'A',
                scope: {
                    field: '=',
                    top: '=topScope'
                }
            }
        }
    ]
);
