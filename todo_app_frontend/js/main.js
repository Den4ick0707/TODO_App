// ============================================
// MAIN — логіка index.html
// ============================================
if (document.getElementById('taskList')) {

    let tasks         = [];
    let currentFilter = 'all';
    let currentSort   = 'newest';
    let deleteTarget  = null;

    function toast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const el = document.createElement('div');
        el.className = `toast toast--${type}`;
        el.innerHTML = `<span class="toast__dot"></span><span>${message}</span>`;
        container.appendChild(el);
        setTimeout(() => {
            el.classList.add('toast--hide');
            setTimeout(() => el.remove(), 300);
        }, 3000);
    }

    async function initUser() {
        try {
            const user = await api.getMe();
            document.getElementById('userName').textContent   = user.username;
            document.getElementById('userEmail').textContent  = user.email;
            document.getElementById('userAvatar').textContent = user.username[0].toUpperCase();
        } catch {
            window.location.href = '/pages/auth.html';
        }
    }

    function updateStats() {
        document.getElementById('statTotal').textContent    = tasks.length;
        document.getElementById('statProgress').textContent = tasks.filter(t => t.status === 'In progress').length;
        document.getElementById('statDone').textContent     = tasks.filter(t => t.status === 'Done').length;
        document.getElementById('statPending').textContent  = tasks.filter(t => t.status === 'Pending').length;
    }

    function escHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
            const card   = document.createElement('div');
            card.className = 'task-card';
            card.innerHTML = `
                <button class="task-card__check ${isDone ? 'task-card__check--done' : ''}" data-action="toggle" data-id="${task._id}"></button>
                <div class="task-card__body">
                    <h3 class="task-card__title ${isDone ? 'task-card__title--done' : ''}">${escHtml(task.title)}</h3>
                    ${task.description ? `<p class="task-card__description">${escHtml(task.description)}</p>` : ''}
                    <div class="task-card__meta">
                        <span class="badge badge--${task.status === 'Done' ? 'done' : task.status === 'Pending' ? 'pending' : 'progress'}">${task.status}</span>
                    </div>
                </div>
                <div class="task-card__actions">
                    <button class="icon-btn" data-action="edit" data-id="${task._id}">✎</button>
                    <button class="icon-btn icon-btn--danger" data-action="delete" data-id="${task._id}">🗑</button>
                </div>
            `;
            taskList.appendChild(card);
        });
    }

    function refresh() {
        let list = [...tasks];
        if (currentFilter !== 'all') list = list.filter(t => t.status === currentFilter);
        const q = document.getElementById('searchInput').value.toLowerCase().trim();
        if (q) list = list.filter(t => t.title.toLowerCase().includes(q));

        if (currentSort === 'newest') list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        if (currentSort === 'az') list.sort((a,b) => a.title.localeCompare(b.title));

        updateStats();
        renderTasks(list);
    }

    async function loadTasks() {
        try {
            tasks = await api.getTasks();
            refresh();
        } catch { toast('Помилка завантаження', 'error'); }
    }

    // Modal logic (Add/Edit)
    const modal = {
        overlay: document.getElementById('modalOverlay'),
        open: (task = null) => {
            document.getElementById('taskForm').reset();
            document.getElementById('taskId').value = task ? task._id : '';
            document.getElementById('modalTitle').textContent = task ? 'Edit task' : 'Нове завдання';
            if (task) {
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDescription').value = task.description || '';
                document.getElementById('taskStatus').value = task.status;
            }
            modal.overlay.hidden = false;
        },
        close: () => modal.overlay.hidden = true
    };

    document.getElementById('taskForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('taskId').value;
        const data = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            status: document.getElementById('taskStatus').value
        };

        try {
            if (id) {
                const updated = await api.updateTask(id, data);
                tasks = tasks.map(t => t._id === id ? updated : t);
            } else {
                const created = await api.createTask(data);
                tasks.unshift(created);
            }
            modal.close();
            refresh();
            toast('Збережено');
        } catch { toast('Помилка збереження', 'error'); }
    });

    // Actions delegation
    document.getElementById('taskList').addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;

        if (action === 'delete') {
            deleteTarget = id;
            document.getElementById('deleteOverlay').hidden = false;
        } else if (action === 'edit') {
            modal.open(tasks.find(t => t._id === id));
        } else if (action === 'toggle') {
            const t = tasks.find(x => x._id === id);
            const updated = await api.updateTask(id, { status: t.status === 'Done' ? 'In progress' : 'Done' });
            tasks = tasks.map(x => x._id === id ? updated : x);
            refresh();
        }
    });

    document.getElementById('deleteConfirmBtn').addEventListener('click', async () => {
        if (!deleteTarget) return;
        try {
            await api.deleteTask(deleteTarget);
            tasks = tasks.filter(t => t._id !== deleteTarget);
            document.getElementById('deleteOverlay').hidden = true;
            refresh();
            toast('Видалено');
        } catch { toast('Помилка', 'error'); }
    });

    document.getElementById('addTaskBtn').addEventListener('click', () => modal.open());
    document.getElementById('modalCancelBtn').addEventListener('click', modal.close);
    document.getElementById('deleteCancelBtn').addEventListener('click', () => document.getElementById('deleteOverlay').hidden = true);

    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebar = () => {
        sidebar.classList.remove('sidebar--open');
        sidebarOverlay.classList.remove('sidebar-overlay--visible');
    };

    document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    document.getElementById('menuBtn').addEventListener('click', () => {
        sidebar.classList.add('sidebar--open');
        sidebarOverlay.classList.add('sidebar-overlay--visible');
    });

    document.querySelectorAll('.sidebar__nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar__nav-item').forEach(i => i.classList.remove('sidebar__nav-item--active'));
            item.classList.add('sidebar__nav-item--active');
            currentFilter = item.dataset.filter || 'all';
            const titles = { all: 'Всі завдання', 'In progress': 'В процесі', 'Done': 'Виконані', 'Pending': 'Очікують' };
            document.getElementById('sectionTitle').textContent = titles[currentFilter] || 'Завдання';
            refresh();
            closeSidebar();
        });
    });

    document.getElementById('searchInput').addEventListener('input', refresh);
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentSort = e.target.value;
        refresh();
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try { await api.logout(); } catch (_) {}
        window.location.href = '/pages/auth.html';
    });

    (async () => {
        await initUser();
        await loadTasks();
    })();
}