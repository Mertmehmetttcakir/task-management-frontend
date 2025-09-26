import { TaskDto } from "../../services/TaskService";



export interface TaskKanbanBoardProps {
  tasks: TaskDto[];
  saving?: boolean;
  canChangeStatus(task: TaskDto): boolean;
  onDetail(task: TaskDto): void;
  onEdit?(task: TaskDto): void;
  onDelete?(task: TaskDto): void;
}
