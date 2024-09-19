const { validateSync, ValidationError } = require('class-validator');
const { plainToClass } = require('class-transformer');

class Task {
    constructor(title, status, dueDate, file, fileName) {
        this.title = title;
        this.status = status;
        this.dueDate = dueDate;
        this.file = file;
        this.fileName = fileName;
    }
}

function validateTask(taskData) {
    const task = plainToClass(Task, taskData);

    if (typeof task.title !== 'string') {
        throw new Error('Title must be a string');
    }

    const validStatuses = ['pending', 'completed'];
    if (!validStatuses.includes(task.status)) {
        throw new Error('Status must be either "pending" or "completed"');
    }

    if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const currentDate = new Date();

        if (isNaN(dueDate.getTime())) {
            throw new Error('DueDate must be a valid date');
        }
        if (dueDate < currentDate.setHours(0, 0, 0, 0)) {
            throw new Error('DueDate cannot be earlier than today');
        }
    }


    return task;
}

module.exports = { Task, validateTask };
