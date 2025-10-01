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
export const statusColorMap: Record<number, 'warning' | 'success' | 'error'> = {
  0: 'warning',
  1: 'success',
  2: 'error'
};

export const statusLabel = (s: number) =>
  s === 0 ? 'Pending' : s === 1 ? 'Approved' : 'Rejected';

// Departman label 
export const departmentLabel = (d?: number | null): string =>
  d == null ? '—' : assignedDepartment[d] ;


/* -------- Department Helpers (paralel yapı) -------- */

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

