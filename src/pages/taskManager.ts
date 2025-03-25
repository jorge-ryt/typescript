//@ts-nocheck
import {
    NO_DATA_TEXT,
} from "../constants/taskManagerConst";
import { getTasksFromLocalStorage } from "../components/fileManager";
import TaskCard from "../components/taskCard";

// Define types for the task structure
interface Task {
    isCompleted: boolean;
    priority: "urgent" | "high" | "medium" | "low";
    [key: string]: any;  // Allow for other dynamic properties
}

class TaskManager {
    private static instance: TaskManager | null = null;
    private listenersInitialized: boolean;
    private logoutBtn: HTMLElement | null;
    private sortKey: HTMLSelectElement | null;
    private sortOrderRadios: NodeListOf<HTMLInputElement>;

    private constructor() {
        if (TaskManager.instance) {
            return TaskManager.instance;
        }
        TaskManager.instance = this;
        this.listenersInitialized = false;

        this.logoutBtn = document.getElementById("logout");
        this.sortKey = document.getElementById("sort-key") as HTMLSelectElement;
        this.sortOrderRadios = document.querySelectorAll("input[name='sort-order']");

        // Init
        this.init();
    }

    // Initialization
    private init(): void {
        if (this.listenersInitialized) return;
        this.loadTasks();

        if (this.logoutBtn) {
            this.logoutBtn.addEventListener("click", () => this.handleLogout());
        }
        
        this.sortOrderRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                this.applySorting();
            });
        });

        if (this.sortKey) {
            this.sortKey.addEventListener("change", () => {
                this.applySorting();
            });
        }
        
        // Set min date to deadline
        const currentDate = new Date().toISOString().split('T')[0];
        const deadline = document.getElementById("deadline") as HTMLInputElement;
        if (deadline) {
            deadline.setAttribute("min", currentDate);
        }
        this.listenersInitialized = true;
    }

    // Generate tasks
    private loadTasks(sortedTasks: Task[] = []): void {
        const taskContainer = document.getElementById("tasks") as HTMLElement;
        if (taskContainer && taskContainer.firstChild) this.clearContainer(taskContainer);
        const tasks = sortedTasks.length ? sortedTasks : getTasksFromLocalStorage();

        const priorityOrder: Record<string, number> = {
            "urgent": 1,
            "high": 2,
            "medium": 3,
            "low": 4
        };

        if (!sortedTasks.length) {
            tasks.sort((a, b) => {
                if (a.isCompleted === b.isCompleted) {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                } else {
                    return a.isCompleted ? 1 : -1; // Completed tasks come last
                }
            });
        }

        if (!tasks.length) {
            this.showNoDataMessage(taskContainer);
            return;
        }

        tasks.forEach(task => {
            const taskCardInstance = new TaskCard(task);
            taskContainer.appendChild(taskCardInstance.getCard());
        });
    }

    // Clear tasks container
    private clearContainer(taskContainer: HTMLElement): void {
        while (taskContainer.firstChild) {
            taskContainer.removeChild(taskContainer.firstChild);
        }
    }

    // No tasks message
    private showNoDataMessage(taskContainer: HTMLElement): void {
        const messageWrapper = document.createElement("article");
        messageWrapper.setAttribute("class", "message-wrapper");
        const message = document.createElement("p");
        message.setAttribute("class", "noData-message");
        message.textContent = NO_DATA_TEXT;
        messageWrapper.appendChild(message);
        taskContainer.appendChild(messageWrapper);
    }

    private handleLogout(): void {
        localStorage.removeItem("activeUser");
        window.location.replace("../pages/index.html");
    }

    private applySorting(): void {
        const key = this.sortKey?.value || "priority";
        const sortOrder = document.querySelector("input[name='sort-order']:checked")?.value || "desc";  // Default to "desc"
        if (!key) return;

        let tasks = getTasksFromLocalStorage();

        // Filter incomplete tasks
        const incompleteTasks = tasks.filter((task: Task) => !task.isCompleted);
        
        // Sort incomplete tasks
        incompleteTasks.sort((a, b) => {
            if (a[key] < b[key]) return sortOrder === "asc" ? -1 : 1;
            if (a[key] > b[key]) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        // Filter completed tasks
        const completedTasks = tasks.filter((task: Task) => task.isCompleted);

        // Keep completed tasks at the end
        tasks = [...incompleteTasks, ...completedTasks];

        this.loadTasks(tasks);
    }
}

// export loadTasks method
export const loadTasks = (): void => {
    const taskManager = new TaskManager();
    taskManager.loadTasks();
};

// Initialize Task Manager Class
const taskManager = new TaskManager();
