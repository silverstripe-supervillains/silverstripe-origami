/**
 * Origami Text Field Directive - Displays a text field
 */

global.origamiApp.directive(
	'ffTextField',
	[
		'ServerConfig',
		(ServerConfig) => {
			return {
				templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffTextField/ffTextFieldDirective.html',
				restrict: 'A',
				scope: {
					field: '=',
					top: '=topScope'
				}
			}
		}
	]
)
