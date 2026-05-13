// ============================================
// AUTH PAGE — логіка сторінки auth.html
// Запускається тільки якщо є елемент #loginStep
// ============================================

if (document.getElementById('loginStep')) {

    // ---- Step navigation ----
    function showStep(stepId) {
        ['loginStep', 'registerStep', 'forgotStep'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.hidden = (id !== stepId);
        });
        const isForgot = stepId === 'forgotStep';
        const layout = document.getElementById('authLayout');
        const brand  = document.getElementById('authBrand');
        if (layout) layout.classList.toggle('auth-layout--centered', isForgot);
        if (brand)  brand.style.display = isForgot ? 'none' : '';
    }

    // ---- Navigation links ----
    const nav = {
        toRegister:           () => showStep('registerStep'),
        toLogin:              () => showStep('loginStep'),
        toForgot:             () => showStep('forgotStep'),
        backToLogin:          () => showStep('loginStep'),
        backToLoginFromSuccess: () => showStep('loginStep'),
    };

    Object.entries(nav).forEach(([id, fn]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', (e) => { e.preventDefault(); fn(); });
    });

    // ---- Password toggles ----
    setupPasswordToggle('loginPassword', 'toggleLoginPass');
    setupPasswordToggle('regPassword',   'toggleRegPass');

    // ---- Strength meter ----
    setupStrengthMeter('regPassword');

    // ---- LOGIN ----
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFieldError('loginEmailField',    'loginEmailError');
            clearFieldError('loginPasswordField', 'loginPasswordError');

            const email    = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            let hasError   = false;

            if (!email)    { setFieldErr('loginEmailField',    'loginEmailError',    'Введіть email');  hasError = true; }
            if (!password) { setFieldErr('loginPasswordField', 'loginPasswordError', 'Введіть пароль'); hasError = true; }
            if (hasError) return;

            setLoading('loginBtn', true);
            try {
                await api.login({ email, password });
                window.location.href = '/pages/index.html';
            } catch (err) {
                setLoading('loginBtn', false);
                showCardStatus('loginStatus',
                    err.status === 401 ? 'Невірний email або пароль' : (err.message || 'Помилка'),
                    'error'
                );
            }
        });
    }

    // ---- REGISTER ----
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFieldError('usernameField',   'usernameError');
            clearFieldError('regEmailField',   'regEmailError');
            clearFieldError('regPasswordField','regPasswordError');

            const username = document.getElementById('regUsername').value.trim();
            const email    = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            let hasError   = false;

            if (!username || username.length < 2) {
                setFieldErr('usernameField', 'usernameError', 'Мін. 2 символи'); hasError = true;
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setFieldErr('regEmailField', 'regEmailError', 'Невірний email'); hasError = true;
            }
            if (!password || password.length < 8) {
                setFieldErr('regPasswordField', 'regPasswordError', 'Мін. 8 символів'); hasError = true;
            }
            if (hasError) return;

            setLoading('registerBtn', true);
            try {
                await api.register({ username, email, password });
                showCardStatus('registerStatus', 'Акаунт створено! Увійдіть.', 'success');
                setTimeout(() => showStep('loginStep'), 1500);
            } catch (err) {
                setLoading('registerBtn', false);
                if (err.status === 409) setFieldErr('regEmailField', 'regEmailError', 'Email вже зайнятий');
                else showCardStatus('registerStatus', err.message || 'Помилка', 'error');
            }
        });
    }

    // ---- FORGOT PASSWORD ----
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFieldError('forgotEmailField', 'forgotEmailError');

            const email = document.getElementById('forgotEmail').value.trim();
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setFieldErr('forgotEmailField', 'forgotEmailError', 'Введіть коректний email');
                return;
            }

            setLoading('forgotBtn', true);
            try { await api.forgotPassword(email); } catch (_) {}
            // завжди показуємо success (безпека — не розкриваємо чи існує юзер)
            const wrap    = document.getElementById('forgotFormWrap');
            const success = document.getElementById('forgotSuccess');
            if (wrap)    wrap.hidden    = true;
            if (success) success.hidden = false;
        });
    }

} // end guard