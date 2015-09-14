/**
 * Origami SiteTree Directive - Displays the sitetree, with live updates
 */

global.origamiApp.directive('sitetree', [
    '$compile',
    '$timeout',
    'Storage',
    'Socket',
    'ServerConfig',
    'lodash',
    ($compile, timeout, Storage, Socket, ServerConfig, _) => {

        /**
         * This handles merging partial or full sitetree changes with the initial
         * structure (or sets a new structure).
         *
         * @TODO: All the edge cases!
         * - On deletion: check that it doesn't maintain the existing on merge.
         * - Re-order/Parent change: children should be moved aswell, original tree should also update.
         */
        Socket.on('sitetree/structure', (newStructure) => {

            // merging the existing structure with the new structure
            var existingStructure = Storage.getSession('sitetree/structure');
            var mergedStructure = newStructure;

            if(existingStructure !== void 0) {
                var mergedStructure = angular.merge(existingStructure, newStructure);
            }

            Storage.setSession('sitetree/structure', mergedStructure);
        });

        return {
            templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/sitetree/sitetreeDirective.html',
            scope: true,
            restrict: 'E',
            link: (scope, el, attrs) => {
                
                // get existing sitetree/structure
                scope.structure = Storage.getSession('sitetree/structure');
                scope.loading = _.isEmpty(scope.structure);

                // bind a listener to sitetree/structure data change
                var removeStorageEvent = Storage.onSessionChange('sitetree/structure', (structure) => {
                    scope.structure = structure;
                    scope.loading = false;
                    buildSiteTree();
                });

                // remove storage event when directive is destroyed - prevent memory leak
                scope.$on('$destroy', () => {
                    removeStorageEvent();
                });

                var buildSiteTree = () => {
                    var sitetreeHolder = el.find('sitetree-items');

                    // clear current sitetree // TODO don't rebuild the whole thing on data change, only what changed
                    sitetreeHolder.html('');

                    _.forIn(scope.structure, (child, key) => {
                        sitetreeHolder.append(`<span><sitetree-item depth="0" item="structure[${key}]"></sitetree-item></span>`);
                    });

                    $compile(sitetreeHolder.contents())(scope);
                }

                timeout(() => {
                    buildSiteTree();
                });

            }
        }
    }
]);

global.origamiApp.directive('sitetreeItem', [
    '$compile',
    '$timeout',
    'ServerConfig',
    'lodash',
    ($compile, timeout, ServerConfig, _) => {
        return {
            templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/sitetree/sitetreeItemDirective.html',
            scope: {
                depth: '=',
                item: '='
            },
            restrict: 'E',
            link: (scope, el, attrs) => {

                scope.$watch('item.showChildren', (showChildren) => {
                    if (showChildren) {
                        timeout(() => {
                            buildSiteTree();
                        });
                    }
                });

                var buildSiteTree = () => {
                    var sitetreeHolder = el.find('sitetree-items');

                    // clear current sitetree // TODO don't rebuild the whole thing on data change, only what changed
                    sitetreeHolder.html('');

                    var keys = _.keys(scope.item.children);
                    var compileItem = (i = 0) => {
                        if (keys[i]) {
                            var key = keys[i];
                            var child = scope.item.children[key];
                            sitetreeHolder.append(`
                                <sitetree-item-${child.id}>
                                    <span class="sitetree__item"><sitetree-item depth="depth + 1" item="item.children[${key}]"></sitetree-item></span>
                                </sitetree-item-${child.id}>
                            `);
                            var itemHolder = sitetreeHolder.find(`sitetree-item-${child.id}`);
                            $compile(itemHolder.contents())(scope);

                            timeout(() => {
                                i++;
                                compileItem(i);
                            });
                        }

                    };
                    compileItem();

                    
                }


            }
        }
    }
]);
