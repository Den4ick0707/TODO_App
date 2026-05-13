const {getCollection} = require('../config/MongoDBContext');
const ObjectId = require('mongodb').ObjectId;
const TaskModel = require('../models/task_model');

async function addTaskToDb(taskData, userId) {
    const collection = await getCollection('task_list');
    const taskToSave = new TaskModel({ ...taskData, user_id: userId });
    const result = await collection.insertOne(taskToSave);
    return {_id: result.insertedId, ...taskToSave};
}

async function getAllTasksFromDb(userId) {
    const collection = await getCollection('task_list');
    return await collection.find({ user_id: userId }).toArray();
}

async function getTaskByIdFromDb(targetId, userId) {
    const collection = await getCollection('task_list');
    return await collection.findOne({
        _id: new ObjectId(targetId.trim()),
        user_id: userId
    });
}

async function updateTaskInDb(id, updateInfo, userId) {
    if (!ObjectId.isValid(id)) return null;
    const collection = await getCollection('task_list');
    return await collection.findOneAndUpdate(
        { _id: new ObjectId(id), user_id: userId },
        { $set: updateInfo },
        { returnDocument: 'after' }
    );
}

async function deleteTaskInDb(id, userId) {
    const collection = await getCollection('task_list');
    const result = await collection.deleteOne({
        _id: new ObjectId(id),
        user_id: userId
    });
    return result.deletedCount > 0;
}

module.exports = {addTaskToDb, getAllTasksFromDb, getTaskByIdFromDb, updateTaskInDb, deleteTaskInDb};