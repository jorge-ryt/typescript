
import { taskManagerInstance } from "@/pages/taskManager";
import SweetAlert from "@/components/sweetAlert";
import { getTasksFromLocalStorage } from "@/utils/getLocalStorage";
import {
    ERROR_PROCESSING_FILE,
    JSON_WRONG_STRUCTURE
} from "@/constants/taskManagerConst";
import { ITask } from "@/interfaces/taskManager";

document.addEventListener("DOMContentLoaded", () => {
    new FileManager();
})

class FileManager {
    // private static instance: FileManager;
    private tasks!: ITask[];
    private listenersInitialized!: boolean;
    private fileInput!: HTMLInputElement | null;
    private downloadBtn!: HTMLButtonElement | null;

    public constructor() {
        // if (FileManager.instance) {
        //     return FileManager.instance;
        // }
        // FileManager.instance = this;

        // Class properties
        this.tasks = [];
        this.listenersInitialized = false;

        // Cache DOM elements for performance
        this.fileInput = document.getElementById("upload-file") as HTMLInputElement | null;
        this.downloadBtn = document.getElementById("download-file") as HTMLButtonElement | null;

        this.initEventListeners();
    }

    private initEventListeners(): void {
        if (this.listenersInitialized) return;

        // Actions (Upload / Download file)
        this.fileInput?.addEventListener("change", (e) => this.uploadTasks(e));
        this.downloadBtn?.addEventListener("click", (e) => this.downloadTasks(e));
        // Flag to avoid unnecessary initializations
        this.listenersInitialized = true;
    }

    // Merge new tasks with current ones without duplicating
    private mergeTasks(mergedTasks: ITask[]): ITask[] {
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
                this.tasks = getTasksFromLocalStorage();
                const newTasks = JSON.parse(e.target?.result as string) as ITask[];
                if (!Array.isArray(newTasks) || !newTasks.every(this.validateTaskStructure)) {
                    new SweetAlert({ message: JSON_WRONG_STRUCTURE }).open();
                    return;
                }

                // Remove duplicates by merging current and uploaded tasks
                const updatedTasks = this.mergeTasks([...this.tasks, ...newTasks]);
                localStorage.setItem("tasks", JSON.stringify(updatedTasks));

                taskManagerInstance.loadTasks();
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
