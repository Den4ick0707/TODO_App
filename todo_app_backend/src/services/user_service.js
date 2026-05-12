const { getCollection } = require('../config/MongoDBContext');
const { hashPassword, comparePassword } = require('../utils/password_hasher');
const { validateEmail, validatePassword } = require('../utils/validators');
const UserModel = require('../models/user_model');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/mailer');

async function registerUser({ username, email, password }) {
    // Validation
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) throw { status: 400, message: emailCheck.message };

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) throw { status: 400, message: passwordCheck.message };

    if (!username || username.trim().length < 2) {
        throw { status: 400, message: 'Username must be at least 2 characters' };
    }

    const collection = await getCollection('users');

    // Check if user already exists
    const existingUser = await collection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw { status: 409, message: 'User with this email already exists' };
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new UserModel({
        username: username.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
    });

    const result = await collection.insertOne(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    return { _id: result.insertedId, ...userWithoutPassword };
}

async function loginUser({ email, password }, session) {
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) throw { status: 400, message: emailCheck.message };

    if (!password) throw { status: 400, message: 'Password is required' };

    const collection = await getCollection('users');
    const user = await collection.findOne({ email: email.toLowerCase() });

    if (!user) throw { status: 401, message: 'Invalid email or password' };

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw { status: 401, message: 'Invalid email or password' };

    // Save user info to session
    session.userId = user._id.toString();
    session.username = user.username;
    session.email = user.email;

    return {
        _id: user._id,
        username: user.username,
        email: user.email,
    };
}

async function logoutUser(session) {
    return new Promise((resolve, reject) => {
        session.destroy((err) => {
            if (err) reject({ status: 500, message: 'Could not log out' });
            else resolve({ message: 'Logged out successfully' });
        });
    });
}

async function requestPasswordReset(email) {
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) throw { status: 400, message: emailCheck.message };

    const collection = await getCollection('users');
    const user = await collection.findOne({ email: email.toLowerCase() });

    if (!user) return { message: 'If this email exists, a reset link has been sent' };

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await collection.updateOne(
        { _id: user._id },
        { $set: { reset_token: token, reset_token_expires: expires } }
    );

    await sendPasswordResetEmail(user.email, user.username, token);

    return { message: 'If this email exists, a reset link has been sent' };
}

async function resetPassword(token, newPassword) {
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) throw { status: 400, message: passwordCheck.message };

    const collection = await getCollection('users');
    const user = await collection.findOne({
        reset_token: token,
        reset_token_expires: { $gt: new Date() },
    });

    if (!user) throw { status: 400, message: 'Invalid or expired reset token' };

    const hashedPassword = await hashPassword(newPassword);

    await collection.updateOne(
        { _id: user._id },
        {
            $set: { password: hashedPassword },
            $unset: { reset_token: '', reset_token_expires: '' },
        }
    );

    return { message: 'Password has been reset successfully' };
}

module.exports = { registerUser, loginUser, logoutUser, requestPasswordReset, resetPassword };