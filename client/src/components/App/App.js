import { useCallback, useEffect, useState } from 'react';
// See more here: https://github.com/shunjizhan/react-folder-tree
import FolderTree from 'react-folder-tree';
import socketio from 'socket.io-client';

import './App.css';

function App() {
    const [fileExplorerData, setFileExplorerData] = useState([]);
    const socket = socketio.connect(process.env.REACT_APP_SOCKET_ENDPOINT);

    const folderTreeConvertion = useCallback((treeNode) => {
        if (!('children' in treeNode)) {
            return {
                name: treeNode.name,
            };
        }

        return {
            name: treeNode.name,
            children: treeNode.children.map(folderTreeConvertion),
        };
    }, []);

    const handleSocketData = useCallback(
        (socketData) => {
            console.log('Socket Information: Data received.');
            const treeData = socketData.map(folderTreeConvertion);
            setFileExplorerData(treeData);
        },
        [folderTreeConvertion]
    );

    useEffect(() => {
        socket.on('fileExplorerChange', handleSocketData);
    }, [socket, handleSocketData]);

    return (
        <div className="App">
            {fileExplorerData.map((folderTreeNode, index) => (
                <FolderTree
                    className="FolderTree"
                    key={index}
                    data={folderTreeNode}
                    showCheckbox={false}
                    indentPixels={40}
                    readOnly
                />
            ))}
        </div>
    );
}

export default App;
