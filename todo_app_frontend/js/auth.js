// ============================================
// AUTH HELPERS — загальні функції
// ============================================

function setFieldErr(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (field) field.classList.toggle('auth-form__field--error', !!message);
    if (error) error.textContent = message || '';
}

function clearFieldError(fieldId, errorId) {
    setFieldErr(fieldId, errorId, '');
}

function showCardStatus(statusId, message, type = 'error') {
    const el = document.getElementById(statusId);
    if (!el) return;
    el.textContent = message;
    el.className = `auth-card__status auth-card__status--${type}`;
    el.hidden = false;
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    const text   = btn.querySelector('.btn__text');
    const loader = btn.querySelector('.btn__loader');
    if (text)   text.hidden   = loading;
    if (loader) loader.hidden = !loading;
}

function setupPasswordToggle(inputId, toggleId) {
    const input  = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (!input || !toggle) return;
    toggle.addEventListener('click', () => {
        input.type = input.type === 'password' ? 'text' : 'password';
    });
}

function setupStrengthMeter(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const bars  = document.querySelectorAll('.password-strength__bar');
    const label = document.getElementById('strengthLabel');

    input.addEventListener('input', () => {
        const p = input.value;
        let score = 0;
        if (p.length >= 8) score++;
        if (/[a-zA-Z]/.test(p)) score++;
        if (/\d/.test(p)) score++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(p)) score++;

        const classes = ['', 'weak', 'fair', 'good', 'strong'];
        const colors  = ['', '#e85c5c', '#e8944b', '#5c9be8', '#4caf7d'];
        const labels  = ['', 'Слабкий', 'Середній', 'Добрий', 'Надійний'];

        bars.forEach((bar, i) => {
            bar.className = 'password-strength__bar';
            if (i < score) bar.classList.add(`password-strength__bar--${classes[score]}`);
        });

        if (label) {
            label.textContent = p ? labels[score] : '';
            label.style.color = colors[score];
        }
    });
}