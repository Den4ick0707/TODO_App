const userService = require('../services/user_service');

async function register(req, res, next) {
    try {
        const { username, email, password } = req.body;
        const user = await userService.registerUser({ username, email, password });
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await userService.loginUser({ email, password }, req.session);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

async function logout(req, res, next) {
    try {
        const result = await userService.logoutUser(req.session);
        res.clearCookie('connect.sid');
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function forgotPassword(req, res, next) {
    try {
        const { email } = req.body;
        const result = await userService.requestPasswordReset(email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function resetPassword(req, res, next) {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const result = await userService.resetPassword(token, password);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function getMe(req, res) {
    res.status(200).json({
        userId: req.session.userId,
        username: req.session.username,
        email: req.session.email,
    });
}

module.exports = { register, login, logout, forgotPassword, resetPassword, getMe };