const notesList = document.querySelector("#notes-list");
const newNoteButton = document.querySelector("#new-note");
const noteTitleInput = document.querySelector("#note-title");
const noteBodyInput = document.querySelector("#note-body");
const deleteNoteButton = document.querySelector("#delete-note");
const notesEmptyState = document.querySelector("#notes-empty");
const noteStatus = document.querySelector("#note-status");
const notesEditor = document.querySelector(".notes-editor");
const notesPlaceholder = document.querySelector("#notes-placeholder");

const NOTES_STORAGE_KEY = "simple-todo-notes";

let notes = [];
let activeNoteId = null;

const saveNotes = () => {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
};

const loadNotes = () => {
  const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
  notes = storedNotes ? JSON.parse(storedNotes) : [];
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

newNoteButton.addEventListener("click", createNote);
noteTitleInput.addEventListener("input", updateActiveNote);
noteBodyInput.addEventListener("input", updateActiveNote);
deleteNoteButton.addEventListener("click", deleteActiveNote);

loadNotes();
renderNotesList();
setNoteInputsDisabled(true);
updateNotesEmptyState();
updateEditorVisibility();
