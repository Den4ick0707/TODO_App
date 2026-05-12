class UserModel {
    constructor(data) {
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;
        this.created_at = new Date();
        this.reset_token = null;
        this.reset_token_expires = null;
    }
}

module.exports = UserModel;