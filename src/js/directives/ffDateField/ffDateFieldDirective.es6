/**
 * Origami Date Field Directive - Displays a date field
 */

global.origamiApp.directive(
	'ffDateField',
	[
		'ServerConfig',
		(ServerConfig) => {
			return {
				templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffDateField/ffDateFieldDirective.html',
				restrict: 'A',
				scope: {
					field: '=',
					top: '=topScope'
				}
			}
		}
	]
)
