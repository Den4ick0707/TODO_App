
function setFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (field) field.classList.toggle('auth-form__field--error', !!message);
    if (error) error.textContent = message || '';
}

function clearErrors() {
    document.querySelectorAll('.auth-form__field--error').forEach(el =>
        el.classList.remove('auth-form__field--error')
    );
    document.querySelectorAll('.auth-form__error').forEach(el =>
        el.textContent = ''
    );
}

function showStatus(message, type = 'error') {
    const el = document.getElementById('formStatus');
    if (!el) return;
    el.textContent = message;
    el.className = `auth-card__status auth-card__status--${type}`;
    el.hidden = false;
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.querySelector('.btn__text').hidden = loading;
    btn.querySelector('.btn__loader').hidden = !loading;
}

// Password visibility toggle
function setupPasswordToggle(inputId, toggleId) {
    const input  = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (!input || !toggle) return;

    toggle.addEventListener('click', () => {
        input.type = input.type === 'password' ? 'text' : 'password';
    });
}

// Password strength
function checkStrength(password) {
    let score = 0;
    if (password.length >= 8)                        score++;
    if (/[a-zA-Z]/.test(password))                  score++;
    if (/\d/.test(password))                         score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) score++;

    const labels = ['', 'Weak', 'Fair', 'God', 'Strong'];
    const classes = ['', 'weak', 'fair', 'good', 'strong'];
    const colors  = ['', '#e85c5c', '#e8944b', '#5c9be8', '#4caf7d'];

    return { score, label: labels[score], cls: classes[score], color: colors[score] };
}

function setupStrengthMeter(inputId) {
    const input  = document.getElementById(inputId);
    if (!input) return;

    const bars  = document.querySelectorAll('.password-strength__bar');
    const label = document.getElementById('strengthLabel');

    input.addEventListener('input', () => {
        const { score, label: lbl, cls, color } = checkStrength(input.value);

        bars.forEach((bar, i) => {
            bar.className = 'password-strength__bar';
            if (i < score) bar.classList.add(`password-strength__bar--${cls}`);
        });

        if (label) {
            label.textContent = input.value ? lbl : '';
            label.style.color = color;
        }
    });
}

// ---- LOGIN ----

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    setupPasswordToggle('password', 'togglePassword');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        let hasError   = false;

        if (!email) {
            setFieldError('emailField', 'emailError', 'Enter email');
            hasError = true;
        }
        if (!password) {
            setFieldError('passwordField', 'passwordError', 'Enter password');
            hasError = true;
        }
        if (hasError) return;

        setLoading('loginBtn', true);

        try {
            await api.login({ email, password });
            window.location.href = 'index.html';
        } catch (err) {
            setLoading('loginBtn', false);
            if (err.status === 401) {
                showStatus('Incorrect email r password');
            } else {
                showStatus(err.message || 'Something went wrong');
            }
        }
    });
}

// ---- REGISTER ----

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    setupPasswordToggle('password', 'togglePassword');
    setupStrengthMeter('password');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const username = document.getElementById('username').value.trim();
        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        let hasError   = false;

        if (!username || username.length < 2) {
            setFieldError('usernameField', 'usernameError', "Мін. 2 символи");
            hasError = true;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFieldError('emailField', 'emailError', 'Невірний формат email');
            hasError = true;
        }
        if (!password || password.length < 8) {
            setFieldError('passwordField', 'passwordError', 'Мін. 8 символів');
            hasError = true;
        }
        if (hasError) return;

        setLoading('registerBtn', true);

        try {
            await api.register({ username, email, password });
            window.location.href = 'auth.html';
        } catch (err) {
            setLoading('registerBtn', false);
            if (err.status === 409) {
                setFieldError('emailField', 'emailError', 'Email is used');
            } else if (err.status === 400) {
                showStatus(err.message);
            } else {
                showStatus(err.message || 'Something went wrong');
            }
        }
    });
}