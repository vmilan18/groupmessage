const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for your frontend
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'https://groupmessage.netlify.app'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Setup Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: ['http://127.0.0.1:5500', 'https://groupmessage.netlify.app'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Welcome route
app.get('/', (req, res) => {
    res.send('Welcome to GroupMessage API!');
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Store connected users
const users = {};

// Socket.IO connection handling
io.on('connection', socket => {
    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', {
            message: message,
            name: users[socket.id]
        });
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
});
