let io;

module.exports = {
    init: (server) => {
        const { Server } = require('socket.io');
        io = new Server(server, {
            cors: {
                origin: "*",
            },
        });

        // Setup Socket.IO events here if needed
        io.on('connection', (socket) => {
            console.log('A client connected', socket.id);
            // Any event logic can be added here
        });

        return io;
    },

    getIo: () => {
        if (!io) {
            throw new Error('Socket.io is not initialized!');
        }
        return io;
    }
};
