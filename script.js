document.addEventListener("DOMContentLoaded", () => {

  /* ===== ELEMENTS ===== */
  const notesPage = document.getElementById("notesPage");
  const editorPage = document.getElementById("editorPage");
  const notesList = document.getElementById("notesList");
  const titleInput = document.getElementById("titleInput");
  const editor = document.getElementById("editor");
  const searchInput = document.getElementById("searchInput");
  const colorBar = document.getElementById("colorBar");

  const addBtn = document.getElementById("addBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const backBtn = document.getElementById("backBtn");
  const pinBtn = document.getElementById("pinBtn");
  const undoBtn = document.getElementById("undoBtn");
  const redoBtn = document.getElementById("redoBtn");
  const numberListBtn = document.getElementById("numberListBtn");
  const bulletListBtn = document.getElementById("bulletListBtn");
  const increaseBtn = document.getElementById("increaseBtn");
  const decreaseBtn = document.getElementById("decreaseBtn");
  const shareBtn = document.getElementById("shareBtn");
  const exportImgBtn = document.getElementById("exportImgBtn");
  const selectModeBtn = document.getElementById("selectModeBtn");
  const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
  const dateTimeEl = document.getElementById("dateTime");
  const emptyState= document.getElementById("emptyState");

  /* ===== STATE ===== */
  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  let currentNoteId = null;
  let undoStack = [];
  let redoStack = [];
  let fontSize = 16;
  let listType = null;
  let selectionMode = false;
  let selectedNotes = new Set();

  /* ===== STORAGE ===== */
  const saveToStorage = () =>
    localStorage.setItem("notes", JSON.stringify(notes));

  /* ===== PAGE SWITCH ===== */
  const showNotesPage = () => {
     editorPage.style.display = "none";
  notesPage.style.display = "flex";  
   addBtn.style.display = "flex";

  };

  const showEditorPage = () => {
  editorPage.style.display = "flex";
  notesPage.style.display = "none";  
   addBtn.style.display = "none";

  };

  function applyNoteColor(color)
{
  editor.offsetHeight;
  titleInput.offsetHeight;

  editor.style.backgroundColor = color;
  titleInput.style.backgroundColor = color;
}

  /* ===== RENDER NOTES ===== */
function renderNotes() {
  notesList.innerHTML = "";
  const q = searchInput.value.toLowerCase();
  const activeId = localStorage.getItem("activeNoteId");

 if (activeId && !notes.some(n => String(n.id) === activeId)) 
{
   localStorage.removeItem("activeNoteId");
}

  const filteredNotes = [...notes]
    .sort((a, b) => b.pinned - a.pinned)
    .filter(n => (n.title + n.text).toLowerCase().includes(q));

  // Empty state
  if (filteredNotes.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filteredNotes.forEach(note => {
    const li = document.createElement("li");
    li.className = "note-item";
    li.style.background = note.color || "#fff";

   
    // ✅ ACTIVE HIGHLIGHT
    if (String(note.id) === activeId) {
      li.classList.add("active");
    }

    // ✅ Checkbox (selection mode)
    if (selectionMode) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = selectedNotes.has(note.id);

      checkbox.onclick = (e) => {
        e.stopPropagation();
        checkbox.checked
          ? selectedNotes.add(note.id)
          : selectedNotes.delete(note.id);
      };

      li.appendChild(checkbox);
    }

    // 📌 Title
    const title = document.createElement("span");
    title.className = "note-title";
    title.innerHTML =
      (note.pinned ? `<span class="pin-icon"><svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="m389-400 91-55 91 55-24-104 80-69-105-9-42-98-42 98-105 9 80 69-24 104ZM200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z"/></svg></span>` : "") + (note.title || "Untitled");

    // 🕒 Time
    const time = document.createElement("small");  
const timeStr = note.updatedAt || note.createdAt;  
time.className = "note-time";  
time.textContent = `${getTimeEmojiFromDate(timeStr)} ${timeStr}`;  

const textWrap = document.createElement("div");  
textWrap.className = "note-text";  
textWrap.appendChild(title);  
textWrap.appendChild(time);  

li.appendChild(textWrap);  

li.onclick = () => {  
  if (!selectionMode) {  
    localStorage.setItem("activeNoteId", note.id);  
    openEditor(note.id);  
  }  
};  

notesList.appendChild(li);

});
}

function getTimeEmoji() {
const hour = new Date().getHours();

if (hour >= 5 && hour < 12) return "☀️";
if (hour >= 12 && hour < 17) return "🌤️";
if (hour >= 17 && hour < 20) return "🌆";
return "🌙";

}

function getTimeEmojiFromDate(dateString)
{
if (!dateString) return "🕒";

const date = new Date(dateString.replace(" • ", " "));
const hour = date.getHours();

if (hour >= 5 && hour < 12) return "☀️";
if (hour >= 12 && hour < 17) return "🌤️";
if (hour >= 17 && hour < 20) return "🌆";
return "🌙";

}

function getDateTimeWithEmoji()
{
return `${getTimeEmoji()} ${getCurrentDateTime()}`;
}

  function getCurrentDateTime() 
{
  const now = new Date();

  const date = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
});

  const time = now.toLocaleTimeString("en-IN", {
     hour: "2-digit",
     minute: "2-digit",
     hour12: true     
});
   
   return `${date} • ${time}`;
}

 function getPlainDateTime()
{
 return getCurrentDateTime();
}

function updateDateTime() 
{
  if (!dateTimeEl) return;
  
  dateTimeEl.textContent = getPlainDateTime();
}

  /* ===== NEW NOTE ===== */
  function newNote() {
    const now = getCurrentDateTime();

    const note = {
      id: Date.now(),
      title: "Untitled",
      text: "",
      color: "#121212",
      createdAt: now,
      updatedAt: now,
      pinned: false,
      fontSize: 16
    };

    notes.unshift(note);
    currentNoteId = note.id;
    localStorage.setItem("activeNoteId", String(note.id));
    
    
    titleInput.value = "";
    editor.value = "";
    applyNoteColor(note.color);

    dateTimeEl.textContent = note.createdAt;

  updateEmptyState();

    showEditorPage();
    saveToStorage(); 
    renderNotes();
    openEditor(note.id);

    undoStack = [""];
    redoStack = [];
  }

  /* ===== OPEN NOTE ===== */
  function openEditor(id) {
   
   localStorage.setItem("activeNoteId", id);

    const note = notes.find(n => n.id === id);
    if (!note) return;

    currentNoteId = id;
    titleInput.value = note.title;
    editor.value = note.text;
    applyNoteColor(note.color || "#ffffff");

    fontSize = note.fontSize || 16;
    editor.style.fontSize = fontSize + "px";

   if (!note.createdAt) {
  note.createdAt = getCurrentDateTime();
 }
   if (!note.updatedAt) {
    note.updatedAt = note.createdAt;
}
    dateTimeEl.textContent = note.updatedAt;

   
    saveToStorage();
    undoStack = [editor.value];
    redoStack = [];
    showEditorPage();
  }


  /* ===== AUTOSAVE ===== */
  function autoSave() {
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;

    note.title = titleInput.value || "Untitled";
    note.text = editor.value;
    note.fontSize = fontSize;
    note.updatedAt = getCurrentDateTime();

    dateTimeEl.textContent = note.updatedAt;
    saveToStorage();
    renderNotes();
  }

  /* ===== DELETE ===== */
  function deleteNote() {
    notes = notes.filter(n => n.id !== currentNoteId);
    currentNoteId = null;
    saveToStorage();
    renderNotes();
    showNotesPage();
    updateEmptyState();
  }

  function updateEmptyState() {
    const emptyState = document.getElementById("emptyState");
 
    if (!emptyState) return;
    if (notes.length === 0)
 {
   emptyState.classList.remove("hidden");
} else {
     emptyState.classList.add("hidden");
 }
}

  function exportAsImage() {
  if (!currentNoteId) return;

  const note = notes.find(n => n.id === currentNoteId);
  if (!note) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const padding = 50;

  const titleSize = 35;          
  const titleColor = "#666666";  

  const bodySize = note.fontSize || 18;
  const lineGap = 3;             
  const lineHeight = bodySize + lineGap;

  const lines = (note.text || "").split("\n");

  canvas.width = 1080;
  canvas.height = padding * 2 + titleSize + 60 + lines.length * lineHeight;

  ctx.fillStyle = note.color || "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `600 ${titleSize}px system-ui`;   
  ctx.fillStyle = titleColor;                  
  ctx.fillText(note.title || "Untitled", padding, padding + titleSize);

  const dateText = note.updatedAt || note.createdAt || "";
  ctx.font = `16px system-ui`;
  ctx.fillStyle = "#888";
  ctx.fillText(
    dateText,
    padding,
    padding + titleSize + 26
 );

  ctx.font = "18px system-ui";
  ctx.fillStyle = "#666666";
  ctx.fillText(
  ">——  >——  >——", 
  padding,
  padding + titleSize + 55
);
                   
  ctx.fillStyle = "#353839";
  const bodyStartY = padding + titleSize + 65;
  lines.forEach((line, i) => {
    ctx.fillText(line, padding, bodyStartY + titleSize + i * lineHeight);
  });

  const watermarkText = "— NoteLit";

  ctx.font = "14px system-ui";
  ctx.fillStyle = "#666666";

  const textWidth =
  ctx.measureText(watermarkText).width;

  ctx.fillText(
  watermarkText, 
  canvas.width - textWidth - 40, 
  canvas.height - 30
);

  /* DOWNLOAD */
  const link = document.createElement("a");
  link.download = (note.title || "note") + ".png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

 function insertAtCursor(text) {
   const start = editor.selectionStart;
   const end = editor.selectionEnd;

 editor.setRangeText(text, start, end, "end");
  editor.focus();
 }
 
  /* ===== FONT SIZE ===== */
  const increaseFont = () => {
    if (fontSize < 28) {
      fontSize += 2;
      editor.style.fontSize = fontSize + "px";
      autoSave();
    }
  };

  const decreaseFont = () => {
    if (fontSize > 12) {
      fontSize -= 2;
      editor.style.fontSize = fontSize + "px";
      autoSave();
    }
  };

  /* ===== LISTS ===== */
 

  /* ===== EVENTS (SAFE) ===== */
  deleteBtn && deleteBtn.addEventListener("click", deleteNote);
  searchInput && searchInput.addEventListener("input", renderNotes);
  increaseBtn && increaseBtn.addEventListener("click", increaseFont);
  decreaseBtn && decreaseBtn.addEventListener("click", decreaseFont);
  exportImgBtn && exportImgBtn.addEventListener("click", exportAsImage);
  titleInput && titleInput.addEventListener("input", autoSave);

  editor.addEventListener("input", () => {
    autoSave();
    if (undoStack.at(-1) !== editor.value) {
      undoStack.push(editor.value);
      redoStack = [];
    }
  });  

editor.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (!listType) return;

  const cursor = editor.selectionStart;
  const before = editor.value.slice(0, cursor);
  const lines = before.split("\n");
  const lastLine = lines[lines.length - 1];

    if (listType === "bullet") {
    if (!lastLine.startsWith("• ")) return;

    if (lastLine.trim() === "•") {
      e.preventDefault();
      listType = null;
      insertAtCursor("\n");
      return;
    }

    e.preventDefault();
    insertAtCursor("\n• ");
  }

  if (listType === "number") {
    const match = lastLine.match(/^(\d+)\.\s*(.*)$/);
    if (!match) return;

    const number = parseInt(match[1], 10);
    const content = match[2];

    if (content.trim() === "") {
      e.preventDefault();
      listType = null;
      insertAtCursor("\n");
      return;
    }

    e.preventDefault();
    insertAtCursor(`\n${number + 1}. `);
  }
});

 numberListBtn && numberListBtn.addEventListener("click", () => {
    editor.focus();
    listType = "number";
    insertAtCursor("1. ")
});


 bulletListBtn && bulletListBtn.addEventListener("click", () => {
  editor.focus();
   listType = "bullet";
   insertAtCursor("• ");
});

  undoBtn && undoBtn.addEventListener("click", () => {
    if (undoStack.length > 1) {
      redoStack.push(undoStack.pop());
      editor.value = undoStack.at(-1);
      autoSave();
    }
  });

  redoBtn && redoBtn.addEventListener("click", () => {
    if (redoStack.length) {
      const t = redoStack.pop();
      undoStack.push(t);
      editor.value = t;
      autoSave();
    }
  });

  pinBtn && pinBtn.addEventListener("click", () => {
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;
    note.pinned = !note.pinned;
    saveToStorage();
    renderNotes();
  });


