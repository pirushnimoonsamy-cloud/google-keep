const noteForm = document.getElementById("note-form");

const titleInput = document.getElementById("note-title");
const contentInput = document.getElementById("note-content");
const reminderInput = document.getElementById("note-reminder");

const notesContainer = document.getElementById("notes-container");
const emptyState = document.getElementById("empty-state");

const searchInput = document.getElementById("search-input");
const clearSearch = document.getElementById("clear-search");

const colorButtons = document.querySelectorAll("#note-form .color-option");

const menuButton = document.getElementById("menu-button");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("mobile-overlay");

const refreshButton = document.getElementById("refresh-button");

const pageTitle = document.getElementById("page-title");

const sidebarItems = document.querySelectorAll(".sidebar-item");


let selectedColor = "default";

let currentView = "notes";

let notes =
  JSON.parse(localStorage.getItem("keepNotes")) || [];

let deletedNotes =
  JSON.parse(localStorage.getItem("keepDeletedNotes")) || [];


// ------------------------------------
// COLOUR CODING
// Manual custom feature
// ------------------------------------

colorButtons.forEach((button) => {

  button.addEventListener("click", () => {

    selectedColor = button.dataset.color;

    colorButtons.forEach((item) => {
      item.classList.remove("selected");
    });

    button.classList.add("selected");

  });

});


// ------------------------------------
// ADD NOTE
// ------------------------------------

noteForm.addEventListener("submit", (event) => {

  event.preventDefault();

  const title = titleInput.value.trim();

  const content = contentInput.value.trim();

  const reminder = reminderInput.value;


  if (!title && !content) {
    return;
  }


  const newNote = {

    id: Date.now(),

    title: title || "Untitled note",

    content: content,

    color: selectedColor,

    archived: false,

    reminder: reminder

  };


  notes.unshift(newNote);


  saveNotes();

  renderNotes();


  titleInput.value = "";

  contentInput.value = "";

  reminderInput.value = "";


  selectedColor = "default";


  colorButtons.forEach((button) => {

    button.classList.remove("selected");

  });


  document
    .querySelector('#note-form [data-color="default"]')
    .classList.add("selected");

});


// ------------------------------------
// DISPLAY NOTES
// ------------------------------------

