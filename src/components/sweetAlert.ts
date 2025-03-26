import {
    SWEETALERT_MODAL_TITLE,
    SWEETALERT_MODAL_OK_BTN
} from "@/constants/taskManagerConst";

// Define an interface for the error object
interface Error {
    message: string;
}

class SweetAlert {
    private error: Error;
    private modal: HTMLDialogElement | null;

    constructor(error: Error) {
        this.error = error;
        this.modal = null;
    }

    open(): void {
        const mainElement = document.getElementById("main") as HTMLElement;
        if (!mainElement) return; // Ensure mainElement exists

        // Create the modal
        this.modal = document.createElement("dialog");
        this.modal.setAttribute("class", "sweetAlert-modal");

        // Create header
        const header = document.createElement("header");
        header.setAttribute("class", "modal-sweetAlert-header");

        // Modal X Icon
        const icon = document.createElement("i");
        icon.setAttribute("class", "fa-regular fa-circle-xmark x-icon");

        // Modal title
        const h3 = document.createElement("h3");
        h3.setAttribute("class", "modal-sweetAlert-title");
        h3.textContent = SWEETALERT_MODAL_TITLE;

        // Title message
        const message = document.createElement("p");
        message.textContent = this.error.message;

        // Ok button
        const okButton = document.createElement("button");
        okButton.textContent = SWEETALERT_MODAL_OK_BTN;
        okButton.setAttribute("type", "button");
        okButton.setAttribute("class", "modal-sweetalert-okBtn");

        // Append elements
        header.appendChild(icon);
        header.appendChild(h3);
        this.modal.appendChild(header);
        this.modal.appendChild(message);
        this.modal.appendChild(okButton);
        mainElement.appendChild(this.modal);

        // Show modal
        this.modal.showModal();

        // Event listeners
        okButton.addEventListener("click", () => this.close());
    }

    close(): void {
        if (this.modal) {
            this.modal.close();
            this.modal.remove();
        }
    }
}

export default SweetAlert;
