import { TaskStatus } from "../services/TaskService";

export const statusLabel = (s: number | TaskStatus): string => {
  switch (s) {
    case 0:
      return "Pending";
    case 1:
      return "Completed";
    case 2:
      return "Rejected";
    default:
      return `Unknown(${s})`;
  }
};

export const statusClass = (s: number | TaskStatus) => {
  switch (statusLabel(s)) {
    case "Pending":
      return { pill: "badge badge--pending", dot: "badge-dot badge-dot--pending" };
    case "Completed":
      return { pill: "badge badge--completed", dot: "badge-dot badge-dot--completed" };
    case "Rejected":
      return { pill: "badge badge--rejected", dot: "badge-dot badge-dot--rejected" };
    default:
      return { pill: "badge badge--unknown", dot: "badge-dot badge-dot--unknown" };
  }
};
