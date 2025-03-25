//@ts-nocheck
import { loadTasks } from "../pages/taskManager";
import SweetAlert from "./sweetAlert";
import { sanitizeInput } from "../utils/sanitizeInput";
import {
    EMPTY_VALUES,
    ERROR_PROCESSING_FILE,
    JSON_WRONG_STRUCTURE
} from "../constants/taskManagerConst";

interface Task {
    id: string;
    userId: string | null;
    title: string;
    priority: string;
    deadline: string;
    isCompleted: boolean;
}

class FileManager {
    private static instance: FileManager;
    private title: string;
    private priority: string;
    private isCompleted: boolean;
    private deadline: string;
    private tasks: Task[];
    private listenersInitialized: boolean;
    private taskTitleInput: HTMLInputElement | null;
    private fileInput: HTMLInputElement | null;
    private downloadBtn: HTMLButtonElement | null;
    private addTaskBtn: HTMLButtonElement | null;

    private constructor() {
        if (FileManager.instance) {
            return FileManager.instance;
        }
        FileManager.instance = this;

        // Class properties
        this.title = "";
        this.priority = "urgent";
        this.isCompleted = false;
        this.deadline = new Date().toISOString().split('T')[0];
        this.tasks = [];
        this.listenersInitialized = false;

        // Cache DOM elements for performance
        this.taskTitleInput = document.getElementById("task-input") as HTMLInputElement | null;
        this.fileInput = document.getElementById("upload-file") as HTMLInputElement | null;
        this.downloadBtn = document.getElementById("download-file") as HTMLButtonElement | null;
        this.addTaskBtn = document.getElementById("add-btn") as HTMLButtonElement | null;

        this.initEventListeners();
    }

    private initEventListeners(): void {
        if (this.listenersInitialized) return;
        // Single event listener setup for task input sanitization
        this.taskTitleInput?.addEventListener("input", this.sanitizeTaskTitleInput.bind(this));

        // Use arrow functions to preserve `this` context and avoid rebinding event listeners
        this.fileInput?.addEventListener("change", (e) => this.uploadTasks(e));
        this.downloadBtn?.addEventListener("click", (e) => this.downloadTasks(e));
        this.addTaskBtn?.addEventListener("click", (e) => this.handleAddNewTask(e));
        this.listenersInitialized = true;
    }

    private sanitizeTaskTitleInput(): void {
        if (this.taskTitleInput) {
            this.taskTitleInput.value = sanitizeInput(this.taskTitleInput.value);
        }
    }

    // Get tasks from LocalStorage
    private getTasksFromLocalStorage(): Task[] {
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]") as Task[];
        const activeUser = JSON.parse(localStorage.getItem("activeUser") || "{}");
        const tasksByActiveUser = tasks.filter(task => task.userId === activeUser.id);
        return Array.isArray(tasksByActiveUser) ? tasksByActiveUser : [];
    }

    // Handle adding a new task
    private handleAddNewTask(e: Event): void {
        e.preventDefault();
        e.stopPropagation();

        if (this.taskTitleInput) {
            this.title = sanitizeInput(this.taskTitleInput.value);
        }
        this.priority = (document.getElementById("priority") as HTMLSelectElement).value;
        this.deadline = (document.getElementById("deadline") as HTMLInputElement).value;

        this.tasks = this.getTasksFromLocalStorage();

        // Check for empty values early to prevent unnecessary task creation
        if (!this.title || !this.priority || !this.deadline) {
            new SweetAlert({ message: EMPTY_VALUES }).open();
            return;
        }

        const activeUser = JSON.parse(localStorage.getItem("activeUser") || "{}");

        // Create new task object
        const newTask: Task = {
            id: uuid.v4(),
            userId: activeUser?.id ?? null,
            title: this.title,
            priority: this.priority,
            deadline: this.deadline,
            isCompleted: this.isCompleted,
        };

        // Save new task to localStorage
        this.tasks.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(this.tasks));

        // Clear input fields
        this.clearInputs();

        loadTasks();
    }

    private clearInputs(): void {
        if (this.taskTitleInput) this.taskTitleInput.value = "";
        (document.getElementById("priority") as HTMLSelectElement).value = "urgent";
        (document.getElementById("deadline") as HTMLInputElement).value = "";
    }

    // Merge new tasks with current ones without duplicating
    private mergeTasks(mergedTasks: Task[]): Task[] {
        const seen = new Set<string>();
        const uniqueTasks = mergedTasks.filter((task) => {
            if (seen.has(task.title)) {
                return false;
            }
            seen.add(task.title);
            return true;
        });
        return uniqueTasks;
    }

    // Download tasks as a JSON file
    private downloadTasks(e: Event): void {
        e.preventDefault();
        e.stopPropagation();

        const blob = new Blob([JSON.stringify(this.tasks, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "tasks.json";
        a.click();
    }

    // Upload and validate tasks from a JSON file
    private uploadTasks(e: Event): void {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.tasks = this.getTasksFromLocalStorage();
                const newTasks = JSON.parse(e.target?.result as string) as Task[];
                if (!Array.isArray(newTasks) || !newTasks.every(this.validateTaskStructure)) {
                    new SweetAlert({ message: JSON_WRONG_STRUCTURE }).open();
                    return;
                }

                // Remove duplicates by merging current and uploaded tasks
                const updatedTasks = this.mergeTasks([...this.tasks, ...newTasks]);
                localStorage.setItem("tasks", JSON.stringify(updatedTasks));

                loadTasks();
            } catch (error) {
                new SweetAlert({ message: ERROR_PROCESSING_FILE }).open();
            }
        };
        reader.readAsText(file);
    }

    // Validate the structure of a task
    private validateTaskStructure(task: any): boolean {
        return (
            typeof task.id === "string" &&
            (typeof task.userId === "string" || task.userId === null) &&
            typeof task.isCompleted === "boolean" &&
            typeof task.title === "string" &&
            typeof task.deadline === "string" &&
            typeof task.priority === "string"
        );
    }
}

export const getTasksFromLocalStorage = (): Task[] => {
    const fileManager = new FileManager();
    return fileManager.getTasksFromLocalStorage();
};

export default FileManager;
