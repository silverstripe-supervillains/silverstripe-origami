/**
 * Origami CMS Action Bar Directive - Displays the CMS Action Bar
 *
 * @todo: tie into getCMSActions on SiteTree.php to get the actions.
 */

global.origamiApp.directive('cmsSidenavQueue', [
    'ServerConfig',
    'Storage',
    'Queue',
    (ServerConfig, Storage, Queue) => {
        return {
            templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/sidenavQueue/sidenavQueueDirective.html',
            restrict: 'A',
            scope: true,
            link: (scope, el, attr) => {
                scope.queue = Queue.getChanges();
                scope.queueIsEmpty = Queue.noChanges;
            }
        }
    }
]);
