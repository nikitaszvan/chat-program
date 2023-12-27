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
        PORT: 3000 + i,
        WORKER_ID: i + 1
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

const workerId = process.env.WORKER_ID;
const port = process.env.PORT;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  try {
  socket.username = `User${(workerId - 1)}`;
  socket.broadcast.emit('chat message', { user: '', message: `(${socket.id.slice(-5)}) ${socket.username} has joined the chat`, class: 'general'});

  socket.on('change username', (newUsername) => {
    const oldUsername = socket.username || `User${(workerId - 1)}`;
    socket.username = newUsername;
    socket.broadcast.emit('chat message', { user: '', message: `(${socket.id.slice(-5)}) ${oldUsername} changed their username to ${socket.username}`, class: 'general'});
  });

  socket.on('chat message', (data) => {
      socket.emit('worker_id', { workerId: workerId });
      io.emit('chat message', { user: socket.username, message: data.message, uniqueID: `${socket.id.slice(-5)}`, submit: true, workerId: workerId});
  });

  socket.on('typing notification', (data) => {
      socket.broadcast.emit('chat message', { user: '', message: `(${socket.id.slice(-5)}) ${socket.username} is typing ...`, inputContent: data.message, submit: false, class: 'general'});
  });

  socket.on('disconnect', () => {
    socket.emit('chat message', { user: '', message: ` (${socket.id.slice(-5)}) ${socket.username} has disconnected`, class: 'general'});
  });
}
catch (e) {
  console.log(e);
}

});

  server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
  });

}