function renderNotes() {

  const searchTerm =
    searchInput.value.toLowerCase().trim();


  let notesToShow = [];


  // Notes

  if (currentView === "notes") {

    notesToShow =
      notes.filter((note) => !note.archived);

  }


  // Archive

  else if (currentView === "archive") {

    notesToShow =
      notes.filter((note) => note.archived);

  }


  // Trash

  else if (currentView === "trash") {

    notesToShow = deletedNotes;

  }


  // Reminders

  else if (currentView === "reminders") {

    notesToShow =
      notes.filter((note) => note.reminder && !note.archived);

  }


  // Search notes

  if (searchTerm) {

    notesToShow = notesToShow.filter((note) => {

      return (

        note.title
          .toLowerCase()
          .includes(searchTerm)

        ||

        note.content
          .toLowerCase()
          .includes(searchTerm)

      );

    });

  }


  notesContainer.innerHTML = "";


  // ------------------------------------
  // LABELS PLACEHOLDER
  // ------------------------------------

  if (currentView === "edit-labels") {

    showEmptyState(
      "bi-pencil",
      "Labels",
      "Label management is not part of this version."
    );

    return;

  }


  // ------------------------------------
  // NO NOTES
  // ------------------------------------

  if (notesToShow.length === 0) {

    if (searchTerm) {

      showEmptyState(
        "bi-search",
        "No matching notes",
        "Try a different search."
      );

    }

    else if (currentView === "archive") {

      showEmptyState(
        "bi-archive",
        "Your archive is empty",
        "Archived notes will appear here."
      );

    }

    else if (currentView === "trash") {

      showEmptyState(
        "bi-trash",
        "Your trash is empty",
        "Deleted notes will be moved here."
      );

    }

    else if (currentView === "reminders") {

      showEmptyState(
        "bi-bell",
        "No reminders yet",
        "Add a date and time when you create a note."
      );

    }

    else {

      showEmptyState(
        "bi-lightbulb",
        "Your notes appear here",
        "Create your first note above."
      );

    }

    return;

  }


  emptyState.style.display = "none";


  // ------------------------------------
  // CREATE NOTE CARDS
  // ------------------------------------

  notesToShow.forEach((note) => {

    const card =
      document.createElement("article");


    card.className =
      `note-card ${note.color}`;

    card.dataset.id = note.id;


    card.innerHTML = `

      <h2 class="note-title"></h2>

      <p class="note-content"></p>

      ${
        note.reminder
          ? `
            <p class="note-reminder">
              <i class="bi bi-bell"></i>
              <span class="reminder-text"></span>
            </p>
          `
          : ""
      }

      <div class="note-tools">

        ${
          currentView !== "trash"
            ? `
              <button
                class="note-action edit-note"
                type="button"
                title="Edit"
                aria-label="Edit"
                draggable="false"
              >
                <i class="bi bi-pencil"></i>
              </button>

              <button
                class="note-action archive-note"
                type="button"
                title="Archive"
                aria-label="Archive"
                draggable="false"
              >
                <i class="bi bi-archive"></i>
              </button>
            `
            : ""
        }

        <button
          class="note-action delete-note"
          type="button"
          title="Delete"
          aria-label="Delete"
          draggable="false"
        >
          <i class="bi bi-trash"></i>
        </button>

      </div>

    `;


    card.querySelector(".note-title").textContent =
      note.title;


    card.querySelector(".note-content").textContent =
      note.content;


    if (note.reminder) {

      card.querySelector(".reminder-text").textContent =
        formatReminder(note.reminder);

    }


    // ------------------------------------
    // DELETE NOTE
    // ------------------------------------

    const deleteButton =
      card.querySelector(".delete-note");


    deleteButton.addEventListener("click", () => {

      // Permanently delete from Trash

      if (currentView === "trash") {

        deletedNotes =
          deletedNotes.filter(
            (item) => item.id !== note.id
          );


        localStorage.setItem(
          "keepDeletedNotes",
          JSON.stringify(deletedNotes)
        );

      }


      // Move note to Trash

      else {

        notes =
          notes.filter(
            (item) => item.id !== note.id
          );


        deletedNotes.unshift(note);


        saveNotes();


        localStorage.setItem(
          "keepDeletedNotes",
          JSON.stringify(deletedNotes)
        );

      }


      renderNotes();

    });


    // ------------------------------------
    // ARCHIVE NOTE
    // ------------------------------------

    const archiveButton =
      card.querySelector(".archive-note");


    if (archiveButton) {

      archiveButton.addEventListener("click", () => {

        note.archived = !note.archived;

        saveNotes();

        renderNotes();

      });

    }


    // ------------------------------------
    // EDIT NOTE
    // ------------------------------------

    if (currentView !== "trash") {

      card.addEventListener("click", (event) => {

        if (ignoreNextCardClick) {
          return;
        }


        if (event.target.closest(".note-action")) {
          return;
        }


        openEditModal(note);

      });


      card.querySelector(".edit-note")
        .addEventListener("click", () => {

          openEditModal(note);

        });

    }


    setupNoteDrag(card);


    notesContainer.appendChild(card);

  });

}


// ------------------------------------
// DRAG AND DROP
// Reorder active notes only
// ------------------------------------

let draggedCard = null;

let dragPlaceholderTimer = null;


function canReorderNotes() {

  const wideScreen =
    window.matchMedia("(min-width: 701px)").matches;


  return (
    currentView === "notes" &&
    !searchInput.value.trim() &&
    wideScreen
  );

}


