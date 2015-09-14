/**
 * Origami Form Action Directive - Displays a form action
 */

global.origamiApp.directive(
    'ffFormAction',
    [
        'Socket',
        'ServerConfig',
        '$routeParams',
        'Vent',
        'lodash',
        (Socket, ServerConfig, $routeParams, Vent, _) => {
            return {
                templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffFormAction/ffFormActionDirective.html',
                restrict: 'A',
                scope: {
                    field: '=',
                    top: '=topScope'
                },
                link: (scope, el, attr) => {

                    scope.onClick = (e) => {
                        if (_.isFunction(scope.field.handler)) {
                            scope.field.handler(e);
                        }
                        if (!scope.field.origamiOnly) {
                            var fields = scope.top.getChangedFields(),
                                action = e.currentTarget.getAttribute('data-action'),
                                pageId = $routeParams['pageId'];;

                            scope.top.emitOnQueue('editform/process', {
                                'pageId': pageId,
                                'action': action,
                                'fields': fields
                            }).then(
                                (response) => {
                                    var success = response.data.success,
                                        content = response.data.body;

                                    if(typeof content == 'string') {
                                        Vent.trigger('SystemMessage.set', {
                                            class: success ? 'alert-success' : 'alert-danger',
                                            content: content
                                        });
                                    }
                                },
                                (err) => {
                                    // this should handle an error thrown by `EditFormOrigamiApi::save()`
                                }
                            );
                        }
                    }
                }
            }
        }
    ]
)
