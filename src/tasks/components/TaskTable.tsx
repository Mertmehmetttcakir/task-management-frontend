import React, { useState } from "react";
import { TaskDto } from "../../services/TaskService";
import {  statusLabel, TaskStatus, departmentLabel,assignedDepartment } from "../status";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Stack,
  TablePagination,
} from "@mui/material";

export interface TaskTableProps {
  tasks: TaskDto[];
  saving?: boolean;
  currentUserId?: number | null;
  currentDepartment?: number | null;
  onDetail(task: TaskDto): void;
  onEdit(task: TaskDto): void;
  onDelete(task: TaskDto): void;
  onApprove(task: TaskDto): void;
  onReject(task: TaskDto): void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  saving,
  currentUserId,
  currentDepartment,
  onDetail,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) => {

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [kanbanLimit, setKanbanLimit] = useState(3);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (tasks.length === 0) return <div style={{ padding: 12 }}>Görev bulunamadı.</div>;

  const pagedTasks = tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  return (
    <Paper>
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell style={{ width: 80 }}>ID</TableCell>
            <TableCell>Başlık</TableCell>
            <TableCell>Açıklama</TableCell>
            <TableCell style={{ width: 160 }}>Durum</TableCell>
            <TableCell style={{ width: 160 }}>Departman</TableCell>
            <TableCell style={{ width: 180 }}>Oluşturan</TableCell>
            <TableCell align="right">İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pagedTasks.map((t) => {
            const isOwner = currentUserId === t.user?.id;
            const canActOnDept = currentDepartment != null && currentDepartment === t.assignedDepartment;
            const isPending = t.status === 0;

            return (
              <TableRow key={t.id} hover>
                <TableCell>#{t.id}</TableCell>
                <TableCell>{t.title}</TableCell>
                <TableCell sx={{ maxWidth: 360 }}>
                  <span style={{ display: 'inline-block', maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.description}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={statusLabel(t.status)}
                    color={
                      t.status === TaskStatus.Pending ? 'warning' :
                      t.status === TaskStatus.Approved ? 'success' :
                      t.status === TaskStatus.Rejected ? 'error' : 'default'
                    }
                    variant={(t.status === TaskStatus.Pending || t.status === TaskStatus.Approved || t.status === TaskStatus.Rejected) ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  {/* departman hücresi */}
                  {departmentLabel(t.assignedDepartment as assignedDepartment)}
                </TableCell>
                <TableCell>{t.user?.name}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="text" onClick={() => onDetail(t)}>Detay</Button>

                    {isOwner && (
                      <>
                        <Button size="small" variant="outlined" onClick={() => onEdit(t)}>Düzenle</Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => onDelete(t)}>Sil</Button>
                      </>
                    )}

                    {canActOnDept && (
                      <>
                        <Button size="small" color="primary" variant="contained" onClick={() => onApprove(t)} disabled={!isPending || !!saving}>Onayla</Button>
                        <Button size="small" variant="outlined" onClick={() => onReject(t)} disabled={!isPending || !!saving}>Reddet</Button>
                      </>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>

    <TablePagination sx={{ color: 'white' }}
      component="div"
      count={tasks.length}
      page={page}
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={[5, 10, 25]}
    />
  </Paper>
  );
};
