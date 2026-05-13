class TaskModel {
    constructor(data) {
        this.title = data.title;
        this.description = data.description;
        this.status = data.status || 'In progress';
        this.created_at = new Date();
        this.user_id = data.user_id || null;
    }
}

module.exports = TaskModel;