import { v4 as uuidv4 } from 'uuid';
// Components
import SweetAlert from "@/components/sweetAlert";
import TaskCard from "@/components/taskCard";
import { ITask } from "@/interfaces/taskManager";
import { TPriority } from "@/types/taskManager";
// Constants
import {
    EMPTY_VALUES,
    NO_DATA_TEXT,
} from "@/constants/taskManagerConst";
// Utils
import { sanitizeInput } from "@/utils/sanitizeInput";
import { getTasksFromLocalStorage, getTasksByActiveUserLocalStorage, getActiveUser } from "@/utils/getLocalStorage";
import { IUser } from '@/interfaces/authentication';

class TaskManager {
    private title: string = "";
    private priority: TPriority = "urgent";
    private isCompleted: boolean = false;
    private deadline: string | null = null;
    private listenersInitialized: boolean = false;
    private logoutBtn: HTMLButtonElement | null = null;
    private sortKey: HTMLSelectElement | null = null;
    private sortOrderRadios!: NodeListOf<HTMLInputElement>;
    private taskTitleInput!: HTMLInputElement | null;
    private addTaskBtn: HTMLButtonElement | null = null;

    public constructor() {
        this.title = "";
        this.priority = "urgent";
        this.isCompleted = false;
        this.deadline = new Date().toISOString().split('T')[0] ?? null;
        this.listenersInitialized = false;

        this.taskTitleInput = document.getElementById("task-input") as HTMLInputElement | null;
        this.addTaskBtn = document.getElementById("add-btn") as HTMLButtonElement | null;
        this.logoutBtn = document.getElementById("logout") as HTMLButtonElement;
        this.sortKey = document.getElementById("sort-key") as HTMLSelectElement;
        this.sortOrderRadios = document.querySelectorAll("input[name='sort-order']");

        // Init
        this.init();
    }

    // Initialization
    private init(): void {
        if (this.listenersInitialized) return;
        this.loadTasks();

        this.taskTitleInput?.addEventListener("input", this.sanitizeTaskTitleInput.bind(this));

        // Add task
        this.addTaskBtn?.addEventListener("click", (e) => this.handleAddNewTask(e));

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
        const currentDate = new Date().toISOString().split('T')[0] ?? "";
        const deadline = document.getElementById("deadline") as HTMLInputElement;
        if (deadline) {
            deadline.setAttribute("min", currentDate);
        }
        this.listenersInitialized = true;
    }

    private sanitizeTaskTitleInput(): void {
        if (this.taskTitleInput) {
            this.taskTitleInput.value = sanitizeInput(this.taskTitleInput.value);
        }
    }

    // Generate tasks
    public loadTasks(sortedTasks: ITask[] = []): void {
        const taskContainer = document.getElementById("tasks") as HTMLElement;
        if (taskContainer && taskContainer.firstChild) this.clearContainer(taskContainer);
        const tasks = sortedTasks.length ? sortedTasks : getTasksByActiveUserLocalStorage();

        const priorityOrder: Record<string, number> = {
            "urgent": 1,
            "high": 2,
            "medium": 3,
            "low": 4
        };

        if (!sortedTasks.length) {
            tasks.sort((a, b) => {
                if (a.isCompleted === b.isCompleted) {
                    const aPriority = priorityOrder[a.priority as TPriority] ?? Infinity;
                    const bPriority = priorityOrder[b.priority as TPriority] ?? Infinity;
        
                    return aPriority - bPriority;
                } else {
                    return a.isCompleted ? 1 : -1; // Completed tasks come last
                }
            });
        }

        if (!tasks.length) {
            this.showNoDataMessage(taskContainer);
            return;
        }

        // Get Active user
        const activeUser: IUser = getActiveUser();

        tasks.forEach(task => {
            const { id } = activeUser;
            const taskCardInstance = new TaskCard({...task, userId: id} as ITask);
            taskContainer.appendChild(taskCardInstance.getCard());
        });
    }

    // Clear tasks container
    private clearContainer(taskContainer: HTMLElement): void {
        while (taskContainer.firstChild) {
            taskContainer.removeChild(taskContainer.firstChild);
        }
    }

    // Handle adding a new task
    private handleAddNewTask(e: Event): void {
        e.preventDefault();
        e.stopPropagation();
        console.log("The button was click");

        if (this.taskTitleInput) {
            this.title = sanitizeInput(this.taskTitleInput.value);
        }
        this.priority = (document.getElementById("priority") as HTMLSelectElement).value as TPriority;
        this.deadline = (document.getElementById("deadline") as HTMLInputElement).value;

        const tasks = getTasksFromLocalStorage();

        // Check for empty values early to prevent unnecessary task creation
        if (!this.title || !this.priority || !this.deadline) {
            new SweetAlert({ message: EMPTY_VALUES }).open();
            return;
        }

        const activeUser = JSON.parse(localStorage.getItem("activeUser") || "{}");

        // Create new task object
        const newTask: ITask = {
            id: uuidv4(),
            userId: activeUser?.id ?? null,
            title: this.title,
            priority: this.priority,
            deadline: this.deadline,
            isCompleted: this.isCompleted,
        };

        // Save new task to localStorage
        tasks.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(tasks));

        // Clear input fields
        this.clearInputs();

        this.loadTasks();
    }

    private clearInputs(): void {
        if (this.taskTitleInput) this.taskTitleInput.value = "";
        (document.getElementById("priority") as HTMLSelectElement).value = "urgent";
        (document.getElementById("deadline") as HTMLInputElement).value = "";
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
        const sortOrderElement = document.querySelector("input[name='sort-order']:checked") as HTMLInputElement;
        const sortOrder = sortOrderElement ? sortOrderElement.value : "desc";
        if (!key) return;

        let tasks: ITask[] = getTasksFromLocalStorage();

        // Filter incomplete tasks
        const incompleteTasks: ITask[] = tasks.filter((task: ITask) => !task.isCompleted);
        
        // Sort incomplete tasks
        incompleteTasks.sort((a, b) => {
            if ((a[key as keyof ITask] as string) < (b[key as keyof ITask] as string)) return sortOrder === "asc" ? -1 : 1;
            if ((a[key as keyof ITask] as string) > (b[key as keyof ITask] as string)) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        // Filter completed tasks
        const completedTasks = tasks.filter((task: ITask) => task.isCompleted);

        // Keep completed tasks at the end
        tasks = [...incompleteTasks, ...completedTasks];

        this.loadTasks(tasks);
    }
}

// Create a singleton instance of TaskManager
const taskManagerInstance = new TaskManager();

// Export the singleton instance so it can be accessed from other files
export { taskManagerInstance };

