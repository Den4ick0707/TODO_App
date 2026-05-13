const API_BASE = 'http://localhost:3000';

async function request(method, endpoint, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    };

    if (body) options.body = JSON.stringify(body);

    const res = await fetch(API_BASE + endpoint, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw { status: res.status, message: data.message || 'Request error' };
    }

    return data;
}

window.api = {
    // Auth
    register: (data)         => request('POST', '/auth/register', data),
    login:    (data)         => request('POST', '/auth/login', data),
    logout:   ()             => request('POST', '/auth/logout'),
    getMe:    ()             => request('GET',  '/auth/me'),
    forgotPassword: (email)  => request('POST', '/auth/forgot-password', { email }),
    resetPassword:  (token, password) => request('POST', `/auth/reset-password/${token}`, { password }),

    // Tasks
    getTasks:    ()     => request('GET',    '/tasks'),
    getTask:     (id)   => request('GET',    `/tasks/${id}`),
    createTask:  (data) => request('POST',   '/tasks', data),
    updateTask:  (id, data) => request('PUT', `/tasks/${id}`, data),
    deleteTask:  (id)   => request('DELETE', `/tasks/${id}`)
};