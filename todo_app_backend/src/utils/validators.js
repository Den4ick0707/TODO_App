function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!email || !emailRegex.test(email)) {
        return {
            isValid: false,
            message: 'Invalid email address',
        };
    }
    return { isValid: true, message: 'Success' };
}

function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!password || !passwordRegex.test(password)) {
        return {
            isValid: false,
            message: 'Password must be at least 8 characters and include letters, numbers, and a special character (!@#$%^&* etc.)',
        };
    }
    return { isValid: true };
}

module.exports = { validateEmail, validatePassword };