import express from 'express';
const app = express();
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    socket.on("sendMessage", ({ user, msg }) => {
        io.emit("message", { user, msg });
    });
});

server.listen(4000, () => {
    console.log('SERVER IS RUNNING');
});