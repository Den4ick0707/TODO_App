
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const emailError = document.getElementById('emailError');
        const emailField = document.getElementById('emailField');

        emailField.classList.remove('auth-form__field--error');
        emailError.textContent = '';

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailField.classList.add('auth-form__field--error');
            emailError.textContent = 'Enter a correct email';
            return;
        }

        const btn = document.getElementById('forgotBtn');
        btn.disabled = true;
        btn.querySelector('.btn__text').hidden = true;
        btn.querySelector('.btn__loader').hidden = false;

        try {
            await api.forgotPassword(email);
            document.getElementById('step1').hidden = true;
            document.getElementById('step2').hidden = false;
        } catch (err) {
            // Always show success (security: don't reveal if user exists)
            document.getElementById('step1').hidden = true;
            document.getElementById('step2').hidden = false;
        }
    });
}

const resetForm = document.getElementById('resetForm');
if (resetForm) {
    const token = new URLSearchParams(window.location.search).get('token');

    if (!token) {
        document.getElementById('formStatus').textContent = 'Link is expired';
        document.getElementById('formStatus').className = 'auth-card__status auth-card__status--error';
        document.getElementById('formStatus').hidden = false;
        resetForm.hidden = true;
    }

    const passInput  = document.getElementById('password');
    const toggleBtn  = document.getElementById('togglePassword');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            passInput.type = passInput.type === 'password' ? 'text' : 'password';
        });
    }

    // Strength meter
    const bars  = document.querySelectorAll('.password-strength__bar');
    const label = document.getElementById('strengthLabel');

    if (passInput) {
        passInput.addEventListener('input', () => {
            const p = passInput.value;
            let score = 0;
            if (p.length >= 8) score++;
            if (/[a-zA-Z]/.test(p)) score++;
            if (/\d/.test(p)) score++;
            if (/[!@#$%^&*]/.test(p)) score++;

            const cls = ['', 'weak', 'fair', 'good', 'strong'][score];
            const colors = ['', '#e85c5c', '#e8944b', '#5c9be8', '#4caf7d'];
            const labels = ['', 'Weak', 'Fair', 'Medium', 'Strong'];

            bars.forEach((bar, i) => {
                bar.className = 'password-strength__bar';
                if (i < score) bar.classList.add(`password-strength__bar--${cls}`);
            });
            if (label) {
                label.textContent = p ? labels[score] : '';
                label.style.color = colors[score];
            }
        });
    }

    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const passField = document.getElementById('passwordField');
        const passError = document.getElementById('passwordError');

        passField.classList.remove('auth-form__field--error');
        passError.textContent = '';

        if (!password || password.length < 8) {
            passField.classList.add('auth-form__field--error');
            passError.textContent = 'Min. 8 symbols';
            return;
        }

        const btn = document.getElementById('resetBtn');
        btn.disabled = true;
        btn.querySelector('.btn__text').hidden = true;
        btn.querySelector('.btn__loader').hidden = false;

        try {
            await api.resetPassword(token, password);
            const status = document.getElementById('formStatus');
            status.textContent = 'Password changed';
            status.className = 'auth-card__status auth-card__status--success';
            status.hidden = false;
            resetForm.hidden = true;
            setTimeout(() => window.location.href = 'auth.html', 2000);
        } catch (err) {
            btn.disabled = false;
            btn.querySelector('.btn__text').hidden = false;
            btn.querySelector('.btn__loader').hidden = true;

            const status = document.getElementById('formStatus');
            status.textContent = err.message || 'Link is expired';
            status.className = 'auth-card__status auth-card__status--error';
            status.hidden = false;
        }
    });
}