import { ITask } from "@/interfaces/taskManager";

export type TPriority = "urgent" | "high" | "medium" | "low";
export type TOnUpdate = (task: ITask) => void;
