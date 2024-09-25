const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const path = require('path');
const app = express(); // app is an handler function for HTTP requests

// Connecting to MongoDB
mongoose.connect('mongodb://localhost:27017/chat-app')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Mongoose models
const User = mongoose.model('User', new mongoose.Schema({
    name: String,

    joinedAt: {
        type: Date,
        default: Date.now
    }
}));

const Message = mongoose.model('Message', new mongoose.Schema({
    name: String,
    message: String,

    sentAt: {
        type: Date,
        default: Date.now
    }
}));

// Create an HTTP server and wrap the Express app
const server = http.createServer(app);

// Socket.IO server listens to our app http server (Express) on port
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"]
    }
});


//Users object to store all connected users
const users = {};


// Listen for Socket.IO events
io.on('connection', socket => {
    socket.on('new-user-joined', async name => {
        try {
            const newUser = new User({ name });
            const savedUser = await newUser.save();
            console.log("Saved new user:", savedUser);
            users[socket.id] = newUser;
            io.emit('user-joined', name);
        } catch (err) {
            console.log("Error saving new user:", err);
        }
    });

    socket.on('send', async message => {
        if (users[socket.id]) {
            const newMessage = new Message({
                name: users[socket.id].name,
                message: message
            });
            const savedMessage = await newMessage.save();
            console.log("Saved new message:", savedMessage);
            socket.broadcast.emit('receive', { message: message, name: users[socket.id].name });
        }
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            socket.broadcast.emit('left', users[socket.id].name);
            delete users[socket.id];
        }
    });
});

app.use(express.static('/Users/kabirsaini/Desktop/public'));

// Setup express routes
app.get('/', (req, res) => {
    res.sendFile(path.join('/Users/kabirsaini/Desktop/ChattingApp/index.html'));
});


// Start the HTTP server
server.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
}).on('error', err => {
    console.log('Failed to start server:', err);
});
