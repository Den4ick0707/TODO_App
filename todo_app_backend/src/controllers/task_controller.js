const taskService = require('../services/task_service');

async function createTask(req, res, next) {
    try {
        const newTask = await taskService.addTaskToDb(req.body, req.session.userId);
        res.status(201).json(newTask);
    } catch (error) {
        next(error);
    }
}

async function getAllTasks(req, res, next) {
    try {
        const tasks = await taskService.getAllTasksFromDb(req.session.userId);
        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
}

async function getTaskById(req, res, next) {
    try {
        const task = await taskService.getTaskByIdFromDb(req.params.id, req.session.userId);
        if (!task) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
}

async function updateTask(req, res, next) {
    try {
        const updated = await taskService.updateTaskInDb(req.params.id, req.body, req.session.userId);
        if (!updated) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

async function deleteTask(req, res, next) {
    try {
        const isDeleted = await taskService.deleteTaskInDb(req.params.id, req.session.userId);
        if (!isDeleted) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json({ message: `Task ${req.params.id} deleted` });
    } catch (error) {
        next(error);
    }
}

module.exports = {createTask, getAllTasks, getTaskById, updateTask, deleteTask};