/**
 * Origami Form Field Directive - Displays a form field based on type
 */

global.origamiApp.directive(
	'formField',
	[
		'$compile',
		($compile) => {
			return {
				restrict: 'A',
				scope: {
					field: '=',
					top: '=topScope'
				},
				link: (scope, el, attr) => {
					el.html(`<div ff-${scope.field.directiveName} field="field" top-scope="top"></div>`);
					$compile(el.contents())(scope);
				}
			}
		}
	]
)
