/**
 * Origami Tab Directive - Displays a tab
 */

global.origamiApp.directive(
	'ffTab',
	[
		'ServerConfig',
		(ServerConfig) => {
			return {
				templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffTab/ffTabDirective.html',
				restrict: 'A',
				scope: {
					field: '=',
					top: '=topScope'
				}
			}
		}
	]
)
