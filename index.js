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
  // io.emit('send data', { workerId: workerId });
  socket.emit('chat message', {message: `${daysOfWeek[d.getDay()]} - ${d.getHours()}:${d.getMinutes()}`});
  // socket.broadcast.emit('chat message', { message: `${socket.username} has joined the chat`});
  io.emit('chat message', null);

  socket.on('change username', (usernameSubmitted) => {
    const oldUsername = socket.username;
    socket.username = usernameSubmitted;
    io.emit('send data', { workerId: workerId, username: socket.username});
    // socket.broadcast.emit('chat message', { message: `${oldUsername} changed their username to ${socket.username}`});
  });

  socket.on('chat message', (messageSubmitted) => {
    io.emit('send data', { workerId: workerId });
    socket.emit('chat message', { message: messageSubmitted, class: 'local'});
    socket.broadcast.emit('chat message', { message: messageSubmitted, class: 'non-local'});
    io.emit('chat message', null);
  });

  socket.on('typing notification', (data) => {
      io.emit('send data', { workerId: workerId, inputContent: data.message });
      io.emit('chat message', null);
  });

  socket.on('disconnect', () => {
    io.emit('send data', { workerId: workerId, disconnect: true });
    // socket.broadcast.emit('chat message', { message: `${socket.username} has disconnected`});
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
