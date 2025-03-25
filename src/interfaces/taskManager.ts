import { TPriority } from "@/types/taskManager";

export interface ITask {
	title: string;
	id: string;
	userId: string;
	priority: TPriority;
	deadline: string
	isCompleted: boolean;
}
