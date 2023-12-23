import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import path from 'path';
import {fileURLToPath} from 'url';
import { availableParallelism } from 'os';
import cluster from 'cluster';
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter';

if (cluster.isPrimary) {
    const numCPUs = availableParallelism();
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork({
        PORT: 3000 + i
      });
    }
  
    setupPrimary();
} else{

const app = express();
const server = http.createServer(app);
const io = new Server(server,  {
    connectionStateRecovery: {},
    adapter: createAdapter()
  });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let number_user = 1;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.username = `User${number_user}`;
    socket.broadcast.emit('chat message', { user: '', message: `(${socket.id}) ${socket.username} has joined the chat`});
    number_user += 1;

    socket.on('change username', (newUsername) => {
        const oldUsername = socket.username || 'User';
        socket.username = newUsername;
        socket.broadcast.emit('chat message', { user: '', message: `(${socket.id}) ${oldUsername} changed their username to ${socket.username}`});
    });

    socket.on('chat message', (data) => {
        socket.message = data.message;
        io.emit('chat message', { user: socket.username, message: data.message, uniqueID: socket.id, submit: true });
    });

    socket.on('typing notification', (data) => {
            socket.broadcast.emit('chat message', { user: '', message: `(${socket.id}) ${socket.username} is typing ...`, inputContent: data.message, submit: false});
        }
    );

    socket.on('disconnect', () => {
        io.emit('chat message', { user: '', message: ` ${socket.username} has disconnected` });
      });
});

const port = process.env.PORT;

  server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
  });

}