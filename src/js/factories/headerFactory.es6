/**
 * Origami Header Factory - Control Origami's header from anywhere
 */

global.origamiApp.factory('Header', [
    () => {
        var headerData = {};

        return {
            render: (template, scope, showUserDividerExpression) => {
                headerData.template = template;
                headerData.scope = scope;
                headerData.showUserDividerExpression = showUserDividerExpression;
            },
            clear: () => {
                headerData.template = void 0;
                headerData.scope = void 0;
            },
            getData: () => {
                return headerData;
            }
        };
    }
]);
