import {Server} from 'socket.io';
import {createServer} from 'http';
import express from 'express';

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: ["http://localhost:3000"],
})

export const getReceiverSocketId = (userId) => {
    return userSocketMap[userId] || null;
}

const userSocketMap = {};

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log('userId', userId, 'socketId', socket.id);
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
        if (userId) {
            delete userSocketMap[userId];
            console.log('userId', userId, 'disconnected', socket.id);
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
})
 

export {app, server, io};