function setupNoteDrag(card) {

  if (!canReorderNotes()) {
    return;
  }


  card.classList.add("is-draggable");

  card.draggable = true;


  card.addEventListener("dragstart", (event) => {

    if (event.target.closest("button")) {
      event.preventDefault();
      return;
    }


    draggedCard = card;


    if (event.dataTransfer) {

      event.dataTransfer.effectAllowed = "move";

      event.dataTransfer.setData(
        "text/plain",
        card.dataset.id
      );


      const box = card.getBoundingClientRect();

      event.dataTransfer.setDragImage(
        card,
        event.clientX - box.left,
        event.clientY - box.top
      );

    }


    dragPlaceholderTimer = window.setTimeout(() => {

      if (draggedCard === card) {
        card.classList.add("dragging");
      }

    }, 0);

  });


  card.addEventListener("dragend", () => {

    ignoreNextCardClick = true;

    window.setTimeout(() => {
      ignoreNextCardClick = false;
    }, 200);


    window.clearTimeout(dragPlaceholderTimer);

    card.classList.remove("dragging");

    draggedCard = null;

    saveDraggedOrder();

  });

}


notesContainer.addEventListener("dragover", (event) => {

  if (!draggedCard) {
    return;
  }


  event.preventDefault();


  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }


  const nextCard = getCardToInsertBefore(
    event.clientX,
    event.clientY
  );


  if (nextCard && nextCard !== draggedCard) {

    notesContainer.insertBefore(draggedCard, nextCard);

  }

  else if (!nextCard && notesContainer.lastElementChild !== draggedCard) {

    notesContainer.appendChild(draggedCard);

  }

});


notesContainer.addEventListener("drop", (event) => {

  event.preventDefault();

});


function getCardToInsertBefore(x, y) {

  const cards = [...notesContainer.querySelectorAll(".note-card")]
    .filter((card) => card !== draggedCard);


  if (cards.length === 0) {
    return null;
  }


  const columns = [];


  cards.forEach((card) => {

    const box = card.getBoundingClientRect();

    const left = Math.round(box.left);


    let column = columns.find((item) => {
      return Math.abs(item.left - left) < 20;
    });


    if (!column) {

      column = {
        left: left,
        cards: []
      };

      columns.push(column);

    }


    column.cards.push({
      card: card,
      box: box
    });

  });


  let column = columns[0];


  columns.forEach((item) => {

    const itemCenter = item.left + item.cards[0].box.width / 2;

    const columnCenter = column.left + column.cards[0].box.width / 2;


    if (Math.abs(x - itemCenter) < Math.abs(x - columnCenter)) {
      column = item;
    }

  });


  for (const item of column.cards) {

    const middle = item.box.top + item.box.height / 2;


    if (y < middle) {
      return item.card;
    }

  }


  const lastCard = column.cards[column.cards.length - 1].card;

  let nextCard = lastCard.nextElementSibling;


  while (nextCard === draggedCard) {
    nextCard = nextCard.nextElementSibling;
  }


  return nextCard;

}


function saveDraggedOrder() {

  const orderedIds =
    [...notesContainer.querySelectorAll(".note-card")]
      .map((card) => Number(card.dataset.id));


  const activeNotes =
    notes.filter((note) => !note.archived);


  if (orderedIds.length !== activeNotes.length) {
    return;
  }


  const orderedActiveNotes = orderedIds.map((id) => {
    return notes.find((note) => note.id === id);
  });


  if (orderedActiveNotes.some((note) => !note)) {
    return;
  }


  let activeIndex = 0;


  notes = notes.map((note) => {

    if (note.archived) {
      return note;
    }


    const nextNote = orderedActiveNotes[activeIndex];

    activeIndex += 1;

    return nextNote;

  });


  saveNotes();

}


window.matchMedia("(min-width: 701px)")
  .addEventListener("change", () => {

    renderNotes();

  });


// ------------------------------------
// REMINDER DATE
// ------------------------------------

function formatReminder(value) {

  const date = new Date(value);


  if (Number.isNaN(date.getTime())) {
    return value;
  }


  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });

}


// ------------------------------------
// EMPTY STATE
// ------------------------------------

function showEmptyState(
  icon,
  heading,
  message
) {

  emptyState.style.display = "block";


  emptyState
    .querySelector(".empty-icon")
    .innerHTML = `<i class="bi ${icon}"></i>`;


  emptyState
    .querySelector("h2")
    .textContent = heading;


  emptyState
    .querySelector("p")
    .textContent = message;

}


// ------------------------------------
// SEARCH
// ------------------------------------

