import ModalConfirmation from '@/components/modalConfirmation';
import ModalEdit from '@/components/modalEdit';
import { taskManagerInstance } from "@/pages/taskManager";
import { ITask } from '@/interfaces/taskManager';
import { getTasksFromLocalStorage } from '@/utils/getLocalStorage';

class TaskCard {
  private task: ITask;
  private tasks: ITask[];
  private taskCard: HTMLElement;

  constructor(task: ITask) {
    this.task = task;
    this.tasks = getTasksFromLocalStorage();
    this.taskCard = document.createElement("article");
    this.taskCard.setAttribute("class", "card");

    // Create task card elements
    this.createCard();
  }

  /**
   * Create the task card UI elements and append them
   */
  private createCard(): void {
    const { task } = this;

    // Checkbox
    const checkbox = document.createElement("input") as HTMLInputElement;
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
   * @param taskId - Task ID
   */
  private handleMarkAsDone(taskId: string): void {

    const newTasks = this.tasks.map((task) => {
        
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
    taskManagerInstance.loadTasks();
  }

  /**
   * Handle edit task
   * @param task - Updated task object
   */
  private handleEditTask({ id, title, priority, deadline }: ITask): void {
    const tasks = JSON.parse(localStorage.getItem("tasks") || '[]') as ITask[];

    const newTasks = tasks.map((task) => {
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
    taskManagerInstance.loadTasks();
  }

  /**
   * Returns the task card element
   */
  public getCard(): HTMLElement {
    return this.taskCard;
  }
}

export default TaskCard;
