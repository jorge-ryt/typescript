//@ts-nocheck
// import { v4 as uuidv4 } from 'https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/umd/uuid.min.js';

import {
	NO_DATA_TEXT,
	EMPTY_VALUES,
	WRONG_CREDENTIALS,
	PASSWORDS_DONT_MATCH,
	EMAIL_ALREADY_EXIST
} from "../constants/taskManagerConst";
import SweetAlert from '../components/sweetAlert';
import { sanitizeInput, validateEmail } from "../utils/sanitizeInput";
import { IUser } from "../interfaces/authentication";
// import { hashPassword, isPasswordValid } from '../utils/protectPassword.js';

// Define types for HTML elements used
interface HTMLElementWithDataset extends HTMLElement {
	dataset: DOMStringMap;
}

class Authentication {
	private email: string;
	private password: string;
	private confirmPassword: string;
	private signInHeaderBtn: HTMLElementWithDataset;
	private signUpHeaderBtn: HTMLElementWithDataset;
	private signInForm: HTMLElement;
	private signUpForm: HTMLElement;
	private signInBtn: HTMLElementWithDataset;
	private signUpBtn: HTMLElementWithDataset;
	private signInEmailInput: HTMLInputElement;
	private signInPasswordInput: HTMLInputElement;
	private openEye: HTMLElement;
	private closeEye: HTMLElement;
	private signUpOpenEye: HTMLElement;
	private signUpCloseEye: HTMLElement;
	private signUpConfirmOpenEye: HTMLElement;
	private signUpConfirmCloseEye: HTMLElement;
	private signUpEmailInput: HTMLInputElement;
	private signUpPassInput: HTMLInputElement;
	private signUpConfPassInput: HTMLInputElement;

	constructor() {
		// Class Props
		this.email = "";
		this.password = "";
		this.confirmPassword = "";
		// Header toggle
		this.signInHeaderBtn = document.getElementById("signin-header-btn") as HTMLElementWithDataset;
		this.signUpHeaderBtn = document.getElementById("signup-header-btn") as HTMLElementWithDataset;
		// Forms
		this.signInForm = document.getElementById("signIn-form")!;
		this.signUpForm = document.getElementById("signUp-form")!;
		// Submit forms buttons
		this.signInBtn = document.getElementById("sign-in-btn") as HTMLElementWithDataset;
		this.signUpBtn = document.getElementById("sign-up-btn") as HTMLElementWithDataset;
		/**
		 * Sign In
		 */
		this.signInEmailInput = document.getElementById("email") as HTMLInputElement;
		this.signInPasswordInput = document.getElementById("password") as HTMLInputElement;
		this.openEye = document.getElementById("open-eye-icon")!;
		this.closeEye = document.getElementById("close-eye-icon")!;
		this.signUpOpenEye = document.getElementById("signup-open-eye-icon")!;
		this.signUpCloseEye = document.getElementById("signup-close-eye-icon")!;
		this.signUpConfirmOpenEye = document.getElementById("confirm-open-eye-icon")!;
		this.signUpConfirmCloseEye = document.getElementById("confirm-close-eye-icon")!;
		// Clear Sign Up
		this.signUpEmailInput = document.getElementById("signup-email") as HTMLInputElement;
		this.signUpPassInput = document.getElementById("signup-password") as HTMLInputElement;
		this.signUpConfPassInput = document.getElementById("conform-password") as HTMLInputElement;

		// Global listeners
		this.globalListeners();
	}

	// Global listeners
	globalListeners(): void {
		// Listen Sign In / Sign Up form Toggle
		this.signInHeaderBtn.addEventListener("click", () => this.handleFormToggle(
			{ activeBtn: this.signInHeaderBtn, activeForm: this.signInForm },
			{ oldBtn: this.signUpHeaderBtn, oldForm: this.signUpForm }
		));
		this.signUpHeaderBtn.addEventListener("click", () => this.handleFormToggle(
			{ activeBtn: this.signUpHeaderBtn, activeForm: this.signUpForm },
			{ oldBtn: this.signInHeaderBtn, oldForm: this.signInForm }
		));
		// Listen Sign In / Sign Up form submition
		this.signInBtn.addEventListener("click", (e: Event) => {
			e.preventDefault();
			// Set meta data
			(this.signInBtn as HTMLElementWithDataset).dataset.authButton = "signIn";
			// Call handle authentication method
			this.handleAuthentication(e);
		});
		this.signUpBtn.addEventListener("click", (e: Event) => {
			e.preventDefault();
			// Set meta data
			(this.signUpBtn as HTMLElementWithDataset).dataset.authButton = "signUp";
			// Call handle authentication method
			this.handleAuthentication(e);
		});
		this.openEye.addEventListener("click", () => {
			this.openEye.style.display = "none";
			this.closeEye.style.display = "block";
			this.signInPasswordInput.setAttribute("type", "text")
		});
		this.closeEye.addEventListener("click", () => {
			this.closeEye.style.display = "none";
			this.openEye.style.display = "block";
			this.signInPasswordInput.setAttribute("type", "password")
		});
		// Sign up
		this.signUpOpenEye.addEventListener("click", () => {
			this.signUpOpenEye.style.display = "none";
			this.signUpCloseEye.style.display = "block";
			this.signUpPassInput.setAttribute("type", "text")
		});
		this.signUpCloseEye.addEventListener("click", () => {
			this.signUpCloseEye.style.display = "none";
			this.signUpOpenEye.style.display = "block";
			this.signUpPassInput.setAttribute("type", "password")
		});
		// Confirm
		this.signUpConfirmOpenEye.addEventListener("click", () => {
			this.signUpConfirmOpenEye.style.display = "none";
			this.signUpConfirmCloseEye.style.display = "block";
			this.signUpConfPassInput.setAttribute("type", "text")
		});
		this.signUpConfirmCloseEye.addEventListener("click", () => {
			this.signUpConfirmCloseEye.style.display = "none";
			this.signUpConfirmOpenEye.style.display = "block";
			this.signUpConfPassInput.setAttribute("type", "password")
		});
		/**
		 * Handle form's input sanitization
		 */
		// Sing In
		this.signInEmailInput.addEventListener("input", () => {
			this.signInEmailInput.value = validateEmail(this.signInEmailInput.value);
		});
		this.signInPasswordInput.addEventListener("input", () => {
			this.signInPasswordInput.value = sanitizeInput(this.signInPasswordInput.value);
		});
		// Clear Sign Up
		this.signUpEmailInput.addEventListener("input", () => {
			this.signUpEmailInput.value = validateEmail(this.signUpEmailInput.value);
		});
		this.signUpPassInput.addEventListener("input", () => {
			this.signUpPassInput.value = sanitizeInput(this.signUpPassInput.value);
		});
		this.signUpConfPassInput.addEventListener("input", () => {
			this.signUpConfPassInput.value = sanitizeInput(this.signUpConfPassInput.value);
		});
	}

