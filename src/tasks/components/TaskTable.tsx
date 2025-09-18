import React from "react";
import { TaskDto } from "../../services/TaskService";
import { statusClass, statusLabel } from "../status";
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
  if (tasks.length === 0) return <div style={{ padding: 12 }}>Görev bulunamadı.</div>;
  return (
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
          {tasks.map((t) => {
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
                  {/* Durum renklendirme: 0=pending->warning (sarı), 1=success (yeşil), 2=error (kırmızı) */}
                  <Chip
                    size="small"
                    label={statusLabel(t.status)}
                    color={
                      t.status === 0 ? 'warning' :
                      t.status === 1 ? 'success' :
                      t.status === 2 ? 'error' : 'default'
                    }
                    variant={(t.status === 0 || t.status === 1 || t.status === 2) ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>{t.assignedDepartment}</TableCell>
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
  );
};
