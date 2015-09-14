/**
 * Origami Phone Number Field Directive
 * Displays a text field with number validation
 * TODO:
 * Phone number validation
 */

global.origamiApp.directive(
	'ffPhoneNumberField',
	[
		'ServerConfig',
		(ServerConfig) => {
			return {
				templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffPhoneNumberField/ffPhoneNumberFieldDirective.html',
				restrict: 'A',
				scope: {
					field: '=',
					top: '=topScope'
				}
			}
		}
	]
)
