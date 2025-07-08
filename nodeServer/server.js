//Node server which will handle socket io connections
const io = require('socket.io')(8000, {
    cors: {
        origin: ["http://127.0.0.1:5500", "https://groupmessage.netlify.app"], // Must exactly match frontend origin
        methods: ["GET", "POST"]
    }
});

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// 👇 Define this route to prevent 404 on homepage
app.get('/', (req, res) => {
  res.send('Welcome to GroupMessage API!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const users = {};

io.on('connection', socket =>{
    //if any new user joins , let other users connect to the server know
    socket.on('new-user-joined', name =>{
        // console.log("New user", name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name)
    });
    
    //if someone send a message, broadcast it to all to other people 
    socket.on('send', message =>{
        socket.broadcast.emit('receive',{message: message, name: users[socket.id]})
    });

    //if someone leave the chat, let others know
    socket.on('disconnect', message=>{
        socket.broadcast.emit('left', users[socket.id])
        delete users[socket.id];
    })

})
