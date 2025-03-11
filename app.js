const modal = document.querySelector('.confirm-modal');
const columnsContainer = document.querySelector('.columns');
const columns = document.querySelectorAll('.column'); // Selects all columns

const createTask = (content) => {
  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;
  task.innerHTML = `
    <div>${content}</div>
    <menu>
        <button data-edit><i class="fa-solid fa-pen"></i></button>
        <button data-delete><i class="fa-solid fa-trash"></i></button>
    </menu>`;
  
  task.addEventListener("dragstart", handleDragStart);
  task.addEventListener("dragend", handleDragEnd);
  
  return task;
};

const createTaskInput = (text = "") => {
  const input = document.createElement("div");
  input.className = "task-input";
  input.dataset.placeholder = "Task name";
  input.contentEditable = true;
  input.innerText = text;
  input.addEventListener("blur", handleBlur);
  
  // Move cursor to end
  setTimeout(() => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(input);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }, 0);

  return input;
};

// Handle adding a task
const handleAdd = (event) => {
  const tasksEl = event.target.closest(".column").querySelector(".tasks");
  if (!tasksEl) return;

  const input = createTaskInput();
  tasksEl.appendChild(input);
  input.focus();
};

// Handle blur event when user finishes editing
const handleBlur = (event) => {
  const input = event.target;
  const content = input.innerText.trim() || "Untitled";
  const task = createTask(content.replace(/\n/g, "<br>"));
  input.replaceWith(task);
  updateTaskCount(input.closest(".column"));
};

// Handle editing an existing task
const handleEdit = (event) => {
  const task = event.target.closest(".task");
  if (!task) return;

  const content = task.querySelector("div").innerText; // Get only the text, not buttons
  const input = createTaskInput(content);
  task.replaceWith(input);
  input.focus();
};

// Handle delete confirmation modal
let currentTask = null;
const handleDelete = (event) => {
  currentTask = event.target.closest(".task");
  if (!currentTask) return;

  modal.querySelector(".preview").innerText = currentTask.innerText.substring(0, 100);
  modal.showModal();
};

// Handle updating task count
const updateTaskCount = (column) => {
  const tasks = column.querySelector(".tasks").children;
  const taskCount = tasks.length;
  column.querySelector(".column-title h3").dataset.tasks = taskCount;
};

// Observe task count changes
const observeTaskChanges = () => {
  document.querySelectorAll(".column").forEach((column) => {
    const tasksContainer = column.querySelector(".tasks");
    if (!tasksContainer) return;

    const observer = new MutationObserver(() => updateTaskCount(column));
    observer.observe(tasksContainer, { childList: true });

    // Update count initially
    updateTaskCount(column);
  });
};

observeTaskChanges();

// Handle Dragging Events
const handleDragEnd = (event) => {
  event.target.classList.remove("dragging");
};

const handleDragStart = (event) => {
  event.dataTransfer.effectsAllowed = "move";
  event.dataTransfer.setData("text/plain", "");
  requestAnimationFrame(() => {
    event.target.classList.add("dragging");
  });
};

// Handle Dragover and Drop Events
const handleDragOver = (event) => {
  event.preventDefault(); // Allow drop

  const draggedTask = document.querySelector(".dragging");
  const target = event.target.closest(".task, .tasks");

  if (!target || target === draggedTask) return;

  if (target.classList.contains("tasks")) {
    // target is the tasks element
    const lastTask = target.lastElementChild;
    if (!lastTask) {
      // tasks is empty
      target.appendChild(draggedTask);
    } else {
      const { bottom } = lastTask.getBoundingClientRect();
      event.clientY > bottom && target.appendChild(draggedTask);
    }
  } else {
    // target is another task
    const { top, height } = target.getBoundingClientRect();
    const distance = top + height / 2;

    if (event.clientY < distance) {
      target.before(draggedTask);
    } else {
      target.after(draggedTask);
    }
  }

  updateTaskCount(target.closest(".column"));
};

const handleDrop = (event) => {
  event.preventDefault();
};

// Event listeners for button actions
columnsContainer.addEventListener("click", (event) => {
  if (event.target.closest("button[data-add]")) {
    handleAdd(event);
  } else if (event.target.closest("button[data-edit]")) {
    handleEdit(event);
  } else if (event.target.closest("button[data-delete]")) {
    handleDelete(event);
  }
});

// Modal event listeners
modal.addEventListener("submit", () => {
  if (currentTask) {
    currentTask.remove();
    currentTask = null;
  }
});

modal.addEventListener("close", () => {
  currentTask = null;
});

modal.querySelector("#cancel").addEventListener("click", () => {
  modal.close();
});

// Drag and drop event listeners
document.querySelectorAll(".tasks").forEach((tasksEl) => {
  tasksEl.addEventListener("dragover", handleDragOver);
  tasksEl.addEventListener("drop", handleDrop);
});
