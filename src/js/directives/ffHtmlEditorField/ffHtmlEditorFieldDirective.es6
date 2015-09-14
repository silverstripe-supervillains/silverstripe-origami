/**
 * Origami HTML Editor Field Directive
 * Displays a WYSIWYG editor
 */

global.origamiApp.directive(
  'ffHtmlEditorField',
  [
    'ServerConfig',
    '$timeout',
    (ServerConfig, timeout) => {
      return {
        templateUrl: ServerConfig.OrigamiDir + 'src/js/directives/ffHtmlEditorField/ffHtmlEditorFieldDirective.html',
        restrict: 'A',
        scope: {
          field: '=',
          top: '=topScope'
        },
        link: (scope, el, attr) => {
          var editor;

          var saveToScope = () => {
              // saves the contents of tinymce into the textarea it is applied to
              editor.save();

              var content = editor.getContent().trim();

              scope.field.value = content;

              if (!scope.$root.$$phase) {
                scope.$apply();
              }
          }

          var options = {
              selector: '[tinymce-init]',
              setup: (ed) => {
                  // setup access to editor
                  editor = ed;

                  // handle all the following events in tinymce to update scope
                  editor.on('change', (e) => {
                      saveToScope();
                  });

                  editor.on('undo', (e) => {
                      saveToScope();
                  });

                  editor.on('redo', (e) => {
                      saveToScope();
                  });

                  editor.on('blur', (e) => {
                      saveToScope();
                  });

                  editor.on('ObjectResized', (e) => {
                      saveToScope();
                  });

                  editor.on('ExecCommand', (e) => {
                      saveToScope();
                  });

                  // remove element if tinymce removed
                  editor.on('remove', (e) => {
                      el.remove();
                  });
              },
              plugins: "paste"
          }

          tinymce.init(options);

          scope.$watch('field.value', (newVal, oldVal) => {
              // need to add this as tinymce does not play nice with initial values and
              if (editor.getDoc() != void 0 && newVal != void 0) {
                  if(newVal !== editor.getContent().trim()) {
                      editor.setContent(newVal);
                  }
              }
          });
        }
      }
    }
  ]
);
