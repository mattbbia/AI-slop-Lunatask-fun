const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const emptyState = document.querySelector("#empty-state");
const tabButtons = document.querySelectorAll(".tab");
const pages = document.querySelectorAll("[data-page]");
const notesList = document.querySelector("#notes-list");
const newNoteButton = document.querySelector("#new-note");
const noteTitleInput = document.querySelector("#note-title");
const noteBodyInput = document.querySelector("#note-body");
const deleteNoteButton = document.querySelector("#delete-note");
const notesEmptyState = document.querySelector("#notes-empty");
const noteStatus = document.querySelector("#note-status");
const notesEditor = document.querySelector(".notes-editor");
const notesPlaceholder = document.querySelector("#notes-placeholder");

const STORAGE_KEY = "simple-todo-tasks";
const NOTES_STORAGE_KEY = "simple-todo-notes";

let tasks = [];
let notes = [];
let activeNoteId = null;

const saveTasks = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const loadTasks = () => {
  const storedTasks = localStorage.getItem(STORAGE_KEY);
  tasks = storedTasks ? JSON.parse(storedTasks) : [];
};

const saveNotes = () => {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
};

const loadNotes = () => {
  const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
  notes = storedNotes ? JSON.parse(storedNotes) : [];
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

const setActiveTab = (tabName) => {
  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tabName);
  });

  pages.forEach((page) => {
    page.hidden = page.dataset.page !== tabName;
  });
};

const updateNotesEmptyState = () => {
  notesEmptyState.hidden = notes.length > 0;
};

const setNoteInputsDisabled = (isDisabled) => {
  noteTitleInput.disabled = isDisabled;
  noteBodyInput.disabled = isDisabled;
  deleteNoteButton.disabled = isDisabled;
};

const updateEditorVisibility = () => {
  const shouldShowEditor = Boolean(activeNoteId);
  notesEditor.hidden = !shouldShowEditor;
  notesPlaceholder.hidden = shouldShowEditor;
};

const renderNotesList = () => {
  notesList.innerHTML = "";

  notes.forEach((note) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "notes-list__item";
    button.textContent = note.title?.trim() || "Untitled note";
    button.dataset.id = note.id;
    button.setAttribute(
      "aria-label",
      `Open note ${note.title?.trim() || "Untitled note"}`,
    );
    if (note.id === activeNoteId) {
      button.classList.add("is-active");
    }
    button.addEventListener("click", () => {
      selectNote(note.id);
    });
    notesList.appendChild(button);
  });

  updateNotesEmptyState();
};

const updateNoteStatus = () => {
  const now = new Date();
  noteStatus.textContent = `Saved ${now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const selectNote = (noteId) => {
  const note = notes.find((item) => item.id === noteId);
  activeNoteId = note ? note.id : null;

  if (!note) {
    noteTitleInput.value = "";
    noteBodyInput.value = "";
    setNoteInputsDisabled(true);
    updateEditorVisibility();
    renderNotesList();
    return;
  }

  noteTitleInput.value = note.title;
  noteBodyInput.value = note.content;
  setNoteInputsDisabled(false);
  updateEditorVisibility();
  renderNotesList();
};

const createNote = () => {
  const newNote = {
    id: crypto.randomUUID(),
    title: "Untitled note",
    content: "",
    updatedAt: new Date().toISOString(),
  };

  notes.unshift(newNote);
  saveNotes();
  selectNote(newNote.id);
  updateNotesEmptyState();
  updateEditorVisibility();
};

const updateActiveNote = () => {
  const note = notes.find((item) => item.id === activeNoteId);
  if (!note) {
    return;
  }

  note.title = noteTitleInput.value.trim() || "Untitled note";
  note.content = noteBodyInput.value;
  note.updatedAt = new Date().toISOString();
  saveNotes();
  renderNotesList();
  updateNoteStatus();
};

const deleteActiveNote = () => {
  if (!activeNoteId) {
    return;
  }

  notes = notes.filter((note) => note.id !== activeNoteId);
  const nextNote = notes[0];
  activeNoteId = null;
  saveNotes();
  renderNotesList();
  updateNotesEmptyState();

  if (nextNote) {
    selectNote(nextNote.id);
  } else {
    noteTitleInput.value = "";
    noteBodyInput.value = "";
    setNoteInputsDisabled(true);
    updateEditorVisibility();
  }
};

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
});

clearCompletedButton.addEventListener("click", clearCompleted);
newNoteButton.addEventListener("click", createNote);
noteTitleInput.addEventListener("input", updateActiveNote);
noteBodyInput.addEventListener("input", updateActiveNote);
deleteNoteButton.addEventListener("click", deleteActiveNote);

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab);
  });
});

loadTasks();
renderTasks();
loadNotes();
renderNotesList();
setNoteInputsDisabled(notes.length === 0);
updateNotesEmptyState();
updateEditorVisibility();
setActiveTab("tasks");
