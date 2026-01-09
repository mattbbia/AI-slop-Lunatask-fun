const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const emptyState = document.querySelector("#empty-state");
const addButton = document.querySelector("#add-button");
const addPanel = document.querySelector("#add-panel");

const STORAGE_KEY = "simple-todo-tasks";

let tasks = [];

const saveTasks = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const loadTasks = () => {
  const storedTasks = localStorage.getItem(STORAGE_KEY);
  tasks = storedTasks ? JSON.parse(storedTasks) : [];
};

const updateStats = () => {
  const total = tasks.length;
  const completedCount = tasks.filter((task) => task.completed).length;
  taskCount.textContent = `${total} task${total === 1 ? "" : "s"}`;
  clearCompletedButton.disabled = completedCount === 0;
  emptyState.hidden = total > 0;
};

const createTaskElement = (task) => {
  const listItem = document.createElement("li");
  listItem.className = "task-item";
  listItem.dataset.id = task.id;
  if (task.completed) {
    listItem.classList.add("completed");
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `Mark ${task.title} as completed`);

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Edit";
  editButton.className = "ghost";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";

  actions.append(editButton, deleteButton);
  listItem.append(checkbox, title, actions);

  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    listItem.classList.toggle("completed", task.completed);
    saveTasks();
    updateStats();
  });

  editButton.addEventListener("click", () => {
    const updatedTitle = prompt("Update your task", task.title);
    if (!updatedTitle) {
      return;
    }
    task.title = updatedTitle.trim();
    if (!task.title) {
      return;
    }
    title.textContent = task.title;
    saveTasks();
  });

  deleteButton.addEventListener("click", () => {
    tasks = tasks.filter((item) => item.id !== task.id);
    listItem.remove();
    saveTasks();
    updateStats();
  });

  return listItem;
};

const renderTasks = () => {
  taskList.innerHTML = "";
  tasks.forEach((task) => {
    taskList.appendChild(createTaskElement(task));
  });
  updateStats();
};

const addTask = (title) => {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return;
  }

  const newTask = {
    id: crypto.randomUUID(),
    title: trimmedTitle,
    completed: false,
  };

  tasks.unshift(newTask);
  taskList.prepend(createTaskElement(newTask));
  saveTasks();
  updateStats();
};

const clearCompleted = () => {
  tasks = tasks.filter((task) => !task.completed);
  renderTasks();
  saveTasks();
};

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
});

clearCompletedButton.addEventListener("click", clearCompleted);

if (addButton && addPanel) {
  addButton.addEventListener("click", () => {
    const willShow = addPanel.hidden;
    addPanel.hidden = !willShow;
    addButton.setAttribute("aria-expanded", String(willShow));
    if (willShow) {
      taskInput.focus();
    }
  });
}

loadTasks();
renderTasks();
