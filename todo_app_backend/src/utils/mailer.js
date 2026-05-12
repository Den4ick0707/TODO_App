const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.MAILTRAP_PORT) || 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

async function sendPasswordResetEmail(to, username, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${token}`;

    const mailOptions = {
        from: `"Todo App" <no-reply@todoapp.com>`,
        to,
        subject: 'Password Reset Request',
        html: `
            <h2>Hello, ${username}!</h2>
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <a href="${resetUrl}" style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #4F46E5;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin: 16px 0;
            ">Reset Password</a>
            <p>This link expires in <strong>1 hour</strong>.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendPasswordResetEmail };