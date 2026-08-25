const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearBtn = document.getElementById("clearBtn");
const emptyMessage = document.getElementById("emptyMessage");
const filters = document.querySelectorAll(".filter");

const STORAGE_KEY = "smartTodoTasks";
let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createId() {
  return Date.now() + Math.random().toString(16).slice(2);
}

function render() {
  taskList.innerHTML = "";

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.text}`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      render();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const edit = document.createElement("button");
    edit.className = "action edit-btn";
    edit.textContent = "✎";
    edit.title = "Edit task";
    edit.setAttribute("aria-label", "Edit task");
    edit.addEventListener("click", () => editTask(task.id));

    const del = document.createElement("button");
    del.className = "action delete-btn";
    del.textContent = "✕";
    del.title = "Delete task";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", () => deleteTask(task.id));

    actions.append(edit, del);
    li.append(checkbox, text, actions);
    taskList.appendChild(li);
  });

  const remaining = tasks.filter(task => !task.completed).length;
  taskCount.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;

  emptyMessage.classList.toggle("hidden", visibleTasks.length !== 0);
}

function addTask() {
  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.push({
    id: createId(),
    text,
    completed: false
  });

  saveTasks();
  taskInput.value = "";
  render();
  taskInput.focus();
}

function editTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  const updated = prompt("Edit your task:", task.text);
  if (updated === null) return;

  const text = updated.trim();
  if (!text) return;

  task.text = text;
  saveTasks();
  render();
}

function deleteTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  if (confirm(`Delete "${task.text}"?`)) {
    tasks = tasks.filter(item => item.id !== id);
    saveTasks();
    render();
  }
}

function clearCompleted() {
  const completedCount = tasks.filter(task => task.completed).length;

  if (completedCount === 0) {
    alert("There are no completed tasks to clear.");
    return;
  }

  if (confirm(`Delete ${completedCount} completed task(s)?`)) {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    render();
  }
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", event => {
  if (event.key === "Enter") addTask();
});

clearBtn.addEventListener("click", clearCompleted);

filters.forEach(button => {
  button.addEventListener("click", () => {
    filters.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    render();
  });
});

render();
