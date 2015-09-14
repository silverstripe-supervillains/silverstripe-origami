/**
 * Origami Site Tree Urlsegment Field Directive
 * Displays a text field with auto update handling
 * when the user updates the Title field
 */

global.origamiApp.directive(
	'ffSiteTreeUrlsegmentField',
	[
		'ServerConfig',
		(ServerConfig) => {
			return {
				templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffSiteTreeUrlsegmentField/ffSiteTreeUrlsegmentFieldDirective.html',
				restrict: 'A',
				scope: {
					field: '=',
					top: '=topScope'
				}
			}
		}
	]
)