	// Clear tasks container
	clearForm(): void {
		this.email = "";
		this.password = "";
		this.confirmPassword = "";
		// Clear Sign In
		this.signInEmailInput.value = "";
		this.signInPasswordInput.value = "";
		// Clear Sign Up
		this.signUpEmailInput.value = "";
		this.signUpPassInput.value = "";
		this.signUpConfPassInput.value = "";
	}

	// Get tasks form LocalStorage
	getTasksFromLocalStorage() {
		const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
		return tasks;
	}

	// No tasks message
	showNoDataMessage(taskContainer: HTMLElement): void {
		const messageWrapper = document.createElement("article");
		messageWrapper.setAttribute("class", "message-wrapper");
		const message = document.createElement("p");
		message.setAttribute("class", "noData-message");
		message.textContent = NO_DATA_TEXT;
		messageWrapper.appendChild(message);
		taskContainer.appendChild(messageWrapper);
	}

	// Handle Create a new task
	handleFormToggle({ activeBtn, activeForm }: { activeBtn: HTMLElement, activeForm: HTMLElement }, { oldBtn, oldForm }: { oldBtn: HTMLElement, oldForm: HTMLElement }): void {
		activeBtn.classList.add("active");
		activeForm.style.display = "block";
		oldBtn.classList.remove("active");
		oldForm.style.display = "none";
	}

	// Get logged users from LocalStorage
	getUsers(): IUser[] {
		return JSON.parse(localStorage.getItem("users") || "[]");
	}

	// Save users on localStorage
	saveUsers(users: IUser[]): void {
		localStorage.setItem("users", JSON.stringify(users));
	}

	// Set active user on localStorage
	setActiveUser(user: IUser): void {
		localStorage.setItem("activeUser", JSON.stringify(user));
	}

	handleAuthentication(e: Event): void {
		if ((e.target as HTMLElementWithDataset).dataset.authButton === "signIn") {
			// Get and set input values
			this.email = sanitizeInput(this.signInEmailInput.value);
			this.password = sanitizeInput(this.signInPasswordInput.value);
			// Check empty values
			if (!this.email || !this.password) {
				const sweetAlert = new SweetAlert({ message: EMPTY_VALUES });
				sweetAlert.open();
				return;
			}
			// Get stored users
			const users = this.getUsers();
			// Find user by email and password
			const user = users.find(user => user.email === this.email && this.password === user.password);

			if (user) {
				this.setActiveUser(user);
				window.location.replace("../pages/taskManager.html");
			} else {
				const sweetAlert = new SweetAlert({ message: WRONG_CREDENTIALS });
				sweetAlert.open();
			}
		}
		else {
			// Get input values and sanitize them
			this.email = sanitizeInput(this.signUpEmailInput.value);
			this.password = sanitizeInput(this.signUpPassInput.value);
			this.confirmPassword = sanitizeInput(this.signUpConfPassInput.value);
			// Check empty values
			if (!this.email || !this.password || !this.confirmPassword) {
				const sweetAlert = new SweetAlert({ message: EMPTY_VALUES });
				sweetAlert.open();
				return;
			}
			// Get stored users
			const users = this.getUsers();

			// Check if passwords match
			if (this.password !== this.confirmPassword) {
				const sweetAlert = new SweetAlert({ message: PASSWORDS_DONT_MATCH });
				sweetAlert.open();
				return;
			}
			// Check if email already exist
			if (users.some(user => user.email === this.email)) {
				const sweetAlert = new SweetAlert({ message: EMAIL_ALREADY_EXIST });
				sweetAlert.open();
				return;
			}

			// Create new user Obj
			const newUser: IUser = {
				id: 'd',
				email: this.email,
				password: this.password
			};

			// Set active user
			this.setActiveUser(newUser);
			// Save new user
			users.push(newUser);
			this.saveUsers(users);
			window.location.replace("../pages/taskManager.html");
		}

		// Clear forms
		this.clearForm();
	}
}

// Initialize Task Manager Class
const authentication = new Authentication();
