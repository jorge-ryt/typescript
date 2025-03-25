//@ts-nocheck
import {
    EDIT_MODAL_TITLE,
    EDIT_MODAL_PRIORITY_LABEL,
    EDIT_MODAL_DEADLINE_LABEL,
    EDIT_MODAL_TITLE_LABEL,
    MODAL_CANCEL_BTN
} from "../constants/taskManagerConst";

import { sanitizeInput } from '../utils/sanitizeInput'

class ModalEdit {
    constructor(task, onUpdate) {
        this.task = task;
        this.onUpdate = onUpdate;
        this.modal = null;
    }

    open() {
        const mainElement = document.getElementById("main");
        // Create Edit modal
        this.modal = document.createElement("dialog");
        this.modal.setAttribute("class", "modal-edit");
        // Create header
        const header = document.createElement("header");
        header.setAttribute("class", "modal-edit-header");
        // Modal title
        const h3 = document.createElement("h3");
        h3.setAttribute("class", "modal-edit-title");
        h3.textContent = EDIT_MODAL_TITLE;
        // Create form
        const form = document.createElement("form");
        form.setAttribute("method", "dialog");
        form.setAttribute("class", "modal-form");
        // Title label
        const titleLabel = document.createElement("label");
        titleLabel.textContent = EDIT_MODAL_TITLE_LABEL;
        //Title input
        const titleInput = document.createElement("input");
        titleInput.setAttribute("type", "text");
        titleInput.setAttribute("class", "modal-input");
        titleInput.value = sanitizeInput(this.task.title);
        // Priority label
        const priorityLabel = document.createElement("label");
        priorityLabel.textContent = EDIT_MODAL_PRIORITY_LABEL;
        // Priority select
        const prioritySelect = document.createElement("select");
        prioritySelect.setAttribute("class", "modal-select");
        
        ["Urgent", "High", "Medium", "Low"].forEach(priority => {
            const option = document.createElement("option");
            option.value = priority;
            option.textContent = priority;
            if (priority === this.task.priority) option.selected = true;
            prioritySelect.appendChild(option);
        });
        // Deadline label
        const deadlineLabel = document.createElement("label");
        deadlineLabel.textContent = EDIT_MODAL_DEADLINE_LABEL;
        // Deadline input
        const deadlineInput = document.createElement("input");
        deadlineInput.setAttribute("type", "date");
        deadlineInput.setAttribute("class", "modal-input-date");
        deadlineInput.value = this.task.deadline;
        // Buttons wrapper
        const btnWrapper = document.createElement("section");
        btnWrapper.setAttribute("class", "btn-wrapper-edit");
        // Update button
        const updateButton = document.createElement("button");
        updateButton.textContent = "Update";
        updateButton.setAttribute("type", "submit");
        updateButton.setAttribute("class", "modal-edit-updateBtn");
        // Cancel button
        const cancelButton = document.createElement("button");
        cancelButton.textContent = MODAL_CANCEL_BTN;
        cancelButton.setAttribute("class", "modal-cancel-btn");
        cancelButton.setAttribute("type", "button");

        // Append elements
        header.appendChild(h3);
        form.appendChild(titleLabel);
        form.appendChild(titleInput);
        form.appendChild(priorityLabel);
        form.appendChild(prioritySelect);
        form.appendChild(deadlineLabel);
        form.appendChild(deadlineInput);
        btnWrapper.appendChild(cancelButton);
        btnWrapper.appendChild(updateButton);
        form.appendChild(btnWrapper);
        
        this.modal.appendChild(header);
        this.modal.appendChild(form);
        mainElement.appendChild(this.modal);
        
        this.modal.showModal();
        
        // Event listeners
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const sanitizedTitle = sanitizeInput(titleInput.value);
            this.handleUpdate(this.task.id, sanitizedTitle, prioritySelect.value, deadlineInput.value);
        });
        cancelButton.addEventListener("click", () => this.close());
        titleInput.addEventListener("input", () => {
            titleInput.value = sanitizeInput(titleInput.value);
        });
    }
    

    handleUpdate(id, title, priority, deadline) {
        this.onUpdate({ id, title, priority, deadline });
        this.close();
    }

    close() {
        if (this.modal) {
            this.modal.close();
            this.modal.remove();
        }
    }
}

export default ModalEdit;
