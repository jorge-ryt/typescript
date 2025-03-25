//@ts-nocheck
import {
    CONFIRMATION_MODAL_TITLE,
    CONFIRMATION_MODAL_MESSAGE,
    CONFIRMATION_MODAL_CONFIRM_BTN,
    MODAL_CANCEL_BTN
} from "../constants/taskManagerConst";
import { loadTasks } from "../pages/taskManager";

class ModalConfirmation {
    constructor(taskId, taskTitle) {
        this.taskId = taskId;
        this.taskTitle = taskTitle;
        this.modal = null;
    }

    open() {
        const mainElement = document.getElementById("main");
        // Create modal dialog
        this.modal = document.createElement("dialog");
        this.modal.setAttribute("class", "confirmation-modal");
        // Create header
        const header = document.createElement("header");
        header.setAttribute("class", "modal-header");
        // Modal title
        const h3 = document.createElement("h3");
        h3.setAttribute("class", "modal-title");
        h3.textContent = CONFIRMATION_MODAL_TITLE;
        // Modal message
        const p = document.createElement("p");
        p.setAttribute("class", "modal-message");
        p.textContent = `${CONFIRMATION_MODAL_MESSAGE} the task: ${this.taskTitle}?`;
        // Buttons wrapper
        const btnWrapper = document.createElement("section");
        btnWrapper.setAttribute("class", "btn-wrapper");
        // Confirmation button
        const confirmBtn = document.createElement("button");
        confirmBtn.textContent = CONFIRMATION_MODAL_CONFIRM_BTN;
        confirmBtn.setAttribute("class", "confirm-btn");
        confirmBtn.setAttribute("type", "button");
        // Cancel button
        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = MODAL_CANCEL_BTN;
        cancelBtn.setAttribute("class", "cancel-btn");
        cancelBtn.setAttribute("type", "button");

        // Append elements
        header.appendChild(h3);
        this.modal.appendChild(header);
        this.modal.appendChild(p);
        btnWrapper.appendChild(cancelBtn);
        btnWrapper.appendChild(confirmBtn);
        this.modal.appendChild(btnWrapper);
        mainElement.appendChild(this.modal);

        // Event Listeners
        confirmBtn.addEventListener("click", () => this.handleDeleteTask());
        cancelBtn.addEventListener("click", () => this.close());

        this.modal.showModal();
    }

    handleDeleteTask() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const newTasks = tasks.filter(task => task.id !== this.taskId);

        localStorage.setItem("tasks", JSON.stringify(newTasks));
        loadTasks();
        this.close();
    }

    close() {
        if (this.modal) {
            this.modal.close();
            this.modal.remove();
        }
    }
}

export default ModalConfirmation;
