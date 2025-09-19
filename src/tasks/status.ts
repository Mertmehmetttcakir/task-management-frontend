export enum TaskStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}
export enum assignedDepartment {
  Sales = 0,
  HR = 1,
  Finance = 2,
}

export const statusLabel = (s: TaskStatus): string => {
  switch (s) {
    case TaskStatus.Pending:
      return "Pending";
    case TaskStatus.Approved:
      return "Approved";
    case TaskStatus.Rejected:
      return "Rejected";
    default:
      return `Unknown(${s})`;
  }
};

export const statusClass = (s: TaskStatus) => {
  switch (s) {
    case TaskStatus.Pending:
      return { pill: "status-pill pending", dot: "status-dot pending" };
    case TaskStatus.Approved:
      return { pill: "status-pill approved", dot: "status-dot approved" };
    case TaskStatus.Rejected:
      return { pill: "status-pill rejected", dot: "status-dot rejected" };
    default:
      return { pill: "status-pill unknown", dot: "status-dot unknown" };
  }
};

/* -------- Department Helpers (paralel yapı) -------- */

export const departmentLabel = (d: assignedDepartment): string => {
  switch (d) {
    case assignedDepartment.Sales:
      return "Sales";
    case assignedDepartment.HR:
      return "HR";
    case assignedDepartment.Finance:
      return "Finance";
    default:
      return `Unknown(${d})`;
  }
};

export const departmentClass = (d: assignedDepartment) => {
  switch (d) {
    case assignedDepartment.Sales:
      return { pill: "dept-pill sales", dot: "dept-dot sales" };
    case assignedDepartment.HR:
      return { pill: "dept-pill hr", dot: "dept-dot hr" };
    case assignedDepartment.Finance:
      return { pill: "dept-pill finance", dot: "dept-dot finance" };
    default:
      return { pill: "dept-pill unknown", dot: "dept-dot unknown" };
  }
};

/**
 * Select / autocomplete gibi yerlerde kullanmak için opsiyon listesi.
 */
export const departmentOptions = [
  {
    value: assignedDepartment.Sales,
    label: departmentLabel(assignedDepartment.Sales),
  },
  { value: assignedDepartment.HR, label: departmentLabel(assignedDepartment.HR) },
  {
    value: assignedDepartment.Finance,
    label: departmentLabel(assignedDepartment.Finance),
  },
];

/**
 * UI'da ortak kullanım için (ör: Chip renkleri) mapping önerisi.
 * İstersen MUI Chip color prop ile eşle.
 */
export const departmentChipColor = (d: assignedDepartment):
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "default" => {
  switch (d) {
    case assignedDepartment.Sales:
      return "info";
    case assignedDepartment.HR:
      return "secondary";
    case assignedDepartment.Finance:
      return "warning";
    default:
      return "default";
  }
};

