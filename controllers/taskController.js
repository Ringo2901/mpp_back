const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const taskService = require('../services/taskService');
const { uploadDir } = require('../config/config');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext);
    }
});
const upload = multer({ storage });

exports.getTasks = (req, res) => {
    const tasks = taskService.getTasks();
    res.json(tasks);
};

exports.createTask = (req, res) => {
    try {
        const file = req.file;
        const filename = req.body.filename;
        const newTask = taskService.createTask(req.body, file);
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateTask = (req, res) => {
    try {
        const updatedTask = taskService.updateTask(req.params.id, req.body);
        res.json(updatedTask);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

exports.deleteTask = (req, res) => {
    try {
        taskService.deleteTask(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

exports.getFile = (req, res) => {
    try {
        const filePath = taskService.getFile(req.params.filename);
        res.sendFile(filePath);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

exports.upload = upload.single('file');
