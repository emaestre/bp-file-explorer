const app = require('express')();
const server = require('http').createServer(app);
const PORT = 8080;
const { Server } = require('socket.io');
const chokidar = require('chokidar');
const path = require('path');
// See more here: https://www.npmjs.com/package/directory-tree
const dirTree = require('directory-tree');

const args = process.argv.slice(2);

const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

if (args.length > 0) {
    // Initialize chokidar watcher
    const watcher = chokidar.watch(args, {
        persistent: true,
        ignored: '**/node_modules/**',
    });

    // Sockets connections
    const sockets = {};

    io.on('connection', (socket) => {
        console.log('Client connected');
        // Saving in a map all the connections
        sockets[socket.io] = socket;

        // When disconnect, delete the socket
        socket.on('disconnect', () => {
            delete sockets[socket.id];
        });
    });

    watcher.on('all', (event, name) => {
        const isValidWatcherEvent =
            event === 'add' ||
            event === 'addDir' ||
            event === 'change' ||
            event === 'unlink' ||
            event === 'unlinkDir';

        if (isValidWatcherEvent) {
            console.log(`Chokidar event: ${event}, watched element -> ${name}`);

            const socketList = Object.values(sockets);
            const watchedPaths = watcher.getWatched();
            const mapOfWatchedPaths = Object.keys(watchedPaths).map(
                (firstLevelPath) => dirTree(firstLevelPath)
            );

            // Emit the chokidar watch events to the connected clients
            socketList.forEach((socket) => {
                console.log('Socket IO - Backend Event emmited');
                socket.emit('fileExplorerChange', mapOfWatchedPaths);
            });
        }
    });

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../index.html'));
    });

    server.listen(PORT, () => {
        console.log(`listening on *:${PORT}`);
    });
} else {
    console.log('Paths please!!');
}
