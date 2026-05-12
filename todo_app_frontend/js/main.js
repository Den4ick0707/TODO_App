

// ---- State ----
let tasks       = [];
let currentFilter = 'all';
let currentSort   = 'newest';
let deleteTarget  = null;

// ---- Toast ----
function toast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.innerHTML = `<span class="toast__dot"></span><span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => {
        el.classList.add('toast--hide');
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

// ---- Auth guard ----
async function initUser() {
    try {
        const user = await api.getMe();
        document.getElementById('userName').textContent  = user.username;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userAvatar').textContent = user.username[0].toUpperCase();
    } catch {
        window.location.href = 'auth.html';
    }
}

// ---- Stats ----
function updateStats() {
    document.getElementById('statTotal').textContent    = tasks.length;
    document.getElementById('statProgress').textContent = tasks.filter(t => t.status === 'In progress').length;
    document.getElementById('statDone').textContent     = tasks.filter(t => t.status === 'Done').length;
    document.getElementById('statPending').textContent  = tasks.filter(t => t.status === 'Pending').length;
}

// ---- Render ----
function statusBadge(status) {
    const map = {
        'In progress': ['progress', 'In progress'],
        'Done':        ['done',     'Done'],
        'Pending':     ['pending',  'Pendong'],
    };
    const [cls, label] = map[status] || ['progress', status];
    return `<span class="badge badge--${cls}">${label}</span>`;
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('uk-UA', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

function renderTasks(list) {
    const taskList   = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');

    taskList.innerHTML = '';

    if (!list.length) {
        emptyState.hidden = false;
        return;
    }

    emptyState.hidden = true;

    list.forEach(task => {
        const isDone = task.status === 'Done';
        const card = document.createElement('div');
        card.className = 'task-card';
        card.dataset.id = task._id;

        card.innerHTML = `
            <button class="task-card__check ${isDone ? 'task-card__check--done' : ''}"
                    aria-label="${isDone ? 'Set as uncomplete' : 'Set as complete'}"
                    data-action="toggle"
                    data-id="${task._id}">
            </button>
            <div class="task-card__body">
                <h3 class="task-card__title ${isDone ? 'task-card__title--done' : ''}">${escHtml(task.title)}</h3>
                ${task.description ? `<p class="task-card__description">${escHtml(task.description)}</p>` : ''}
                <div class="task-card__meta">
                    ${statusBadge(task.status)}
                    <span class="task-card__date">${formatDate(task.created_at)}</span>
                </div>
            </div>
            <div class="task-card__actions">
                <button class="icon-btn" data-action="edit" data-id="${task._id}" title="Редагувати">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="icon-btn icon-btn--danger" data-action="delete" data-id="${task._id}" title="Видалити">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
            </div>
        `;

        taskList.appendChild(card);
    });
}

function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getFilteredSorted() {
    let list = [...tasks];

    // Filter
    if (currentFilter !== 'all') {
        list = list.filter(t => t.status === currentFilter);
    }

    // Search
    const q = document.getElementById('searchInput').value.toLowerCase().trim();
    if (q) {
        list = list.filter(t =>
            t.title.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q))
        );
    }

    // Sort
    if (currentSort === 'newest') list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    if (currentSort === 'oldest') list.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
    if (currentSort === 'az')     list.sort((a,b) => a.title.localeCompare(b.title));

    return list;
}

function refresh() {
    updateStats();
    renderTasks(getFilteredSorted());
}

// ---- Load tasks ----
async function loadTasks() {
    document.getElementById('loadingState').hidden = false;
    document.getElementById('taskList').innerHTML  = '';
    document.getElementById('emptyState').hidden   = true;

    try {
        tasks = await api.getTasks();
        document.getElementById('loadingState').hidden = true;
        refresh();
    } catch {
        document.getElementById('loadingState').hidden = true;
        toast('Task load was unsuccessful', 'error');
    }
}

// ---- Modal helpers ----
function openModal(task = null) {
    const overlay = document.getElementById('modalOverlay');
    const title   = document.getElementById('modalTitle');
    const form    = document.getElementById('taskForm');

    form.reset();
    document.getElementById('taskTitleError').textContent = '';

    if (task) {
        title.textContent = 'Edit task';
        document.getElementById('taskId').value          = task._id;
        document.getElementById('taskTitle').value       = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskStatus').value      = task.status;
    } else {
        title.textContent = 'Нове завдання';
        document.getElementById('taskId').value = '';
    }

    overlay.hidden = false;
    document.getElementById('taskTitle').focus();
}

function closeModal() {
    document.getElementById('modalOverlay').hidden = true;
}

// ---- Task form submit ----
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('taskTitle');
    const titleError = document.getElementById('taskTitleError');
    titleError.textContent = '';

    const title = titleInput.value.trim();
    if (!title) {
        titleError.textContent = 'Name is required';
        titleInput.focus();
        return;
    }

    const id          = document.getElementById('taskId').value;
    const description = document.getElementById('taskDescription').value.trim();
    const status      = document.getElementById('taskStatus').value;

    const saveBtn = document.getElementById('modalSaveBtn');
    saveBtn.disabled = true;
    saveBtn.querySelector('.btn__text').hidden = true;
    saveBtn.querySelector('.btn__loader').hidden = false;

    try {
        if (id) {
            const updated = await api.updateTask(id, { title, description, status });
            tasks = tasks.map(t => t._id === id ? updated : t);
            toast('Task updated');
        } else {
            const created = await api.createTask({ title, description, status });
            tasks.unshift(created);
            toast('Task created');
        }
        closeModal();
        refresh();
    } catch (err) {
        toast(err.message || 'Save error', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.querySelector('.btn__text').hidden = false;
        saveBtn.querySelector('.btn__loader').hidden = true;
    }
});

// ---- Quick toggle done ----
async function toggleTask(id) {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    const newStatus = task.status === 'Done' ? 'In progress' : 'Done';

    try {
        const updated = await api.updateTask(id, { status: newStatus });
        tasks = tasks.map(t => t._id === id ? updated : t);
        refresh();
    } catch {
        toast('Failed update task', 'error');
    }
}

// ---- Delete ----
function openDeleteModal(id) {
    deleteTarget = id;
    document.getElementById('deleteOverlay').hidden = false;
}

document.getElementById('deleteCancelBtn').addEventListener('click', () => {
    document.getElementById('deleteOverlay').hidden = true;
    deleteTarget = null;
});

document.getElementById('deleteConfirmBtn').addEventListener('click', async () => {
    if (!deleteTarget) return;

    const btn = document.getElementById('deleteConfirmBtn');
    btn.disabled = true;
    btn.querySelector('.btn__text').hidden = true;
    btn.querySelector('.btn__loader').hidden = false;

    try {
        await api.deleteTask(deleteTarget);
        tasks = tasks.filter(t => t._id !== deleteTarget);
        document.getElementById('deleteOverlay').hidden = true;
        deleteTarget = null;
        refresh();
        toast('Task wasdelete');
    } catch {
        toast('Failed to delete task', 'error');
    } finally {
        btn.disabled = false;
        btn.querySelector('.btn__text').hidden = false;
        btn.querySelector('.btn__loader').hidden = true;
    }
});

// ---- Delegated events on task list ----
document.getElementById('taskList').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const id     = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === 'toggle') toggleTask(id);
    if (action === 'edit')   openModal(tasks.find(t => t._id === id));
    if (action === 'delete') openDeleteModal(id);
});

// ---- Add button ----
document.getElementById('addTaskBtn').addEventListener('click', () => openModal());
document.getElementById('emptyAddBtn').addEventListener('click', () => openModal());

// ---- Modal close ----
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        document.getElementById('deleteOverlay').hidden = true;
    }
});
const sidebar  = document.getElementById('sidebar');
const overlay  = document.getElementById('sidebarOverlay');

document.getElementById('menuBtn').addEventListener('click', () => {
    sidebar.classList.add('sidebar--open');
    overlay.classList.add('sidebar-overlay--visible');
});

function closeSidebar() {
    sidebar.classList.remove('sidebar--open');
    overlay.classList.remove('sidebar-overlay--visible');
}

document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// ---- Nav filters ----
document.querySelectorAll('.sidebar__nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.sidebar__nav-item').forEach(i =>
            i.classList.remove('sidebar__nav-item--active')
        );
        item.classList.add('sidebar__nav-item--active');

        currentFilter = item.dataset.filter || 'all';
        const titles  = { all: 'Всі завдання', 'In progress': 'В процесі', 'Done': 'Виконані', 'Pending': 'Очікують' };
        document.getElementById('sectionTitle').textContent = titles[currentFilter] || 'Завдання';

        refresh();
        closeSidebar();
    });
});

document.getElementById('searchInput').addEventListener('input', () => refresh());
document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    refresh();
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await api.logout();
        window.location.href = 'auth.html';
    } catch {
        window.location.href = 'auth.html';
    }
});

(async () => {
    await initUser();
    await loadTasks();
})();