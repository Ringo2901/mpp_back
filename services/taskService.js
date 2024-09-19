const path = require('path');
const fs = require('fs');
const { uploadDir } = require('../config/config');
const { v4: uuidv4 } = require('uuid');
const { Task, validateTask } = require("../models/taskModel");

let tasks = [];
let taskId = 1;

const getTasks = () => {
    return tasks;
};

const createTask = (taskData) => {
    try {
        const { title, status, dueDate, file, fileName} = taskData;
        const newTask = new Task(title, status, dueDate, file, fileName);
        validateTask(newTask);
        newTask.id = taskId++;
        tasks.push(newTask);
        return newTask;
    } catch (err) {
        throw new Error(err.message);
    }
};

const updateTask = (id, taskData) => {
    try {
        const taskId = parseInt(id);
        const { title, status, dueDate } = taskData;
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.title = title;
            task.status = status;
            task.dueDate = dueDate;
            validateTask(task);
            return task;
        } else {
            throw new Error('Task not found');
        }
    } catch (err) {
        throw new Error(err.message);
    }
};

const deleteTask = (id) => {
    const taskId = parseInt(id);
    tasks = tasks.filter(t => t.id !== taskId);
};

const getFile = (filename) => {
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
        return filePath;
    } else {
        throw new Error('File not found');
    }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getFile };
