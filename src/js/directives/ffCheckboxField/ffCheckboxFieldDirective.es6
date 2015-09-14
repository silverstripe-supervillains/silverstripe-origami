/**
 * Origami Checkbox Field Directive - Displays a checkbox field
 */

global.origamiApp.directive(
	'ffCheckboxField',
	[
		'ServerConfig',
		(ServerConfig) => {
			return {
				templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffCheckboxField/ffCheckboxFieldDirective.html',
				restrict: 'A',
				scope: {
					field: '=',
					top: '=topScope'
				}
			}
		}
	]
)
