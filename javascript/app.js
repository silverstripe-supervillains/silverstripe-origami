(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/**
 * Origami Application File - The main entry point for Browserify
 */

'use strict';

global.origamiApp = angular.module('origami', ['ngRoute', 'ngSanitize', 'ngAnimate']);

require('./factories');
require('./directives');
require('./pages');

// configure
require('./appConfig.es6');

require('./handlers');

global.origamiApp.run(['$rootScope', 'ServerConfig', 'Socket', function ($rootScope, ServerConfig, Socket) {
    // would normally handle socket authentication here
    Socket.emit('user/login');

    $rootScope.config = ServerConfig;
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./appConfig.es6":2,"./directives":22,"./factories":28,"./handlers":35,"./pages":39}],2:[function(require,module,exports){
(function (global){
/**
 * Origami Application Configuration - Defines routing
 */

'use strict';

global.origamiApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider.when('/', {
        templateUrl: global.serverConfig.OrigamiDir + 'src/js/pages/home/homePage.html',
        controller: 'homePageCtrl'
    }).when('/edit/:pageId', {
        templateUrl: global.serverConfig.OrigamiDir + 'src/js/pages/edit/editPage.html',
        controller: 'editPageCtrl'
    }).otherwise({
        redirectTo: '/'
    });
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
/**
 * Origami CMS Action Bar Directive - Displays the CMS Action Bar
 *
 * @todo: tie into getCMSActions on SiteTree.php to get the actions.
 */

'use strict';

global.origamiApp.directive('cmsActionbar', ['Socket', 'ServerConfig', function (Socket, ServerConfig) {
    return {
        templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/actionbar/actionbarDirective.html',
        restrict: 'A',
        scope: {
            top: '=topScope',
            actions: '='
        }
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (global){
/**
 * Origami Checkbox Field Directive - Displays a checkbox field
 */

'use strict';

global.origamiApp.directive('ffCheckboxField', ['ServerConfig', function (ServerConfig) {
	return {
		templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffCheckboxField/ffCheckboxFieldDirective.html',
		restrict: 'A',
		scope: {
			field: '=',
			top: '=topScope'
		}
	};
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
/**
 * Origami Tab Set Directive - Displays a tab set
 */

'use strict';

global.origamiApp.directive('ffCompositeField', ['ServerConfig', function (ServerConfig) {
	return {
		templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffCompositeField/ffCompositeFieldDirective.html',
		restrict: 'A',
		scope: {
			field: '=',
			top: '=topScope'
		}
	};
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
/**
 * Origami Date Field Directive - Displays a date field
 */

'use strict';

global.origamiApp.directive('ffDateField', ['ServerConfig', function (ServerConfig) {
	return {
		templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffDateField/ffDateFieldDirective.html',
		restrict: 'A',
		scope: {
			field: '=',
			top: '=topScope'
		}
	};
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
(function (global){
/**
 * Origami Email Field Directive - Displays a text field with email validation
 */

'use strict';

global.origamiApp.directive('ffEmailField', ['ServerConfig', function (ServerConfig) {
	return {
		templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffEmailField/ffEmailfieldDirective.html',
		restrict: 'A',
		scope: {
			field: '=',
			top: '=topScope'
		}
	};
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
(function (global){
/**
 * Origami Form Action Directive - Displays a form action
 */

'use strict';

global.origamiApp.directive('ffFormAction', ['Socket', 'ServerConfig', '$routeParams', 'Vent', 'lodash', function (Socket, ServerConfig, $routeParams, Vent, _) {
    return {
        templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffFormAction/ffFormActionDirective.html',
        restrict: 'A',
        scope: {
            field: '=',
            top: '=topScope'
        },
        link: function link(scope, el, attr) {

            scope.onClick = function (e) {
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
                    }).then(function (response) {
                        var success = response.data.success,
                            content = response.data.body;

                        if (typeof content == 'string') {
                            Vent.trigger('SystemMessage.set', {
                                'class': success ? 'alert-success' : 'alert-danger',
                                content: content
                            });
                        }
                    }, function (err) {
                        // this should handle an error thrown by `EditFormOrigamiApi::save()`
                    });
                }
            };
        }
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
(function (global){
/**
 * Origami Hidden Field Directive - Displays a hidden field
 */

'use strict';

global.origamiApp.directive('ffHiddenField', ['ServerConfig', function (ServerConfig) {
    return {
        templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffHiddenField/ffHiddenFieldDirective.html',
        restrict: 'A',
        scope: {
            field: '=',
            top: '=topScope'
        }
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
(function (global){
/**
 * Origami HTML Editor Field Directive
 * Displays a WYSIWYG editor
 */

'use strict';

global.origamiApp.directive('ffHtmlEditorField', ['ServerConfig', '$timeout', function (ServerConfig, timeout) {
    return {
        templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffHtmlEditorField/ffHtmlEditorFieldDirective.html',
        restrict: 'A',
        scope: {
            field: '=',
            top: '=topScope'
        },
        link: function link(scope, el, attr) {
            var editor;

            var saveToScope = function saveToScope() {
                // saves the contents of tinymce into the textarea it is applied to
                editor.save();

                var content = editor.getContent().trim();

                scope.field.value = content;

                if (!scope.$root.$$phase) {
                    scope.$apply();
                }
            };

            var options = {
                selector: '[tinymce-init]',
                setup: function setup(ed) {
                    // setup access to editor
                    editor = ed;

                    // handle all the following events in tinymce to update scope
                    editor.on('change', function (e) {
                        saveToScope();
                    });

                    editor.on('undo', function (e) {
                        saveToScope();
                    });

                    editor.on('redo', function (e) {
                        saveToScope();
                    });

                    editor.on('blur', function (e) {
                        saveToScope();
                    });

                    editor.on('ObjectResized', function (e) {
                        saveToScope();
                    });

                    editor.on('ExecCommand', function (e) {
                        saveToScope();
                    });

                    // remove element if tinymce removed
                    editor.on('remove', function (e) {
                        el.remove();
                    });
                },
                plugins: "paste"
            };

            tinymce.init(options);

            scope.$watch('field.value', function (newVal, oldVal) {
                // need to add this as tinymce does not play nice with initial values and
                if (editor.getDoc() != void 0 && newVal != void 0) {
                    if (newVal !== editor.getContent().trim()) {
                        editor.setContent(newVal);
                    }
                }
            });
        }
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
(function (global){
/**
 * Origami Literal Field Directive - Displays a literal field
 */

'use strict';

global.origamiApp.directive('ffLiteralField', ['ServerConfig', '$sce', function (ServerConfig, $sce) {
	return {
		templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffLiteralField/ffLiteralFieldDirective.html',
		restrict: 'A',
		scope: {
			field: '=',
			top: '=topScope'
		},
		link: function link(scope, el, attr) {
			var value = '' + $sce.trustAsHtml(scope.field.value),
			    hidden = ['null'];

			scope.html = hidden.indexOf(value) === -1 ? value : '';
		}
	};
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
(function (global){
/**
 * Origami Optionset Field Directive - Displays a set of radio fields
 */

'use strict';

global.origamiApp.directive('ffOptionsetField', ['ServerConfig', function (ServerConfig) {
	return {
		templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffOptionsetField/ffOptionsetFieldDirective.html',
		restrict: 'A',
		scope: {
			field: '=',
			top: '=topScope'
		}
	};
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
(function (global){
/**
 * Origami Phone Number Field Directive
 * Displays a text field with number validation
 * TODO:
 * Phone number validation
 */

'use strict';

global.origamiApp.directive('ffPhoneNumberField', ['ServerConfig', function (ServerConfig) {
	return {
		templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffPhoneNumberField/ffPhoneNumberFieldDirective.html',
		restrict: 'A',
		scope: {
			field: '=',
			top: '=topScope'
		}
	};
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],14:[function(require,module,exports){
(function (global){
/**
 * Origami Site Tree Urlsegment Field Directive
 * Displays a text field with auto update handling
 * when the user updates the Title field
 */

'use strict';

global.origamiApp.directive('ffSiteTreeUrlsegmentField', ['ServerConfig', function (ServerConfig) {
	return {
		templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffSiteTreeUrlsegmentField/ffSiteTreeUrlsegmentFieldDirective.html',
		restrict: 'A',
		scope: {
			field: '=',
			top: '=topScope'
		}
	};
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],15:[function(require,module,exports){
(function (global){
/**
 * Origami Tab Directive - Displays a tab
 */

'use strict';

global.origamiApp.directive('ffTab', ['ServerConfig', function (ServerConfig) {
	return {
		templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffTab/ffTabDirective.html',
		restrict: 'A',
		scope: {
			field: '=',
			top: '=topScope'
		}
	};
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],16:[function(require,module,exports){
(function (global){
/**
 * Origami Tab Set Directive - Displays a tab set
 */

'use strict';

global.origamiApp.directive('ffTabSet', ['ServerConfig', function (ServerConfig) {
	return {
		templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffTabSet/ffTabsetDirective.html',
		restrict: 'A',
		scope: {
			field: '=',
			top: '=topScope'
		}
	};
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],17:[function(require,module,exports){
(function (global){
/**
 * Origami Text Field Directive - Displays a text field
 */

'use strict';

global.origamiApp.directive('ffTextField', ['ServerConfig', function (ServerConfig) {
	return {
		templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffTextField/ffTextFieldDirective.html',
		restrict: 'A',
		scope: {
			field: '=',
			top: '=topScope'
		}
	};
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],18:[function(require,module,exports){
(function (global){
/**
 * Origami Textarea Field Directive - Displays a textarea field
 */

'use strict';

global.origamiApp.directive('ffTextareaField', ['ServerConfig', function (ServerConfig) {
	return {
		templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffTextareaField/ffTextareaFieldDirective.html',
		restrict: 'A',
		scope: {
			field: '=',
			top: '=topScope'
		}
	};
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],19:[function(require,module,exports){
(function (global){
/**
 * Origami Toggle Composite Field Directive
 * Displays a button and related set of fields that show/hide
 */

'use strict';

global.origamiApp.directive('ffToggleCompositeField', ['ServerConfig', function (ServerConfig) {
    return {
        templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffToggleCompositeField/ffToggleCompositeFieldDirective.html',
        restrict: 'A',
        scope: {
            field: '=',
            top: '=topScope'
        }
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],20:[function(require,module,exports){
(function (global){
/**
 * Origami Form Field Directive - Displays a form field based on type
 */

'use strict';

global.origamiApp.directive('formField', ['$compile', function ($compile) {
	return {
		restrict: 'A',
		scope: {
			field: '=',
			top: '=topScope'
		},
		link: function link(scope, el, attr) {
			el.html('<div ff-' + scope.field.directiveName + ' field="field" top-scope="top"></div>');
			$compile(el.contents())(scope);
		}
	};
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],21:[function(require,module,exports){
(function (global){
/**
 * Origami CMS Header Directive - Displays the CMS Header
 */

'use strict';

global.origamiApp.directive('cmsHeader', ['Storage', 'ServerConfig', 'Header', function (Storage, ServerConfig, Header) {
    return {
        templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/header/headerDirective.html',
        restrict: 'A',
        scope: true,
        link: function link(scope, el, attr) {
            // get existing userdata
            scope.user = Storage.getSession('userdata');
            scope.include = Header.getData();

            // bind a listener to userdata data change
            var removeUserDataEvent = Storage.onSessionChange('userdata', function (user) {
                scope.user = user;
            });

            // remove storage event when directive is destroyed - prevent memory leak
            scope.$on('$destroy', function () {
                removeUserDataEvent();
            });
        }
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],22:[function(require,module,exports){
'use strict';

require('./header/headerDirective.es6');
require('./notification/notificationDirective.es6');
require('./sidenav/sidenavDirective.es6');
require('./sidenavQueue/sidenavQueueDirective.es6');
require('./sitetree/sitetreeDirective.es6');
require('./actionbar/actionbarDirective.es6');

require('./formField/formFieldDirective.es6');
require('./ffTabSet/ffTabSetDirective.es6');
require('./ffTab/ffTabDirective.es6');
require('./ffTextField/ffTextFieldDirective.es6');
require('./ffTextareaField/ffTextareaFieldDirective.es6');
require('./ffEmailField/ffEmailFieldDirective.es6');
require('./ffDateField/ffDateFieldDirective.es6');
require('./ffCheckboxField/ffCheckboxFieldDirective.es6');
require('./ffOptionsetField/ffOptionsetFieldDirective.es6');
require('./ffLiteralField/ffLiteralFieldDirective.es6');
require('./ffSiteTreeUrlsegmentField/ffSiteTreeUrlsegmentFieldDirective.es6');
require('./ffHtmlEditorField/ffHtmlEditorFieldDirective.es6');
require('./ffFormAction/ffFormActionDirective.es6');
require('./ffCompositeField/ffCompositeFieldDirective.es6');
require('./ffToggleCompositeField/ffToggleCompositeFieldDirective.es6');
require('./ffPhoneNumberField/ffPhoneNumberFieldDirective.es6');
require('./ffHiddenField/ffHiddenFieldDirective.es6');

},{"./actionbar/actionbarDirective.es6":3,"./ffCheckboxField/ffCheckboxFieldDirective.es6":4,"./ffCompositeField/ffCompositeFieldDirective.es6":5,"./ffDateField/ffDateFieldDirective.es6":6,"./ffEmailField/ffEmailFieldDirective.es6":7,"./ffFormAction/ffFormActionDirective.es6":8,"./ffHiddenField/ffHiddenFieldDirective.es6":9,"./ffHtmlEditorField/ffHtmlEditorFieldDirective.es6":10,"./ffLiteralField/ffLiteralFieldDirective.es6":11,"./ffOptionsetField/ffOptionsetFieldDirective.es6":12,"./ffPhoneNumberField/ffPhoneNumberFieldDirective.es6":13,"./ffSiteTreeUrlsegmentField/ffSiteTreeUrlsegmentFieldDirective.es6":14,"./ffTab/ffTabDirective.es6":15,"./ffTabSet/ffTabSetDirective.es6":16,"./ffTextField/ffTextFieldDirective.es6":17,"./ffTextareaField/ffTextareaFieldDirective.es6":18,"./ffToggleCompositeField/ffToggleCompositeFieldDirective.es6":19,"./formField/formFieldDirective.es6":20,"./header/headerDirective.es6":21,"./notification/notificationDirective.es6":23,"./sidenav/sidenavDirective.es6":24,"./sidenavQueue/sidenavQueueDirective.es6":25,"./sitetree/sitetreeDirective.es6":26}],23:[function(require,module,exports){
(function (global){
/**
 * Origami CMS Header Directive - Displays the CMS Header
 */

'use strict';

global.origamiApp.directive('notification', ['ServerConfig', 'Vent', function (ServerConfig, Vent) {
  return {
    templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/notification/notificationDirective.html',
    restrict: 'A',
    scope: true,
    link: function link(scope, el, attr) {
      /**
      * Set a message to the scope of the page controller so it can be rendered on the template.
      *
      * Example:
      * {
      *     class: String // Optional: The bootstrap class for displaying the message.
      *     content: String // Text to display in the message.
      *     timeout: Int // Optional: timeout in milliseconds, when the message will be removed.
      * }
      */

      var removeVentListener = Vent.on('SystemMessage.set', function (e, args) {
        var messageClass = args['class'] !== void 0 ? args['class'] : 'alert-danger',
            timeout = args.timeout !== void 0 ? args.timeout : 8000;

        // set the message
        scope.message = {
          'class': messageClass,
          content: args.content
        };

        // to force update when not running $digest automatically
        if (!scope.$root.$$phase) {
          scope.$apply();
        }

        // remove the message after X seconds
        setTimeout(function () {
          scope.$apply(function () {
            delete scope.message;
          });
        }, timeout);
      });

      scope.$on('$destroy', function () {
        removeVentListener();
      });
    }
  };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],24:[function(require,module,exports){
(function (global){
/**
 * Origami CMS Sidenav Directive - Displays the CMS Sidenav
 */

'use strict';

global.origamiApp.directive('cmsSidenav', ['ServerConfig', function (ServerConfig) {
    return {
        templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/sidenav/sidenavDirective.html',
        restrict: 'A',
        link: function link(scope, el, attr) {
            scope.$on('$routeChangeStart', function (e) {
                scope.$root.showMainNavMobileMenu = false;
            });
        }
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],25:[function(require,module,exports){
(function (global){
/**
 * Origami CMS Action Bar Directive - Displays the CMS Action Bar
 *
 * @todo: tie into getCMSActions on SiteTree.php to get the actions.
 */

'use strict';

global.origamiApp.directive('cmsSidenavQueue', ['ServerConfig', 'Storage', 'Queue', function (ServerConfig, Storage, Queue) {
    return {
        templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/sidenavQueue/sidenavQueueDirective.html',
        restrict: 'A',
        scope: true,
        link: function link(scope, el, attr) {
            scope.queue = Queue.getChanges();
            scope.queueIsEmpty = Queue.noChanges;
        }
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],26:[function(require,module,exports){
(function (global){
/**
 * Origami SiteTree Directive - Displays the sitetree, with live updates
 */

'use strict';

global.origamiApp.directive('sitetree', ['$compile', '$timeout', 'Storage', 'Socket', 'ServerConfig', 'lodash', function ($compile, timeout, Storage, Socket, ServerConfig, _) {

    /**
     * This handles merging partial or full sitetree changes with the initial
     * structure (or sets a new structure).
     *
     * @TODO: All the edge cases!
     * - On deletion: check that it doesn't maintain the existing on merge.
     * - Re-order/Parent change: children should be moved aswell, original tree should also update.
     */
    Socket.on('sitetree/structure', function (newStructure) {

        // merging the existing structure with the new structure
        var existingStructure = Storage.getSession('sitetree/structure');
        var mergedStructure = newStructure;

        if (existingStructure !== void 0) {
            var mergedStructure = angular.merge(existingStructure, newStructure);
        }

        Storage.setSession('sitetree/structure', mergedStructure);
    });

    return {
        templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/sitetree/sitetreeDirective.html',
        scope: true,
        restrict: 'E',
        link: function link(scope, el, attrs) {

            // get existing sitetree/structure
            scope.structure = Storage.getSession('sitetree/structure');
            scope.loading = _.isEmpty(scope.structure);

            // bind a listener to sitetree/structure data change
            var removeStorageEvent = Storage.onSessionChange('sitetree/structure', function (structure) {
                scope.structure = structure;
                scope.loading = false;
                buildSiteTree();
            });

            // remove storage event when directive is destroyed - prevent memory leak
            scope.$on('$destroy', function () {
                removeStorageEvent();
            });

            var buildSiteTree = function buildSiteTree() {
                var sitetreeHolder = el.find('sitetree-items');

                // clear current sitetree // TODO don't rebuild the whole thing on data change, only what changed
                sitetreeHolder.html('');

                _.forIn(scope.structure, function (child, key) {
                    sitetreeHolder.append('<span><sitetree-item depth="0" item="structure[' + key + ']"></sitetree-item></span>');
                });

                $compile(sitetreeHolder.contents())(scope);
            };

            timeout(function () {
                buildSiteTree();
            });
        }
    };
}]);

global.origamiApp.directive('sitetreeItem', ['$compile', '$timeout', 'ServerConfig', 'lodash', function ($compile, timeout, ServerConfig, _) {
    return {
        templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/sitetree/sitetreeItemDirective.html',
        scope: {
            depth: '=',
            item: '='
        },
        restrict: 'E',
        link: function link(scope, el, attrs) {

            scope.$watch('item.showChildren', function (showChildren) {
                if (showChildren) {
                    timeout(function () {
                        buildSiteTree();
                    });
                }
            });

            var buildSiteTree = function buildSiteTree() {
                var sitetreeHolder = el.find('sitetree-items');

                // clear current sitetree // TODO don't rebuild the whole thing on data change, only what changed
                sitetreeHolder.html('');

                var keys = _.keys(scope.item.children);
                var compileItem = function compileItem() {
                    var i = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

                    if (keys[i]) {
                        var key = keys[i];
                        var child = scope.item.children[key];
                        sitetreeHolder.append('\n                                <sitetree-item-' + child.id + '>\n                                    <span class="sitetree__item"><sitetree-item depth="depth + 1" item="item.children[' + key + ']"></sitetree-item></span>\n                                </sitetree-item-' + child.id + '>\n                            ');
                        var itemHolder = sitetreeHolder.find('sitetree-item-' + child.id);
                        $compile(itemHolder.contents())(scope);

                        timeout(function () {
                            i++;
                            compileItem(i);
                        });
                    }
                };
                compileItem();
            };
        }
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],27:[function(require,module,exports){
(function (global){
/**
 * Origami Header Factory - Control Origami's header from anywhere
 */

'use strict';

global.origamiApp.factory('Header', [function () {
    var headerData = {};

    return {
        render: function render(template, scope, showUserDividerExpression) {
            headerData.template = template;
            headerData.scope = scope;
            headerData.showUserDividerExpression = showUserDividerExpression;
        },
        clear: function clear() {
            headerData.template = void 0;
            headerData.scope = void 0;
        },
        getData: function getData() {
            return headerData;
        }
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],28:[function(require,module,exports){
'use strict';

require('./lodashFactory.es6');
require('./serverConfigFactory.es6');
require('./socketFactory.es6');
require('./storageFactory.es6');
require('./ventFactory.es6');
require('./queueFactory.es6');
require('./headerFactory.es6');

},{"./headerFactory.es6":27,"./lodashFactory.es6":29,"./queueFactory.es6":30,"./serverConfigFactory.es6":31,"./socketFactory.es6":32,"./storageFactory.es6":33,"./ventFactory.es6":34}],29:[function(require,module,exports){
(function (global){
/**
 * Origami lodash Factory - Make lodash an available dependancy
 */

'use strict';

global.origamiApp.factory('lodash', [function () {
    return global.lodash;
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],30:[function(require,module,exports){
(function (global){
/**
 * Origami Queue Factory. Handles Socket.emit()s (with register.emit()) that update state, and caches changed page data until page is saved.
 */

'use strict';

global.origamiApp.factory('Queue', ['$rootScope', '$cacheFactory', '$timeout', '$q', 'Socket', 'lodash', function ($rootScope, $cacheFactory, timeout, q, Socket, _) {
    var unchangedPages = {},
        // queue rendering data for unchanged, active pages
    changedPages = {},
        // queue rendering data for changed pages
    registrations = {}; // registration data against page

    var register = function register(id, link, scope, titleExpression, typeExpression, getCache) {
        var stateData,
            states,
            cache,
            moveToUnchangedPages,
            moveToChangedPages,
            emit,
            message = {},
            states = {
            unchanged: 'unchanged',
            changed: 'changed',
            processing: 'processing',
            failure: 'failure',
            success: 'success'
        };

        // get the cache unique to this page.
        cache = $cacheFactory.get('queueCache-' + id);
        if (!cache) {
            cache = $cacheFactory('queueCache-' + id);
        }

        // if we haven't registered this page already, build a new registration for it.
        if (!registrations[id]) {

            stateData = $rootScope.$new();

            stateData.value = cache.get('statusCache') || states.unchanged;

            // when the host scope is destroyed
            scope.$on('$destroy', function () {
                // when the state is unchanged, destroy the registration
                if (stateData.value == states.unchanged) {
                    delete registrations[id];
                    delete unchangedPages[id];
                    delete changedPages[id];
                    stateData.$destroy();
                    cache.destroy();
                    message = {};
                    // if it is changed, cache the things
                } else {
                        cache.put('controllerCache', getCache());
                        cache.put('statusCache', stateData);
                    }
            });

            // add to unchangedPages
            unchangedPages[id] = {
                scope: scope,
                state: stateData,
                link: link,
                titleExpression: titleExpression,
                typeExpression: typeExpression
            };

            // respond to state changes
            stateData.$watch('value', function (newStatus, oldStatus) {
                if (newStatus != oldStatus) {
                    // handle success
                    switch (newStatus) {
                        case states.changed:
                            moveToChangedPages();
                            break;
                        case states.unchanged:
                            moveToUnchangedPages();
                            break;
                        // success is reset after 1 second
                        case states.success:
                            timeout(function () {
                                stateData.value = 'unchanged';
                            }, 1000);
                            break;
                    }
                }
            });

            moveToChangedPages = function () {
                if (unchangedPages[id]) {
                    changedPages[id] = unchangedPages[id];
                    delete unchangedPages[id];
                }
            };

            moveToUnchangedPages = function () {
                if (changedPages[id]) {
                    unchangedPages[id] = changedPages[id];
                    delete changedPages[id];
                }
            };

            emit = function (channel, message) {
                var deferred = q.defer();

                stateData.value = 'processing';

                Socket.emit(channel, message).then(function (response) {
                    message = {
                        'class': 'alert-success',
                        message: response.data.body
                    };
                    stateData.value = 'success';
                    deferred.resolve(response);
                }, function (err) {
                    message = {
                        'class': 'alert-danger',
                        message: err.data.body || err.data
                    };
                    stateData.value = 'failure';
                    deferred.reject(err);
                });
                return deferred.promise;
            };

            registrations[id] = {
                stateData: stateData,
                emit: emit,
                cache: {},
                message: {}
            };
        }

        // return these fresh every time, even if there is an existing registration
        registrations[id].cache = cache.get('controllerCache');
        registrations[id].message = message;

        return registrations[id];
    };

    return {
        register: register,
        getChanges: function getChanges(pageId) {
            if (pageId != void 0) {
                return changedPages[pageId];
            }
            return changedPages;
        },
        noChanges: function noChanges() {
            return _.isEmpty(changedPages);
        }
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],31:[function(require,module,exports){
(function (global){
/**
 * Origami ServerConfig Factory - Make ServerConfig an available dependancy
 */

'use strict';

global.origamiApp.factory('ServerConfig', [function () {
    return window.serverConfig;
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],32:[function(require,module,exports){
(function (global){
/**
 * Origami Socket Factory - Talks to the SilverStripe CMS over WebSockets
 */

'use strict';

global.origamiApp.factory('Socket', ['ServerConfig', 'Vent', '$http', '$q', function (ServerConfig, Vent, http, q) {

    var _data = {
        conn: {},
        socketId: null,
        connected: false,
        channelListeners: {}, // holds handlers for each channel registered
        queue: [] // holds handlers for each channel registered
    };

    // connect websocket and bind handlers
    var connect = function connect(websocketServerLocation) {
        Vent.trigger('Socket:connecting');
        _data.conn = new WebSocket(websocketServerLocation);

        // no default onopen behaviour needed
        _data.conn.onopen = function (e) {
            // connection established
        };

        _data.conn.onmessage = function (e) {
            var body = {},
                data = JSON.parse(e.data);

            // if body is JSON, parse it
            try {
                body = JSON.parse(data.body);
            } catch (e) {
                body = data.body;
            }

            // if this is the onopen message with a socketId, then we're connected
            if (data.channel === 'onopen') {
                if (data.socketId) {
                    _data.connected = true;
                    _data.socketId = data.socketId;
                    processQueue();
                    Vent.trigger('Socket:connected');
                }
                // otherwise handle as a message
            } else {
                    if (_data.channelListeners[data.channel]) {
                        _data.channelListeners[data.channel].forEach(function (handler) {
                            handler(body);
                        });
                    }
                }
        };

        // when the socket closes, register the close
        _data.conn.onclose = function () {
            _data.connected = false;
            _data.socketId = null;
            Vent.trigger('Socket:disconnected');
            //try to reconnect in 5 seconds
            setTimeout(function () {
                Vent.trigger('Socket:reconnecting');
                connect(websocketServerLocation);
            }, 5000);
        };
    };

    connect('ws://localhost:8080');

    var addToQueue = function addToQueue(channel, message) {
        var deferred = q.defer();
        _data.queue.push({
            channel: channel,
            message: message,
            deferred: deferred
        });
        return deferred.promise;
    };

    var processQueue = function processQueue() {
        _data.queue.forEach(function (itemData, i) {
            emitMessage(itemData.channel, itemData.message).then(function (response) {
                itemData.deferred.resolve(response);
            }, function (err) {
                itemData.deferred.reject(err);
            });
            _data.queue.splice(i, 1);
        });
    };

    var emitMessage = function emitMessage(channel, message) {
        if (_data.socketId && _data.connected) {
            var deferred = q.defer(),
                envelope = {
                'channel': channel,
                'body': message,
                'socketId': _data.socketId
            };

            http.post(ServerConfig.BaseHref + '/' + ServerConfig.WebSocket.endpoint + channel, envelope).then(function (resp) {
                if ((resp.data.hasOwnProperty('success') && resp.data.success === 1 || !resp.data.hasOwnProperty('success')) && resp.status === 200) {
                    deferred.resolve(resp);
                } else {
                    displayErrorNotification(resp);
                    deferred.reject(resp);
                }
            }, function (err) {
                displayErrorNotification(err);
                deferred.reject(err);
            });

            return deferred.promise;
        } else {
            // if emit fails because of disconnect, register in queue and return promise.
            return addToQueue(channel, message);
        }
    };

    var displayErrorNotification = function displayErrorNotification(err) {
        var content = err.data;

        if (typeof content == 'string') {
            Vent.trigger('SystemMessage.set', {
                'class': 'alert-danger',
                content: content
            });
        }
    };

    var onMessage = function onMessage(channel, handler) {
        if (typeof channel == 'string' && handler instanceof Function) {
            if (!_data.channelListeners[channel]) {
                _data.channelListeners[channel] = [];
            }
            _data.channelListeners[channel].push(handler);
        }
    };

    return {
        _data: _data,
        emit: emitMessage,
        on: onMessage
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],33:[function(require,module,exports){
(function (global){
/**
 * Origami Storage Factory - Manages event driven global storage - LocalStorage and in memory storage.
 *
    if used inside of a page or a directive, please destroy
    the listener when the entity is:

        var removeStorageListener = Storage.onLocal(<< brevity >>);

        scope.$on('$destroy', () => {
            removeStorageListener();
        });
 */
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

global.origamiApp.factory('Storage', ['$rootScope', function ($rootScope) {

    var events = {
        localStorage: {},
        sessionStorage: {}
    }; //event store

    global.addEventListener('storage', function (e) {
        var _e$originalEvent = _slicedToArray(e.originalEvent, 2);

        name = _e$originalEvent[0];
        value = _e$originalEvent[1];

        emitStorageChange('localStorage', name, value);
    });

    var emitStorageChange = function emitStorageChange(medium, name, value) {
        var value = JSON.parse(value);
        $rootScope.$apply(function () {
            for (var handlerKey in events[medium][name]) {
                events[medium][name][handlerKey](value);
            }
        });
    };

    var get = function get(medium, name) {
        try {
            return JSON.parse(global[medium][name]);
        } catch (e) {
            return undefined;
        }
    };

    var set = function set(medium, name, value) {
        if (value == undefined && global[medium][name]) {
            global[medium].removeItem(name);
        } else if (global[medium][name] !== value) {
            value = JSON.stringify(value);
            global[medium][name] = value;
        }

        emitStorageChange(medium, name, value);

        return true;
    };

    var onChange = function onChange(medium, name, handler) {
        //bind new event, return unbind function
        if (!events[medium][name]) {
            events[medium][name] = [];
        }
        events[medium][name].push(handler);
        return function () {
            // remove handler
            events[medium][name].splice(events[medium][name].indexOf(handler), 1);
        };
    };

    return {
        getLocal: function getLocal(name) {
            return get('localStorage', name);
        },
        setLocal: function setLocal(name, value) {
            return set('localStorage', name, value);
        },
        onLocalChange: function onLocalChange(name, handler) {
            return onChange('localStorage', name, handler);
        },

        getSession: function getSession(name) {
            return get('sessionStorage', name);
        },
        setSession: function setSession(name, value) {
            return set('sessionStorage', name, value);
        },
        onSessionChange: function onSessionChange(name, handler) {
            return onChange('sessionStorage', name, handler);
        }
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],34:[function(require,module,exports){
(function (global){
/*
 * Origami Vent Factory - Provides a common event bus throughout the app
 *
    if used inside of a page or a directive, please destroy
    the listener when the entity is:

        var removeVentListener = Vent.on(<< brevity >>);

        scope.$on('$destroy', () => {
            removeVentListener();
        });
 */

'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

global.origamiApp.factory('Vent', ['$rootScope', function ($rootScope) {
    return {
        on: function on(eventName, handler) {
            return $rootScope.$on(eventName, handler);
        },
        trigger: function trigger(eventName) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            if (!args) {
                args = [];
            }
            $rootScope.$broadcast.apply($rootScope, [eventName].concat(_toConsumableArray(args)));
        }
    };
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],35:[function(require,module,exports){
'use strict';

require('./userDataHandler.es6');

},{"./userDataHandler.es6":36}],36:[function(require,module,exports){
(function (global){
/**
 * Origami User Data Handler
 */

'use strict';

global.origamiApp.run(['Socket', 'Storage', function (Socket, Storage) {
    Socket.on('userdata', function (data) {
        Storage.setSession('userdata', data);
    });
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],37:[function(require,module,exports){
(function (global){
/**
 * Origami Page Edit Controller
 *
 * @requires module:angular-sanitize
 */

'use strict';

global.origamiApp.controller('editPageCtrl', ['$scope', 'Queue', 'Header', 'Socket', 'ServerConfig', 'Vent', '$routeParams', 'lodash', '$location', function (scope, Queue, Header, Socket, ServerConfig, Vent, $routeParams, _, $location) {
    var id,
        queue,
        fieldsCache = [],
        changedFields = [];

    id = $routeParams['pageId'];

    scope.loading = false;
    scope.id = id;

    scope.fields = [];
    scope.actions = [];
    scope.users = [];
    scope.breadcrumbs = [];

    Header.render(ServerConfig.OrigamiDir + 'src/js/pages/edit/editPageHeaderInclude.html', scope, 'users.length');

    var getCache = function getCache() {
        return {
            fieldsCache: fieldsCache,
            fields: scope.fields,
            actions: scope.actions
        };
    };

    queue = Queue.register('editpage-' + id, $location.absUrl(), scope, 'fields.Root.children.Root_Main.children.Title.value', 'classname', // TODO make this point to something real
    getCache);

    scope.state = queue.stateData;
    scope.emitOnQueue = queue.emit;

    /**
     * Get changeFields. Do it with a function to prevent scope digest from getting into it; perf.
     */
    scope.getChangedFields = function () {
        return changedFields;
    };

    /**
     * Called on page load to handle if other users joining page
     */
    Socket.on('editform/view', function (data) {
        var users = [],
            scopeUsers = [];

        angular.forEach(data.Members, function (value, key) {
            users.push(value.firstname);
            scopeUsers.push(value);
        });

        var pluralization = users.length > 1 ? 'are' : 'is',
            content = users.join(', ') + ' ' + pluralization + ' now viewing this page.';

        Vent.trigger('SystemMessage.set', {
            'class': 'alert-info',
            content: content
        });

        // override the whole array to prevent pushing same user in twice
        scope.users = scopeUsers;
    });

    /**
     * Listen for users leaving the page
     */
    Socket.on('editform/leave', function (data) {
        var memberId = data.MemberID,
            content = data.MemberFirstName + ' has left the page.';

        Vent.trigger('SystemMessage.set', {
            'class': 'alert-info',
            content: content
        });

        // remove user from list
        _.remove(scope.users, function (user) {
            return user.id === memberId;
        });
    });

    /**
     * Add action handlers for the front end
     *  - Set handlers here so they work in the current scope, even after applying the cache
     *
     * Origami specific field attributes:
     *  - field.showProcessingSpinner - will show a spinner when state.value === 'processing'
     *  - field.origamiOnly - will prevent origami from submitting the page
     *  - field.handler - will run before submitting the page for processing
     */
    var addActionHandlers = function addActionHandlers() {
        var noChangeDisable = function noChangeDisable() {
            return scope.state.value === 'unchanged';
        };
        if (scope.actions[''] != void 0) {
            var children = scope.actions[''].children;
            if (children.action_origami_reset != void 0) {
                children.action_origami_reset.handler = function (e) {
                    resetForm();
                };
                children.action_origami_reset.isDisabled = noChangeDisable;
            }
            if (children.action_save != void 0) {
                children.action_save.isDisabled = noChangeDisable;
                children.action_save.showProcessingSpinner = true;
            }
        }
    };

    /**
     * transform action fields for the frontend
     */
    var transformActionFields = function transformActionFields(actions) {
        _.forIn(actions, function (action, key) {
            // delve into the children ( ͡° ͜ʖ ͡°)
            if (_.isObject(action.children)) {
                transformActionFields(action.children);
                // transform the actions
                // - Adding a isDisabled to the action will disable the action when returning true. Be careful, these are expensive to call.
            } else {

                    // if this is an origami action, don't hit the server with it
                    if (action.name.match(/^action_origami/)) {
                        action.origamiOnly = true;
                    }
                }
        });
        return actions;
    };

    /**
     * Load page
     */
    // if cached, use cache
    if (queue.cache) {
        fieldsCache = queue.cache.fieldsCache;
        scope.fields = queue.cache.fields;
        scope.actions = queue.cache.actions;
        scope.breadcrumbs = queue.cache.breadcrumbs;
        addActionHandlers();
        // if not cached, call from server
    } else {
            scope.loading = true;
            Socket.emit('editform/get', { 'pageId': id }).then(function (response) {
                var data = response.data;

                if (data && data.body) {
                    if (data.body.fields) {
                        fieldsCache = data.body.fields;
                        scope.fields = _.cloneDeep(fieldsCache); // clone fieldsCache, break reference
                    }
                    if (data.body.actions) {
                        scope.actions = transformActionFields(data.body.actions);
                    }
                    if (data.body.breadcrumbs) {
                        scope.breadcrumbs = data.body.breadcrumbs;
                    }
                    addActionHandlers();
                    scope.loading = false;
                }
            }, function (err) {
                // this should handle an error thrown by `EditFormOrigamiApi::get()`
            });
        }

    /**
     * watch state and react to changes
     */
    scope.$watch('state.value', function (newStatus, oldStatus) {
        // handle success
        switch (newStatus) {
            case 'success':
                fieldsCache = _.cloneDeep(scope.fields); // update fields cache if we saved it
                break;
        }
    });

    // resets the form by cloning the fields stored
    var resetForm = function resetForm() {
        scope.fields = _.cloneDeep(fieldsCache);
    };

    /**
     * Expensive but necessary watch on scope.field changes
     *   - generates fields diff
     *   - updates page status
     */
    scope.$watch('fields', function (newFields, oldFields) {
        changedFields = {};

        /**
         * Generates a structure that contains only the changed field elements,
         * preserving structure and with the bare minimum required to have it saved.
         * Deep recursion algorithm.
         *      acc - Object : Accumulator - the structure that will hold changes
         */
        var buildFieldsDiff = function buildFieldsDiff(fields, fieldsCache, acc) {

            // iterate over the fieldsCache for this level
            _.forIn(fieldsCache, function (fieldCache, key) {
                var field = fields[key];

                if (_.isFunction(fieldCache) || _.isRegExp(fieldCache)) return; //disallow Function & RegExp

                // if the value is an object (Array, Object)
                if (_.isObject(fieldCache)) {
                    var newAcc, deeper;

                    // define the accumulator required for this level in the tree
                    if (_.isArray(fieldCache)) {
                        newAcc = [];
                    } else {
                        newAcc = {};
                    }

                    // build diff for this object
                    deeper = buildFieldsDiff(field, fieldCache, newAcc);

                    // if result not empty add to this level's accumulator
                    if (!_.isEmpty(deeper)) {
                        if (_.isArray(acc)) {
                            acc.push(deeper);
                        } else {
                            acc[key] = deeper;
                            //keep the name associated with parent objects
                            if (fields.name) {
                                acc.name = fields.name;
                            }
                        }
                    }

                    // if this is a primitive variable type of key 'value', and it has changed
                } else if (key == 'value' && !_.isEqual(field, fieldCache)) {
                        // populate accumulator
                        acc.value = field;
                        acc.name = fields.name;
                    }
            });

            return acc;
        };

        changedFields = buildFieldsDiff(newFields, fieldsCache, {});

        if (!_.isEmpty(changedFields)) {
            scope.state.value = 'changed';
        } else {
            scope.state.value = 'unchanged';
        }
    }, true); // the true here tells angular to do a deep watch - expensive. Use with care.

    scope.$on('$destroy', function () {
        // emit user leaving so server can let everyone else know
        Socket.emit('editform/leave', { 'pageId': id });
        Header.clear();
    });
}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],38:[function(require,module,exports){
(function (global){
/**
 * Origami HomePage Controller
 */

'use strict';

global.origamiApp.controller('homePageCtrl', [function () {}]);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],39:[function(require,module,exports){
'use strict';

require('./home/homePage.es6');
require('./edit/editPage.es6');

},{"./edit/editPage.es6":37,"./home/homePage.es6":38}]},{},[1]);
