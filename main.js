import './style.css'

const STORAGE_KEY = 'todo-app:tasks'

const PRIORITIES = {
  high: { label: '高', color: 'high' },
  medium: { label: '中', color: 'medium' },
  low: { label: '低', color: 'low' },
}

const app = document.querySelector('#app')

const state = {
  tasks: loadTasks(),
  filter: 'all', // all | active | completed
  editingId: null,
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks))
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function addTask(text, priority) {
  const trimmed = text.trim()
  if (!trimmed) return
  state.tasks.unshift({
    id: uid(),
    text: trimmed,
    done: false,
    priority: PRIORITIES[priority] ? priority : 'medium',
  })
  saveTasks()
  render()
}

function toggleTask(id) {
  const t = state.tasks.find((t) => t.id === id)
  if (t) {
    t.done = !t.done
    saveTasks()
    render()
  }
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id)
  if (state.editingId === id) state.editingId = null
  saveTasks()
  render()
}

function updateTask(id, text, priority) {
  const t = state.tasks.find((t) => t.id === id)
  if (!t) return
  const trimmed = text.trim()
  if (!trimmed) return
  t.text = trimmed
  t.priority = PRIORITIES[priority] ? priority : t.priority
  state.editingId = null
  saveTasks()
  render()
}

function setPriority(id, priority) {
  const t = state.tasks.find((t) => t.id === id)
  if (t && PRIORITIES[priority]) {
    t.priority = priority
    saveTasks()
    render()
  }
}

function startEdit(id) {
  state.editingId = id
  render()
}

function cancelEdit() {
  state.editingId = null
  render()
}

function clearCompleted() {
  if (!state.tasks.some((t) => t.done)) return
  state.tasks = state.tasks.filter((t) => !t.done)
  saveTasks()
  render()
}

function clearAll() {
  if (state.tasks.length === 0) return
  if (!confirm(`确定要清空全部 ${state.tasks.length} 个任务吗？此操作不可撤销。`)) return
  state.tasks = []
  state.editingId = null
  saveTasks()
  render()
}

function setFilter(f) {
  state.filter = f
  render()
}

function visibleTasks() {
  if (state.filter === 'active') return state.tasks.filter((t) => !t.done)
  if (state.filter === 'completed') return state.tasks.filter((t) => t.done)
  return state.tasks
}

const checkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
const trashIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`
const editIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`
const saveIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
const closeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`

function render() {
  const activeCount = state.tasks.filter((t) => !t.done).length
  const doneCount = state.tasks.filter((t) => t.done).length
  const tasks = visibleTasks()

  app.innerHTML = `
    <div class="app-card">
      <header class="app-header">
        <h1 class="app-title">
          <span class="icon">📋</span>
          我的待办清单
        </h1>
        <p class="app-subtitle">新的一天，从记录每一件值得完成的事开始</p>
      </header>

      <form class="input-row" id="todo-form">
        <input class="task-input" id="task-input" type="text" placeholder="今天要做什么？" maxlength="200" autocomplete="off" />
        <select class="priority-select" id="priority-select" aria-label="优先级">
          <option value="high">高优先级</option>
          <option value="medium" selected>中优先级</option>
          <option value="low">低优先级</option>
        </select>
        <button class="add-btn" type="submit">
          <span>➕</span>
          <span class="btn-label">添加任务</span>
        </button>
      </form>

      <div class="stats">
        <div class="stat">
          <span class="label">未完成</span>
          <span class="value">${activeCount}</span>
        </div>
        <div class="stat completed">
          <span class="label">已完成</span>
          <span class="value">${doneCount}</span>
        </div>
      </div>

      <div class="filters">
        <button class="filter-btn ${state.filter === 'all' ? 'active' : ''}" data-filter="all">全部</button>
        <button class="filter-btn ${state.filter === 'active' ? 'active' : ''}" data-filter="active">进行中</button>
        <button class="filter-btn ${state.filter === 'completed' ? 'active' : ''}" data-filter="completed">已完成</button>
      </div>

      <ul class="task-list" id="task-list">
        ${tasks.length === 0 ? emptyState() : tasks.map(taskHtml).join('')}
      </ul>

      ${(doneCount > 0 || state.tasks.length > 0) ? `
        <div class="clear-row">
          ${doneCount > 0 ? `<button class="clear-btn" id="clear-completed">🗑️ 清空已完成 (${doneCount})</button>` : ''}
          ${state.tasks.length > 0 ? `<button class="clear-btn danger" id="clear-all">⚠️ 全部清空 (${state.tasks.length})</button>` : ''}
        </div>
      ` : ''}
    </div>
  `

  bindEvents()
}

function emptyState() {
  const msg =
    state.filter === 'completed'
      ? '还没有已完成的任务，加油吧！'
      : state.filter === 'active'
      ? '没有进行中的任务，太棒了！'
      : '还没有任务，添加第一个吧 ✨'
  return `
    <div class="empty">
      <div class="empty-icon">📝</div>
      <p>${msg}</p>
    </div>
  `
}

function priorityBadge(p) {
  const pr = PRIORITIES[p] || PRIORITIES.medium
  return `<span class="priority-badge ${pr.color}" data-action="cycle-priority" title="点击切换优先级">${pr.label}</span>`
}

function priorityOptions(selected) {
  return Object.keys(PRIORITIES)
    .map(
      (k) =>
        `<option value="${k}" ${k === selected ? 'selected' : ''}>${PRIORITIES[k].label}优先级</option>`
    )
    .join('')
}

function taskHtml(t) {
  if (state.editingId === t.id) {
    return `
      <li class="task-item editing" data-id="${t.id}">
        <input class="edit-input" id="edit-input" type="text" value="${escapeAttr(t.text)}" maxlength="200" autocomplete="off" />
        <select class="priority-select small" id="edit-priority" aria-label="优先级">
          ${priorityOptions(t.priority || 'medium')}
        </select>
        <button class="icon-btn save" data-action="save" aria-label="保存">${saveIcon}</button>
        <button class="icon-btn cancel" data-action="cancel" aria-label="取消">${closeIcon}</button>
      </li>
    `
  }
  return `
    <li class="task-item ${t.done ? 'completed' : ''} priority-${t.priority || 'medium'}" data-id="${t.id}">
      <span class="checkbox" data-action="toggle" role="checkbox" aria-checked="${t.done}" tabindex="0">${checkIcon}</span>
      ${priorityBadge(t.priority || 'medium')}
      <span class="task-text" data-action="edit">${escapeHtml(t.text)}</span>
      <button class="icon-btn edit" data-action="edit-btn" aria-label="编辑任务">${editIcon}</button>
      <button class="icon-btn delete" data-action="delete" aria-label="删除任务">${trashIcon}</button>
    </li>
  `
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
function escapeAttr(s) {
  return escapeHtml(s)
}

const PRIORITY_CYCLE = { high: 'medium', medium: 'low', low: 'high' }

function bindEvents() {
  const form = app.querySelector('#todo-form')
  const input = app.querySelector('#task-input')
  const prioritySelect = app.querySelector('#priority-select')
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    addTask(input.value, prioritySelect.value)
  })

  app.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter))
  })

  app.querySelectorAll('.task-item').forEach((item) => {
    const id = item.dataset.id
    if (item.classList.contains('editing')) {
      const editInput = item.querySelector('#edit-input')
      const editPriority = item.querySelector('#edit-priority')
      item.querySelector('[data-action="save"]').addEventListener('click', () =>
        updateTask(id, editInput.value, editPriority.value)
      )
      item.querySelector('[data-action="cancel"]').addEventListener('click', cancelEdit)
      editInput.focus()
      editInput.setSelectionRange(editInput.value.length, editInput.value.length)
      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') updateTask(id, editInput.value, editPriority.value)
        if (e.key === 'Escape') cancelEdit()
      })
      return
    }

    item.querySelector('[data-action="toggle"]').addEventListener('click', () => toggleTask(id))
    item.querySelector('[data-action="delete"]').addEventListener('click', () => deleteTask(id))
    item.querySelector('[data-action="edit-btn"]').addEventListener('click', () => startEdit(id))
    item.querySelector('[data-action="edit"]').addEventListener('dblclick', () => startEdit(id))
    item.querySelector('[data-action="cycle-priority"]').addEventListener('click', () => {
      const t = state.tasks.find((t) => t.id === id)
      if (t) setPriority(id, PRIORITY_CYCLE[t.priority || 'medium'])
    })
  })

  const clearBtn = app.querySelector('#clear-completed')
  if (clearBtn) clearBtn.addEventListener('click', clearCompleted)
  const clearAllBtn = app.querySelector('#clear-all')
  if (clearAllBtn) clearAllBtn.addEventListener('click', clearAll)

  input?.focus()
}

render()