searchInput.addEventListener("input", () => {

  if (searchInput.value) {

    clearSearch.style.display = "inline-flex";

  }

  else {

    clearSearch.style.display = "none";

  }


  renderNotes();

});


clearSearch.addEventListener("click", () => {

  searchInput.value = "";

  clearSearch.style.display = "none";

  searchInput.focus();

  renderNotes();

});


// ------------------------------------
// SIDEBAR NAVIGATION
// ------------------------------------

sidebarItems.forEach((item) => {

  item.addEventListener("click", () => {

    sidebarItems.forEach((button) => {

      button.classList.remove("active");

    });


    item.classList.add("active");


    currentView =
      item.dataset.view;


    const titles = {

      notes: "Notes",

      reminders: "Reminders",

      "edit-labels": "Edit labels",

      archive: "Archive",

      trash: "Trash"

    };


    pageTitle.textContent =
      titles[currentView];


    document.getElementById("create-section").style.display =
      currentView === "notes"
        ? "flex"
        : "none";


    closeMobileMenu();


    renderNotes();

  });

});


// ------------------------------------
// MOBILE MENU
// ------------------------------------

menuButton.addEventListener("click", () => {

  sidebar.classList.toggle("open");

  overlay.classList.toggle("show");

});


overlay.addEventListener(
  "click",
  closeMobileMenu
);


function closeMobileMenu() {

  sidebar.classList.remove("open");

  overlay.classList.remove("show");

}


// ------------------------------------
// REFRESH
// ------------------------------------

refreshButton.addEventListener("click", () => {

  notes =
    JSON.parse(
      localStorage.getItem("keepNotes")
    ) || [];


  deletedNotes =
    JSON.parse(
      localStorage.getItem("keepDeletedNotes")
    ) || [];


  renderNotes();

});


// ------------------------------------
// EDIT NOTE
// ------------------------------------

const editModal = document.getElementById("edit-modal");

const editForm = document.getElementById("edit-form");

const editTitleInput = document.getElementById("edit-title");

const editContentInput = document.getElementById("edit-content");

const editColorButtons = editForm.querySelectorAll(".color-option");

const editCancel = document.getElementById("edit-cancel");

const editBackdrop = document.getElementById("edit-backdrop");


let editingNoteId = null;

let editColor = "default";

let ignoreNextCardClick = false;


function setEditColor(color) {

  editColor = color;


  editForm.classList.remove(
    "default",
    "yellow",
    "green",
    "blue",
    "pink",
    "purple"
  );


  editForm.classList.add(color);


  editColorButtons.forEach((button) => {

    button.classList.toggle(
      "selected",
      button.dataset.color === color
    );

  });

}


function openEditModal(note) {

  if (currentView === "trash") {
    return;
  }


  editingNoteId = note.id;

  editTitleInput.value = note.title;

  editContentInput.value = note.content;

  setEditColor(note.color || "default");


  editModal.classList.add("open");

  editTitleInput.focus();

}


function closeEditModal() {

  editModal.classList.remove("open");

  editingNoteId = null;

}


editColorButtons.forEach((button) => {

  button.addEventListener("click", () => {

    setEditColor(button.dataset.color);

  });

});


editForm.addEventListener("submit", (event) => {

  event.preventDefault();


  const note = notes.find((item) => item.id === editingNoteId);


  if (!note) {
    return;
  }


  const title = editTitleInput.value.trim();

  const content = editContentInput.value.trim();


  if (!title && !content) {
    return;
  }


  note.title = title || "Untitled note";

  note.content = content;

  note.color = editColor;


  saveNotes();

  renderNotes();

  closeEditModal();

});


editCancel.addEventListener("click", closeEditModal);

editBackdrop.addEventListener("click", closeEditModal);


document.addEventListener("keydown", (event) => {

  if (event.key === "Escape" && editModal.classList.contains("open")) {
    closeEditModal();
  }

});


// ------------------------------------
// LOCAL STORAGE
// ------------------------------------

function saveNotes() {

  localStorage.setItem(
    "keepNotes",
    JSON.stringify(notes)
  );

}


// ------------------------------------
// START
// ------------------------------------

renderNotes();