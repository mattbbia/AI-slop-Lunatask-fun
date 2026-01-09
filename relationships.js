const relationshipForm = document.querySelector("#relationship-form");
const nameInput = document.querySelector("#person-name");
const roleInput = document.querySelector("#person-role");
const touchInput = document.querySelector("#person-touch");
const relationshipGrid = document.querySelector("#relationship-grid");
const relationshipCount = document.querySelector("#relationship-count");
const emptyState = document.querySelector("#relationships-empty");

const modal = document.querySelector("#relationship-modal");
const modalName = document.querySelector("#modal-name");
const closeModalButton = document.querySelector("#close-modal");
const detailForm = document.querySelector("#relationship-detail-form");
const detailNickname = document.querySelector("#detail-nickname");
const detailLocation = document.querySelector("#detail-location");
const detailBirthday = document.querySelector("#detail-birthday");
const detailFrequency = document.querySelector("#detail-frequency");
const detailNotes = document.querySelector("#detail-notes");
const detailNext = document.querySelector("#detail-next");

const STORAGE_KEY = "simple-relationships";

let relationships = [];
let activeRelationshipId = null;

const saveRelationships = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(relationships));
};

const loadRelationships = () => {
  const storedRelationships = localStorage.getItem(STORAGE_KEY);
  relationships = storedRelationships ? JSON.parse(storedRelationships) : [];
};

const updateSummary = () => {
  const total = relationships.length;
  const label = total === 1 ? "person" : "people";
  relationshipCount.textContent = `${total} ${label}`;
  emptyState.hidden = total > 0;
};

const getInitials = (name) => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const openModal = (relationship) => {
  activeRelationshipId = relationship.id;
  modalName.textContent = relationship.name;
  detailNickname.value = relationship.details.nickname ?? "";
  detailLocation.value = relationship.details.location ?? "";
  detailBirthday.value = relationship.details.birthday ?? "";
  detailFrequency.value = relationship.details.frequency ?? "";
  detailNotes.value = relationship.details.notes ?? "";
  detailNext.value = relationship.details.next ?? "";
  modal.hidden = false;
  detailNickname.focus();
};

const closeModal = () => {
  modal.hidden = true;
  activeRelationshipId = null;
};

const createRelationshipCard = (relationship) => {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "relationship-card";

  const thumbnail = document.createElement("div");
  thumbnail.className = "relationship-thumbnail";
  thumbnail.textContent = getInitials(relationship.name);

  const meta = document.createElement("div");
  meta.className = "relationship-meta";

  const name = document.createElement("p");
  name.className = "relationship-name";
  name.textContent = relationship.name;

  const role = document.createElement("p");
  role.className = "relationship-role";
  role.textContent = `${relationship.role} · Last connected ${relationship.lastContact}`;

  const status = document.createElement("span");
  status.className = "relationship-status";
  status.textContent = "Profile complete";

  meta.append(name, role, status);
  card.append(thumbnail, meta);

  card.addEventListener("click", () => {
    const selected = relationships.find((item) => item.id === relationship.id);
    if (selected) {
      openModal(selected);
    }
  });

  return card;
};

const renderRelationships = () => {
  relationshipGrid.innerHTML = "";
  relationships.forEach((relationship) => {
    relationshipGrid.appendChild(createRelationshipCard(relationship));
  });
  updateSummary();
};

const addRelationship = (name, role, lastContact) => {
  const trimmedName = name.trim();
  const trimmedRole = role.trim();
  if (!trimmedName || !trimmedRole || !lastContact) {
    return;
  }

  const newRelationship = {
    id: crypto.randomUUID(),
    name: trimmedName,
    role: trimmedRole,
    lastContact,
    details: {
      nickname: "",
      location: "",
      birthday: "",
      frequency: "",
      notes: "",
      next: "",
    },
  };

  relationships.unshift(newRelationship);
  relationshipGrid.prepend(createRelationshipCard(newRelationship));
  saveRelationships();
  updateSummary();
};

relationshipForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addRelationship(nameInput.value, roleInput.value, touchInput.value);
  relationshipForm.reset();
  nameInput.focus();
});

closeModalButton.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) {
    closeModal();
  }
});

detailForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const selected = relationships.find((item) => item.id === activeRelationshipId);
  if (!selected) {
    return;
  }
  selected.details = {
    nickname: detailNickname.value.trim(),
    location: detailLocation.value.trim(),
    birthday: detailBirthday.value,
    frequency: detailFrequency.value.trim(),
    notes: detailNotes.value.trim(),
    next: detailNext.value.trim(),
  };
  saveRelationships();
  closeModal();
});

loadRelationships();
renderRelationships();