colorBar.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn || !btn.dataset.color) return;
  if (!currentNoteId) return;

  // reset all
  colorBar.querySelectorAll("button").forEach(b => {
    b.classList.remove("active");
  });

  // activate clicked
  btn.classList.add("active");

  const color = btn.dataset.color;

  const note = notes.find(n => n.id === currentNoteId);
  if (!note) return;

  note.color = color;
  applyNoteColor(color);
  saveToStorage();
  renderNotes();
});

 shareBtn && shareBtn.addEventListener("click", async () => {
    if (!editor.value.trim()) return;
    await navigator.share({
      title: titleInput.value,
      text: editor.value
    });
  });

  selectModeBtn && selectModeBtn.addEventListener("click", () => 
{
  
   selectionMode = true;
   selectedNotes.clear();

   selectModeBtn.style.visibility = "hidden";
   deleteSelectedBtn.style.visibility = "visible";
     renderNotes(); 
});

  deleteSelectedBtn && deleteSelectedBtn.addEventListener("click", () =>
 {
  if (!selectedNotes.size) return;

  if (!confirm("Delete selected notes?")) return;

  notes = notes.filter(note => !selectedNotes.has(note.id));
  selectedNotes.clear();
  selectionMode = false;

 deleteSelectedBtn.style.visibility = "hidden";
 selectModeBtn.style.visibility = "visible";

  updateEmptyState();

  saveToStorage();
  renderNotes();   
});

