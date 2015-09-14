/**
 * Origami CMS Action Bar Directive - Displays the CMS Action Bar
 *
 * @todo: tie into getCMSActions on SiteTree.php to get the actions.
 */

global.origamiApp.directive('cmsActionbar', [
    'Socket',
    'ServerConfig',
    (Socket, ServerConfig) => {
        return {
            templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/actionbar/actionbarDirective.html',
            restrict: 'A',
            scope: {
                top: '=topScope',
                actions: '='
            }
        }
    }
])
