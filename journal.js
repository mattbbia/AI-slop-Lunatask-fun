const journalList = document.querySelector("#journal-list");
const newEntryButton = document.querySelector("#new-entry");
const journalTitleInput = document.querySelector("#journal-title");
const journalDateInput = document.querySelector("#journal-date");
const journalBodyInput = document.querySelector("#journal-body");
const deleteEntryButton = document.querySelector("#delete-entry");
const journalEmptyState = document.querySelector("#journal-empty");
const journalStatus = document.querySelector("#journal-status");
const journalEditor = document.querySelector(".notes-editor");

const JOURNAL_STORAGE_KEY = "simple-todo-journal";

let entries = [];
let activeEntryId = null;

const saveEntries = () => {
  localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
};

const loadEntries = () => {
  const storedEntries = localStorage.getItem(JOURNAL_STORAGE_KEY);
  entries = storedEntries ? JSON.parse(storedEntries) : [];
};

const updateEmptyState = () => {
  journalEmptyState.hidden = entries.length > 0;
};

const setInputsDisabled = (isDisabled) => {
  journalTitleInput.disabled = isDisabled;
  journalDateInput.disabled = isDisabled;
  journalBodyInput.disabled = isDisabled;
  deleteEntryButton.disabled = isDisabled;
};

const formatDate = (value) => {
  if (!value) {
    return "No date";
  }
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const renderJournalList = () => {
  journalList.innerHTML = "";

  entries.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "journal-list__item";
    button.dataset.id = entry.id;
    button.setAttribute(
      "aria-label",
      `Open entry ${entry.title?.trim() || "Untitled entry"}`,
    );

    const dateText = document.createElement("span");
    dateText.className = "journal-list__date";
    dateText.textContent = formatDate(entry.date);

    const titleText = document.createElement("span");
    titleText.className = "journal-list__title";
    titleText.textContent = entry.title?.trim() || "Untitled entry";

    button.append(dateText, titleText);

    if (entry.id === activeEntryId) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      selectEntry(entry.id);
    });

    journalList.appendChild(button);
  });

  updateEmptyState();
};

const updateJournalStatus = () => {
  const now = new Date();
  journalStatus.textContent = `Saved ${now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const selectEntry = (entryId) => {
  const entry = entries.find((item) => item.id === entryId);
  activeEntryId = entry ? entry.id : null;

  if (!entry) {
    journalTitleInput.value = "";
    journalDateInput.value = "";
    journalBodyInput.value = "";
    setInputsDisabled(true);
    renderJournalList();
    return;
  }

  journalTitleInput.value = entry.title;
  journalDateInput.value = entry.date;
  journalBodyInput.value = entry.content;
  setInputsDisabled(false);
  renderJournalList();
};

const createEntry = () => {
  const today = new Date();
  const todayValue = today.toISOString().split("T")[0];

  const newEntry = {
    id: crypto.randomUUID(),
    title: "Untitled entry",
    content: "",
    date: todayValue,
    updatedAt: new Date().toISOString(),
  };

  entries.unshift(newEntry);
  saveEntries();
  selectEntry(newEntry.id);
  updateEmptyState();
};

const updateActiveEntry = () => {
  const entry = entries.find((item) => item.id === activeEntryId);
  if (!entry) {
    return;
  }

  const fallbackDate = new Date().toISOString().split("T")[0];
  entry.title = journalTitleInput.value.trim() || "Untitled entry";
  entry.date = journalDateInput.value || fallbackDate;
  entry.content = journalBodyInput.value;
  entry.updatedAt = new Date().toISOString();
  journalDateInput.value = entry.date;
  saveEntries();
  renderJournalList();
  updateJournalStatus();
};

const deleteActiveEntry = () => {
  if (!activeEntryId) {
    return;
  }

  entries = entries.filter((entry) => entry.id !== activeEntryId);
  const nextEntry = entries[0];
  activeEntryId = null;
  saveEntries();
  renderJournalList();
  updateEmptyState();

  if (nextEntry) {
    selectEntry(nextEntry.id);
  } else {
    journalTitleInput.value = "";
    journalDateInput.value = "";
    journalBodyInput.value = "";
    setInputsDisabled(true);
  }
};

newEntryButton.addEventListener("click", createEntry);
journalTitleInput.addEventListener("input", updateActiveEntry);
journalDateInput.addEventListener("input", updateActiveEntry);
journalBodyInput.addEventListener("input", updateActiveEntry);
deleteEntryButton.addEventListener("click", deleteActiveEntry);

loadEntries();
renderJournalList();
setInputsDisabled(true);
updateEmptyState();
journalEditor.hidden = false;
