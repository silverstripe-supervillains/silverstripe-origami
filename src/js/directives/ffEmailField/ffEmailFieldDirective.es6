/**
 * Origami Email Field Directive - Displays a text field with email validation
 */

global.origamiApp.directive(
	'ffEmailField',
	[
		'ServerConfig',
		(ServerConfig) => {
			return {
				templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffEmailField/ffEmailfieldDirective.html',
				restrict: 'A',
				scope: {
					field: '=',
					top: '=topScope'
				}
			}
		}
	]
)
