import React, { useState, useMemo } from 'react';
import { TaskDto } from '../../services/TaskService';
import { statusLabel, TaskStatus, departmentLabel, assignedDepartment, statusColorMap } from '../status';
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
} from '@mui/material';
import { taskStore } from '../../stores/taskStore';
import { uiStore } from '../../stores/uiStore';

export interface TaskTableProps {
  tasks?: TaskDto[];
  currentUserId?: number | null;
  currentDepartment?: number | null;
  onDetail?: (t: TaskDto) => void;
  onEdit?: (t: TaskDto) => void;
  onApprove?: (t: TaskDto) => void;
  onReject?: (t: TaskDto) => void;
  onDelete?: (t: TaskDto) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  currentUserId,
  currentDepartment,
  onDetail,
  onEdit,
  onApprove,
  onReject,
  onDelete,
}) => {
  const list = tasks ?? taskStore.filteredTasks;
  const { mutating } = taskStore;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (!list || list.length === 0) return <div style={{ padding: 12 }}>Görev bulunamadı.</div>;

  const pagedTasks = useMemo(
    () => list.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [list, page, rowsPerPage]
  );

  const handleApprove = async (t: TaskDto) => {
    if (onApprove) return onApprove(t);
    if (t.status !== TaskStatus.Pending) return;
    try {
      await taskStore.approve(t.id);
      uiStore.onShowSuccessModal?.('Görev onaylandı');
    } catch (e: any) {
      uiStore.onShowErrorModal?.(e?.response?.data?.message || 'Onay başarısız');
    }
  };

  const handleReject = (t: TaskDto) => {
    if (onReject) return onReject(t);
    if (t.status !== TaskStatus.Pending) return;
    uiStore.onShowConditionModal?.(
      `#${t.id} - ${t.title} reddedilsin mi?`,
      async () => {
        try {
          await taskStore.reject(t.id);
          uiStore.onHideConditionModal?.();
          uiStore.onShowSuccessModal?.('Görev reddedildi');
        } catch (e: any) {
          uiStore.onHideConditionModal?.();
          uiStore.onShowErrorModal?.(e?.response?.data?.message || 'Reddetme başarısız');
        }
      },
      () => uiStore.onHideConditionModal?.(),
      'Reddet'
    );
  };

  const handleDelete = (t: TaskDto) => {
    if (onDelete) return onDelete(t);
    uiStore.onShowConditionModal?.(
      `#${t.id} - ${t.title} silinsin mi?`,
      async () => {
        try {
          await taskStore.remove(t.id);
          uiStore.onHideConditionModal?.();
          uiStore.onShowSuccessModal?.('Görev silindi');
        } catch (e: any) {
          uiStore.onHideConditionModal?.();
          uiStore.onShowErrorModal?.(e?.response?.data?.message || 'Silme başarısız');
        }
      },
      () => uiStore.onHideConditionModal?.(),
      'Sil'
    );
  };

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
              const isPending = t.status === TaskStatus.Pending;

              return (
                <TableRow key={t.id} hover>
                  <TableCell>#{t.id}</TableCell>
                  <TableCell>{t.title}</TableCell>
                  <TableCell sx={{ maxWidth: 360 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        maxWidth: 360,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {t.description}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={statusLabel(t.status)}
                      color={statusColorMap[t.status as TaskStatus] ?? 'default'}
                      variant={
                        t.status === TaskStatus.Pending ||
                        t.status === TaskStatus.Approved ||
                        t.status === TaskStatus.Rejected
                          ? 'filled'
                          : 'outlined'
                      }
                    />
                  </TableCell>
                  <TableCell>{departmentLabel(t.assignedDepartment as assignedDepartment)}</TableCell>
                  <TableCell>{t.user?.name}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="text" onClick={() => onDetail?.(t)}>
                        Detay
                      </Button>

                      {isOwner && (
                        <>
                          <Button size="small" variant="outlined" onClick={() => onEdit?.(t)}>
                            Düzenle
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            disabled={!!mutating}
                            onClick={() => handleDelete(t)}
                          >
                            Sil
                          </Button>
                        </>
                      )}

                      {canActOnDept && (
                        <>
                          <Button
                            size="small"
                            color="primary"
                            variant="contained"
                            onClick={() => handleApprove(t)}
                            disabled={!isPending || !!mutating}
                          >
                            Onayla
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleReject(t)}
                            disabled={!isPending || !!mutating}
                          >
                            Reddet
                          </Button>
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

      <TablePagination
        sx={{ color: 'white' }}
        component="div"
        count={list.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
};
