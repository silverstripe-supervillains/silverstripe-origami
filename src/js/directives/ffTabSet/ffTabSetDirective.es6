/**
 * Origami Tab Set Directive - Displays a tab set
 */

global.origamiApp.directive(
	'ffTabSet',
	[
		'ServerConfig',
		(ServerConfig) => {
			return {
				templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffTabSet/ffTabsetDirective.html',
				restrict: 'A',
				scope: {
					field: '=',
					top: '=topScope'
				}
			}
		}
	]
)
