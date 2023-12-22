import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import path from 'path';
import {fileURLToPath} from 'url';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.broadcast.emit('chat message', { user: '', message: `User has joined the chat`});

    socket.on('change username', (newUsername) => {
        const oldUsername = socket.username || 'User';
        socket.username = newUsername;
        socket.broadcast.emit('chat message', { user: '', message: `${oldUsername} changed their username to ${newUsername }`});
    });

    socket.on('chat message', (data) => {
        socket.user = data.user;
        socket.message = data.message;
        io.emit('chat message', { user: data.user, message: data.message });
    });

    socket.on('typing notification', (data) => {
        socket.user = data.user;
        socket.message = data.message;
        socket.broadcast.emit('chat message', { user: '', message: data.message});
    });

    socket.on('disconnect', () => {
        io.emit('chat message', { user: '', message: ` ${socket.username} has disconnected` });
      });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});