addBtn && addBtn.addEventListener("click", () =>
 {
  newNote();
});

  backBtn && backBtn.addEventListener("click", () => 
 {
   selectionMode = false;
   selectedNotes.clear();
   deleteSelectedBtn.style.visibility = "hidden";
   selectModeBtn.style.visibility = "visible";
  
  showNotesPage();
  renderNotes();

});

document.querySelectorAll('.note-hover')
   .forEach(note => {
  note.addEventListener('click', () => {
   document
        .querySelectorAll('.note-hover')
        .forEach(c =>
     c.classList.remove('active-note'));
 
     card.classList.add('active-note');
  });
});

document.addEventListener("touchstart", (e) => {
  const target = e.target.closest(".icon-btn, .fab, .tick-btn, #notesList li");
  if (!target) return;

  target.classList.add("press-glow");
}, { passive: true });

document.addEventListener("touchend", () => {
  if (document.activeElement instanceof HTMLElement) {
  document.activeElement.blur();
 }
});

document.addEventListener("touchcancel", () => {
  document.querySelectorAll(".press-glow").forEach(el => {
    el.classList.remove("press-glow");
  });
});

  /* ===== INIT ===== */
  updateDateTime();
  setInterval(updateDateTime, 60000);
  updateEmptyState();
  showNotesPage();
  renderNotes();
});
