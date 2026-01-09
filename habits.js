const habitForm = document.querySelector("#habit-form");
const habitInput = document.querySelector("#habit-input");
const habitList = document.querySelector("#habit-list");
const habitsEmpty = document.querySelector("#habits-empty");
const habitsRange = document.querySelector("#habits-range");
const addButton = document.querySelector("#add-button");
const addPanel = document.querySelector("#add-panel");

const STORAGE_KEY = "simple-todo-habits";
const DAYS_TO_SHOW = 7;

let habits = [];

const formatDateKey = (date) => date.toISOString().split("T")[0];
const parseDateKey = (key) => new Date(`${key}T00:00:00`);

const getRecentDates = () => {
  const today = new Date();
  return Array.from({ length: DAYS_TO_SHOW }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (DAYS_TO_SHOW - 1 - index));
    return date;
  });
};

const saveHabits = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
};

const loadHabits = () => {
  const storedHabits = localStorage.getItem(STORAGE_KEY);
  habits = storedHabits ? JSON.parse(storedHabits) : [];
};

const calculateStreak = (habit, todayKey) => {
  if (!habit.completions?.[todayKey]) {
    return 0;
  }

  let streak = 0;
  const currentDate = parseDateKey(todayKey);
  while (true) {
    const key = formatDateKey(currentDate);
    if (!habit.completions?.[key]) {
      break;
    }
    streak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  return streak;
};

const renderHabitsRange = () => {
  const dates = getRecentDates();
  const start = dates[0];
  const end = dates[dates.length - 1];
  const options = { month: "short", day: "numeric" };
  habitsRange.textContent = `${start.toLocaleDateString(undefined, options)}–${end.toLocaleDateString(
    undefined,
    options,
  )}`;
};

const createHabitElement = (habit) => {
  const container = document.createElement("div");
  container.className = "habit-item";
  container.dataset.id = habit.id;

  const name = document.createElement("h3");
  name.className = "habit-name";
  name.textContent = habit.name;

  const track = document.createElement("div");
  track.className = "habit-track";

  const todayKey = formatDateKey(new Date());
  const dates = getRecentDates();

  dates.forEach((date) => {
    const key = formatDateKey(date);
    const dayButton = document.createElement("button");
    dayButton.type = "button";
    dayButton.className = "habit-day";
    dayButton.title = date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    dayButton.dataset.date = key;

    if (habit.completions?.[key]) {
      dayButton.classList.add("is-complete");
    }

    dayButton.addEventListener("click", () => {
      habit.completions = habit.completions || {};
      habit.completions[key] = !habit.completions[key];
      saveHabits();
      renderHabits();
    });

    track.appendChild(dayButton);
  });

  const streak = document.createElement("div");
  streak.className = "habit-streak";
  const streakCount = calculateStreak(habit, todayKey);
  streak.innerHTML = `<span class="habit-streak__count">${streakCount}</span> day${
    streakCount === 1 ? "" : "s"
  }`;

  container.append(name, track, streak);
  return container;
};

const renderHabits = () => {
  habitList.innerHTML = "";
  habits.forEach((habit) => {
    habitList.appendChild(createHabitElement(habit));
  });
  habitsEmpty.hidden = habits.length > 0;
  renderHabitsRange();
};

const addHabit = (name) => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return;
  }

  const habit = {
    id: crypto.randomUUID(),
    name: trimmedName,
    completions: {},
  };

  habits.unshift(habit);
  saveHabits();
  renderHabits();
};

habitForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addHabit(habitInput.value);
  habitInput.value = "";
  habitInput.focus();
});

if (addButton && addPanel) {
  addButton.addEventListener("click", () => {
    const willShow = addPanel.hidden;
    addPanel.hidden = !willShow;
    addButton.setAttribute("aria-expanded", String(willShow));
    if (willShow) {
      habitInput.focus();
    }
  });
}

loadHabits();
renderHabits();
