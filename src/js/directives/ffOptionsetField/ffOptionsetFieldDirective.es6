/**
 * Origami Optionset Field Directive - Displays a set of radio fields
 */

global.origamiApp.directive(
	'ffOptionsetField',
	[
		'ServerConfig',
		(ServerConfig) => {
			return {
				templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffOptionsetField/ffOptionsetFieldDirective.html',
				restrict: 'A',
				scope: {
					field: '=',
					top: '=topScope'
				}
			}
		}
	]
)
