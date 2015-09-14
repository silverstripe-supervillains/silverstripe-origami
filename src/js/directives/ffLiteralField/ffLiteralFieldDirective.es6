/**
 * Origami Literal Field Directive - Displays a literal field
 */

global.origamiApp.directive(
	'ffLiteralField',
	[
		'ServerConfig',
		'$sce',
		(ServerConfig, $sce) => {
			return {
				templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffLiteralField/ffLiteralFieldDirective.html',
				restrict: 'A',
				scope: {
					field: '=',
					top: '=topScope'
				},
				link: (scope, el, attr) => {
					var value = `${$sce.trustAsHtml(scope.field.value)}`,
						hidden = ['null'];

					scope.html = hidden.indexOf(value) === -1 ? value : '';
				}
			}
		}
	]
)
