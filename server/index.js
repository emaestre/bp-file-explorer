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

    const log = console.log.bind(console);
    // Add event listeners.
    watcher
        .on('unlink', (path) => log(`File ${path} has been removed`))
        .on('unlinkDir', (path) => log(`Directory ${path} has been removed`))
        .on('add', (path) => log(`File ${path} has been added`))
        .on('addDir', (path) => log(`Directory ${path} has been added`))
        .on('change', (path) => log(`File ${path} has been changed`))
        .on('error', (error) => log(`Watcher error: ${error}`));

    // // Add event listeners.
    // watcher.on('all', (event, name) => {
    //     const isValidWatcherEvent =
    //         event === 'add' ||
    //         event === 'addDir' ||
    //         event === 'change' ||
    //         event === 'unlink' ||
    //         event === 'unlinkDir' ||
    //         event === 'ready';

    //     if (isValidWatcherEvent) {
    //         // Perform socket connection
    //         io.on('connection', (socket) => {
    //             console.log('Connection established!');
    //             const watchedPaths = watcher.getWatched();
    //             const mapOfWatchedPaths = Object.keys(watchedPaths).map(
    //                 (firstLevelPath) => dirTree(firstLevelPath)
    //             );

    //             socket.emit('fileExplorerChange', mapOfWatchedPaths);
    //         });
    //     }
    // });

    io.on('connection', (socket) => {
        const watchedPaths = watcher.getWatched();
        const mapOfWatchedPaths = Object.keys(watchedPaths).map(
            (firstLevelPath) => dirTree(firstLevelPath)
        );

        socket.emit('fileExplorerChange', mapOfWatchedPaths);
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

// const path = require('path')
// const app = require('express')();
// const server = require('http').createServer(app);
// const io = require('socket.io')(server);
// const chokidar = require('chokidar')
// const port = 5000;

// const args = process.argv.slice(2);

// console.log('args', args)
// if (args.length > 0) {
//   const watcher = chokidar.watch(args, {
//     persistent: true
//   });

//   // Something to use when events are received.
//   const log = console.log.bind(console);
//   // Add event listeners.
//   watcher
//     .on('add', path => log(`File ${path} has been added`))
//     .on('change', path => log(`File ${path} has been changed`))
//     .on('unlink', path => log(`File ${path} has been removed`));

//   // More possible events.
//   watcher
//     .on('addDir', path => log(`Directory ${path} has been added`))
//     .on('unlinkDir', path => log(`Directory ${path} has been removed`))
//     .on('error', error => log(`Watcher error: ${error}`))
//     .on('ready', () => log('Initial scan complete. Ready for changes'));

//   // TODO: ^ use: io.emit('chat message', msg);

//   // 'add', 'addDir' and 'change' events also receive stat() results as second
//   // argument when available: https://nodejs.org/api/fs.html#fs_class_fs_stats
//   watcher.on('change', (path, stats) => {
//     if (stats) console.log(`File ${path} changed size to ${stats.size}`);
//   });

//   app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../index.html'));
//   });

//   io.on('connection', (socket) => {
//     console.log('connection')
//     //console.log('watcher.getWatched()', watcher.getWatched())

//     // watches files to tree struct
//     const tree = {};
//     let currentPosition = tree
//     let parentName = ''
//     let id = 1;
//     for (const [folder, children] of Object.entries(watcher.getWatched())) {
//       const name = folder.replace(parentName, '');

//       const currentPositionChildren = (currentPosition && currentPosition.children) || {}
//       currentPosition = { id, name, children: [ ...currentPositionChildren, ...children ] };

//       if (folder.replace(parentName, '') !== folder) {
//         currentPosition = children
//       }
//       parentName = name
//     }

//     console.log('tree',tree)
//   });

//   server.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}/`);
//   });
// } else {
//   console.log('Paths please!!')
// }
