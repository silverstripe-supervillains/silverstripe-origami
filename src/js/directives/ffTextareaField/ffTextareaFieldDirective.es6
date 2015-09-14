/**
 * Origami Textarea Field Directive - Displays a textarea field
 */

global.origamiApp.directive(
	'ffTextareaField',
	[
		'ServerConfig',
		(ServerConfig) => {
			return {
				templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffTextareaField/ffTextareaFieldDirective.html',
				restrict: 'A',
				scope: {
					field: '=',
					top: '=topScope'
				}
			}
		}
	]
)
