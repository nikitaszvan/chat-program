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
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  try {
  socket.username = `User${(workerId)}`;
  const d = new Date(Date.now());
  socket.emit('chat message', {message: `${daysOfWeek[d.getDay()]} - ${d.getHours()}:${d.getMinutes()}`, class: 'general'});
  socket.broadcast.emit('chat message', { user: '', message: `${socket.username} has joined the chat`, dataInput: false, class: 'general'});

  socket.on('change username', (newUsername) => {
    const oldUsername = socket.username;
    socket.username = newUsername;
    io.emit('worker_id', { workerId: workerId, newUsername: socket.username});
    socket.broadcast.emit('chat message', { user: '', message: `${oldUsername} changed their username to ${socket.username}`, class: 'general'});
  });

  socket.on('chat message', (data) => {
      io.emit('worker_id', { workerId: workerId, typingArray: data.typingArray, inputContent: false});
      socket.emit('chat message', { user: socket.username, message: data.message, uniqueID: `${socket.id.slice(-5)}`, submit: true, class: 'local', workerId: workerId});
      socket.broadcast.emit('chat message', { user: socket.username, message: data.message, uniqueID: `${socket.id.slice(-5)}`, class: 'non-local', workerId: workerId});
  });

  socket.on('typing notification', (data) => {
      io.emit('worker_id', { workerId: workerId, inputContent: data.message, typingArray: data.typingArray, submit: false, class: 'general'});
      io.emit('chat message', { typingArray: data.typingArray, type: 'typing notification', class: 'general'});
  });

  socket.on('disconnect', () => {
    io.emit('worker_id', { workerId: workerId, disconnect: true});
    socket.broadcast.emit('chat message', { user: '', message: ` ${socket.username} has disconnected`, class: 'general', type: 'typing notification'});
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
