/**
 * Origami CMS Header Directive - Displays the CMS Header
 */

global.origamiApp.directive(
  'notification',
  [
    'ServerConfig',
    'Vent',
    (ServerConfig, Vent) => {
      return {
        templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/notification/notificationDirective.html',
        restrict: 'A',
        scope: true,
        link: (scope, el, attr) => {
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

          var removeVentListener = Vent.on('SystemMessage.set', (e, args) => {
            var messageClass = args.class !== void 0 ? args.class : 'alert-danger',
              timeout = args.timeout !== void 0 ? args.timeout : 8000;

            // set the message
            scope.message = {
              class: messageClass,
              content: args.content
            };

            // to force update when not running $digest automatically
            if (!scope.$root.$$phase) {
              scope.$apply();
            }

            // remove the message after X seconds
            setTimeout(() => {
              scope.$apply(() => {
                delete scope.message;
              });
            }, timeout);
          });

          scope.$on('$destroy', () => {
            removeVentListener();
          });
        }
      }
    }
  ]
);
