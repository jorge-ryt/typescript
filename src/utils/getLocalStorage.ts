 import { IUser } from "../interfaces/authentication";
import { ITask } from "../interfaces/taskManager";

 export function getActiveUser(): IUser {
    const activeUser = JSON.parse(localStorage.getItem("activeUser") || "{}");
    return activeUser
}
 
export function getTasksFromLocalStorage(): ITask[] {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]") as ITask[];
    return Array.isArray(tasks) ? tasks : [];
}

export function getTasksByActiveUserLocalStorage(): ITask[] {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]") as ITask[];
    const activeUser = getActiveUser();
    const tasksByActiveUser = tasks.filter(task => task.userId === activeUser.id);
    return Array.isArray(tasksByActiveUser) ? tasksByActiveUser : [];
}