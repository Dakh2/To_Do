document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("task-input");
    const addTaskButton = document.getElementById("add-task-button");
    const taskList = document.getElementById("task-list");
    const searchBar = document.getElementById("search-bar");
    const showAllButton = document.getElementById("show-all");
    const showCompletedButton = document.getElementById("show-completed");
    const showActiveButton = document.getElementById("show-active");
    const noTasksMessage = document.getElementById("no-tasks-message");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function renderTasks(filter = "") {
        taskList.innerHTML = "";
        const filteredTasks = tasks.filter(task => {
            if (filter === "completed") return task.completed;
            if (filter === "active") return !task.completed;
            return true;
        });

        filteredTasks.forEach(task => createTaskElement(task));

        noTasksMessage.classList.toggle("hidden", taskList.children.length > 0);
    }

    function createTaskElement(task) {
        const taskItem = document.createElement("li");
        taskItem.className = "task-item";
        taskItem.dataset.id = task.id;
        taskItem.draggable = true; 
    
       
        const taskTextContainer = document.createElement("div");
        const taskText = document.createElement("span");
        taskText.textContent = task.text;
        if (task.completed) taskText.classList.add("completed");
        taskTextContainer.appendChild(taskText);
    
        
        const buttonsContainer = document.createElement("div");
        buttonsContainer.className = "buttons-container";
    
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editTask(taskItem, task));
        buttonsContainer.appendChild(editButton);
    
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteTask(task.id));
        buttonsContainer.appendChild(deleteButton);
    
        const completeButton = document.createElement("button");
        completeButton.textContent = task.completed ? "Completed" : "Complete";
        completeButton.addEventListener("click", () => toggleComplete(task.id));
        buttonsContainer.appendChild(completeButton);
    
        
        taskItem.appendChild(taskTextContainer);
        taskItem.appendChild(buttonsContainer);
    
        taskItem.addEventListener("dragstart", handleDragStart);
        taskItem.addEventListener("dragover", handleDragOver);
        taskItem.addEventListener("drop", handleDrop);
        taskItem.addEventListener("dragend", handleDragEnd);
    
        taskList.appendChild(taskItem);
    }

    function handleDragStart(e) {
        e.dataTransfer.setData("text/plain", e.target.dataset.id);
        e.target.classList.add("dragging");
    }

    function handleDragOver(e) {
        e.preventDefault();
        const draggingItem = document.querySelector(".dragging");
        const currentHoveredItem = e.target.closest(".task-item");

        if (currentHoveredItem && draggingItem !== currentHoveredItem) {
            const bounding = currentHoveredItem.getBoundingClientRect();
            const offset = e.clientY - bounding.top;
            if (offset > bounding.height / 2) {
                currentHoveredItem.after(draggingItem);
            } else {
                currentHoveredItem.before(draggingItem);
            }
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        const draggedTaskId = e.dataTransfer.getData("text/plain");
        const dropTargetId = e.target.closest(".task-item").dataset.id;

        if (draggedTaskId !== dropTargetId) {
            const draggedIndex = tasks.findIndex(task => task.id == draggedTaskId);
            const targetIndex = tasks.findIndex(task => task.id == dropTargetId);

            const [movedTask] = tasks.splice(draggedIndex, 1);
            tasks.splice(targetIndex, 0, movedTask);

            saveTasks();
            renderTasks();
        }
    }

    function handleDragEnd(e) {
        e.target.classList.remove("dragging");
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        const errorMessageContainer = document.getElementById("error-message-container");
        
        if (taskText) {

            const taskExists = tasks.some(task => task.text.toLowerCase() === taskText.toLowerCase());
            
            if (taskExists) {
            
                errorMessageContainer.textContent = "Task name already exists!";
                errorMessageContainer.classList.remove("hidden");
    
                setTimeout(() => {
                    errorMessageContainer.classList.add("hidden");
                }, 2500);
    
                return;
            }
    
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false
            };
            tasks.push(newTask);
            taskInput.value = "";
            saveTasks();
            renderTasks();
        }
    }

    function editTask(taskItem, task) {
        const taskText = taskItem.querySelector("span");
        const input = document.createElement("input");
        input.type = "text";
        input.value = task.text;
        taskText.replaceWith(input);
        input.focus();

        const infoMessage = document.createElement("div");
        infoMessage.textContent = "Press ENTER to SAVE change";
        infoMessage.className = "info-message";
        taskItem.appendChild(infoMessage);

        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") saveEdit(taskItem, task, input, infoMessage);
        });
    }

    function saveEdit(taskItem, task, input, infoMessage) {
        const updatedText = input.value.trim();
        if (updatedText) {
            
            task.text = updatedText;
            saveTasks();

            const taskText = document.createElement("span");
            taskText.className = "task-text";
            taskText.textContent = updatedText;
            input.replaceWith(taskText);

            infoMessage.remove();
            taskItem.querySelector("button").style.display = "";
            renderTasks();
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    function toggleComplete(id) {
        const task = tasks.find(task => task.id === id);
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }

    function filterTasks(e) {
        const searchTerm = e.target.value.toLowerCase();
        const noSearchResultsMessage = document.getElementById("no-search-results");

        let tasksVisible = false;
        document.querySelectorAll(".task-item").forEach(item => {
            const taskText = item.querySelector("span").textContent.toLowerCase();
            if (taskText.includes(searchTerm)) {
                item.style.display = "";
                tasksVisible = true;
            } else {
                item.style.display = "none";
            }
        });

        noSearchResultsMessage.classList.toggle("hidden", tasksVisible);
    }

    addTaskButton.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addTask();
    });
    searchBar.addEventListener("input", filterTasks);
    showAllButton.addEventListener("click", () => renderTasks());
    showCompletedButton.addEventListener("click", () => renderTasks("completed"));
    showActiveButton.addEventListener("click", () => renderTasks("active"));

    renderTasks();
});
