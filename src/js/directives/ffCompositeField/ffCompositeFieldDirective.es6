/**
 * Origami Tab Set Directive - Displays a tab set
 */

global.origamiApp.directive(
	'ffCompositeField',
	[
		'ServerConfig',
		(ServerConfig) => {
			return {
				templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffCompositeField/ffCompositeFieldDirective.html',
				restrict: 'A',
				scope: {
					field: '=',
                    top: '=topScope'
				}
			}
		}
	]
)
