const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const authService = require('./services/authService');

const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const {updateTask, deleteTask, createTask, getTasks} = require("./services/taskService");
const io = new Server(http, {
    cors: {
        origin: 'http://localhost:4200',
        credentials: true,
    },
});

// Middleware
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

io.on('connection', (socket) => {
    console.log('Новое подключение через WebSocket: ', socket.id);

    socket.on('register', async ({ username, password }) => {
        try {
            const result = await authService.register(username, password);
            socket.emit('registerSuccess', { message: 'Registered successfully', user: result });
        } catch (err) {
            socket.emit('error', { message: err.message });
        }
    });

    socket.on('login', async ({ username, password }) => {
        try {
            const token = await authService.login(username, password);

            socket.emit('loginSuccess', { message: 'Logged in successfully', username });

            require('socket.io-cookie')(io, {
                cookieName: 'token',
                secret: token,
                httpOnly: true,
            });
        } catch (err) {
            socket.emit('error', { message: err.message });
        }
    });

    socket.on('logout', () => {
        try {
            socket.emit('logoutSuccess', { message: 'Logged out successfully' });
        } catch (err) {
            socket.emit('error', { message: err.message });
        }
    });

    socket.on('getTasks', async () => {
        try {
            const tasks = await getTasks();
            socket.emit('tasks', tasks);
        } catch (err) {
            socket.emit('error', { message: 'Failed to retrieve tasks' });
        }
    });

    socket.on('createTask', async (taskData) => {
        try {
            console.log('Received taskData:', taskData);
            const newTask = await createTask(taskData);
            io.emit('taskCreated', newTask);
        } catch (err) {
            socket.emit('error', { message: 'Failed to create task' });
        }
    });

    socket.on('updateTask', async ({ id, taskData }) => {
        try {
            const updatedTask = await updateTask(id, taskData);
            io.emit('taskUpdated', updatedTask);
        } catch (err) {
            socket.emit('error', { message: 'Failed to update task' });
        }
    });

    socket.on('deleteTask', async (id) => {
        try {
            await deleteTask(id);
            io.emit('taskDeleted', id);
        } catch (err) {
            socket.emit('error', { message: 'Failed to delete task' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Пользователь отключился от WebSocket');
    });
});

const PORT = 3000;
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
