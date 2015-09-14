/**
 * Origami User Data Handler
 */

global.origamiApp.run([
    'Socket',
    'Storage',
    (Socket, Storage) => {
        Socket.on('userdata', (data) => {
            Storage.setSession('userdata', data);
        });
    }
]);
