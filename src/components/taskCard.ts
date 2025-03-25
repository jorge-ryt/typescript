//@ts-nocheck
// import openModalConfirmation from "./confirmationModal.js";
import ModalConfirmation from './modalConfirmation';
import ModalEdit from './modalEdit';
import { loadTasks } from "../pages/taskManager";

class TaskCard {
    constructor(task) {
        this.task = task;
        this.taskCard = document.createElement("article");
        this.taskCard.setAttribute("class", "card");

        // Create task card elements
        this.createCard();
    }

    /**
     * Create the task card UI elements and append them
     */
    createCard() {
        const { task } = this;

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.setAttribute("class", "isChecked checkbox");
        checkbox.setAttribute("type", "checkbox");
        checkbox.checked = task.isCompleted;

        // Title
        const title = document.createElement("p");
        title.setAttribute("class", task.isCompleted ? "task-title completed" : "task-title");
        title.textContent = task.title;

        // Priority
        const priority = document.createElement("p");
        priority.setAttribute("class", task.isCompleted ? "task-priority completed" : "task-priority");
        priority.textContent = task.priority;

        // Deadline
        const deadline = document.createElement("p");
        deadline.setAttribute("class", task.isCompleted ? "task-deadline completed" : "task-deadline");
        deadline.textContent = task.deadline;

        // Edit icon
        const editIcon = document.createElement("i");
        editIcon.setAttribute("class", "fa-solid fa-pen edit-icon");

        // Trash icon
        const trashIcon = document.createElement("i");
        trashIcon.setAttribute("class", "fa-solid fa-trash trash-icon");

        // Append elements to the card
        this.taskCard.appendChild(checkbox);
        this.taskCard.appendChild(title);
        this.taskCard.appendChild(priority);
        this.taskCard.appendChild(deadline);
        this.taskCard.appendChild(editIcon);
        this.taskCard.appendChild(trashIcon);

        // Add event listeners
        const modalConfirmation = new ModalConfirmation(task.id, task.title);
        const modalEdit = new ModalEdit(task, this.handleEditTask);
        checkbox.addEventListener("click", () => this.handleMarkAsDone(task.id));
        editIcon.addEventListener("click", () => modalEdit.open());
        trashIcon.addEventListener("click", () => modalConfirmation.open());
    }

    /**
     * Handle mark task as done
     * @param {string} taskId
     */
    handleMarkAsDone(taskId) {
        const tasks = JSON.parse(localStorage.getItem("tasks"));

        const newTasks = tasks.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    isCompleted: !task.isCompleted
                };
            }
            return task;
        });

        // Update localStorage
        localStorage.setItem("tasks", JSON.stringify(newTasks));

        // Reload tasks to refresh the view
        loadTasks();
    }

    /**
     * Handle edit task
     */
    handleEditTask({ id, title, priority, deadline }) {
        const tasks = JSON.parse(localStorage.getItem("tasks"));

        const newTasks = tasks.map(task => {
            if (task.id === id) {
                return {
                    ...task,
                    title,
                    priority,
                    deadline
                };
            }
            return task;
        });

        // Update localStorage
        localStorage.setItem("tasks", JSON.stringify(newTasks));

        // Reload tasks to refresh the view
        loadTasks();
    }

    /**
     * Returns the task card element
     */
    getCard() {
        return this.taskCard;
    }
}

export default TaskCard;
