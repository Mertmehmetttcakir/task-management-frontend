import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Stack, Typography, Chip, Paper, Divider, IconButton, Button,
  Grid, Skeleton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField 
} from '@mui/material';
import KeyboardBackspaceOutlinedIcon from '@mui/icons-material/KeyboardBackspaceOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { observer } from 'mobx-react-lite';
import taskStore from '../stores/taskStore';
import {uiStore} from '../stores/uiStore';
import UnstyledTabsCustomized from './UnstyledTabsCustomized';
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";


const statusColorMap: Record<number, 'warning' | 'success' | 'error'> = {
  0: 'warning',
  1: 'success',
  2: 'error'
};
const statusLabel = (s: number) =>
  s === 0 ? 'Pending' : s === 1 ? 'Approved' : 'Rejected';

const TaskDetailPage: React.FC = observer(() => {
  const { id } = useParams();
  const nav = useNavigate();
  const taskId = Number(id);

  // Store kaynaklı reactive state
  const task = taskStore.getTask(taskId);
  const { loading, error, mutating } = taskStore;

  // Sadece UI (dialog) local state
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // İlk yükleme / eksikse fetch
  useEffect(() => {
    if (!isNaN(taskId) && !task && !loading) {
      taskStore.fetchTask(taskId);
    }
  }, [taskId, task, loading]);

  const refresh = () => {
    if (!isNaN(taskId)) taskStore.fetchTask(taskId);
  };

  const handleEditOpen = () => {
    if (!task) return;
    setEditTitle(task.title || '');
    setEditDesc(task.description || '');
    setEditOpen(true);
  };
  const handleEditClose = () => {
    if (mutating) return;
    setEditOpen(false);
  };
  const handleEditSave = async () => {
    if (!task || !editTitle.trim()) return;
    try {
      await taskStore.updateTask(task.id, {
        title: editTitle.trim(),
        description: editDesc.trim()
      });
      uiStore.onShowSuccessModal?.('Görev güncellendi.');
      setEditOpen(false);
    } catch (e: any) {
      uiStore.onShowErrorModal?.(
        e?.response?.data?.message || 'Güncelleme başarısız.'
      );
    }
  };

  const handleApprove = async () => {
    if (!task) return;
    try {
      await taskStore.approve(task.id);
      uiStore.onShowSuccessModal?.('Görev onaylandı.');
    } catch (e: any) {
      uiStore.onShowErrorModal?.(
        e?.response?.data?.message || 'Onay başarısız.'
      );
    }
  };

  const handleReject = async () => {
    if (!task) return;
    uiStore.onShowConditionModal?.(
      `#${task.id} - ${task.title} reddedilsin mi?`,
      async () => {
        try {
          await taskStore.reject(task.id);
          uiStore.onHideConditionModal?.();
          uiStore.onShowSuccessModal?.('Görev reddedildi.');
        } catch (e: any) {
          uiStore.onHideConditionModal?.();
          uiStore.onShowErrorModal?.(
            e?.response?.data?.message || 'Reddetme başarısız.'
          );
        }
      },
      () => uiStore.onHideConditionModal?.(),
      'Reddet'
    );
  };

  const handleDelete = async () => {
    if (!task) return;
    uiStore.onShowConditionModal?.(
    
      `#${task.id} - ${task.title} silinsin mi?`,
      async () => {
        try {
          await taskStore.remove(task.id);
          uiStore.onHideConditionModal?.();
          uiStore.onShowSuccessModal?.('Görev silindi.');
          nav(`/tasks`);
        } catch (e: any) {
          uiStore.onHideConditionModal?.();
          uiStore.onShowErrorModal?.(
            e?.response?.data?.message || 'Silme başarısız.'
          );
        }
      },
      () => uiStore.onHideConditionModal?.(),
      'Sil'
    );
  };

  const MetaItem: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <Box>
      <Typography variant="caption" sx={{ opacity: 0.6 }}>{label}</Typography>
      <Typography variant="body2" fontWeight={500} noWrap>
        {value ?? <span style={{ opacity: 0.4 }}>—</span>}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        maxWidth: 1100,
        mx: 'auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {/* Üst Bar */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button
          startIcon={<KeyboardBackspaceOutlinedIcon />}
          onClick={() => nav(-1)}
          size="small"
          variant="outlined"
        >
          Geri
        </Button>
        <Typography variant="h5" fontWeight={600} sx={{ flex: 1 }}>
          {loading && !task
            ? 'Görev Detayı'
            : task
              ? `#${task.id} ${task.title}`
              : 'Görev'}
        </Typography>
        {loading && !task && <Skeleton width={90} height={32} />}
        {task && (
            <Chip
              size="small"
              color={statusColorMap[task.status]}
              label={statusLabel(task.status)}
              sx={{ fontWeight: 600 }}
            />
        )}
        <Tooltip title="Düzenle">
          <span>
            <IconButton
              size="small"
              disabled={mutating || loading || !task}
              onClick={handleEditOpen}
            >
              <Typography component="span" sx={{ mr: 1 }}>Düzenle</Typography>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Sil">
          <span>
            <IconButton
              size="small"
              color="error"
              disabled={mutating || loading || !task}
              onClick={handleDelete}
            >
              <Typography component="span" sx={{ mr: 1 }}>Sil</Typography>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {error && (
        <Paper variant="outlined" sx={{ p: 2, borderColor: 'error.main' }}>
          <Typography color="error" variant="body2">{error}</Typography>
        </Paper>
      )}

      {loading && !task && (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={90} />
          <Skeleton variant="rounded" height={150} />
          <Skeleton variant="rounded" height={210} />
        </Stack>
      )}

      {!loading && task && (
        <> 
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <UnstyledTabsCustomized taskId={task.id}>
          </UnstyledTabsCustomized> 
          </Box>

          {/* Meta Bilgiler
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <MetaItem label="ID" value={`#${task.id}`} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <MetaItem
                  label="Departman"
                  value={departmentLabel(task.assignedDepartment || 0)}
                /> 
              </Grid>
              <Grid item xs={12} sm={3}>
                <MetaItem
                  label="Oluşturan"
                  value={task.user?.name}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <MetaItem
                  label="Durum"
                  value={
                    <Chip
                      size="small"
                      color={statusColorMap[task.status]}
                      label={statusLabel(task.status)}
                    />
                  }
                />
              </Grid>
            </Grid>
          </Paper> */}

          {/* Açıklama */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="desc-content"
          id="desc-header"
        >
          <Typography component="span">Açıklama</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            {task.description || "Açıklama bulunmamaktadır."}
          </Typography>
        </AccordionDetails>
      </Accordion>
            </Stack>
          </Paper>

            {/* Onay / Reddet */}
            {task.status === 0 && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                  <Typography variant="subtitle2" sx={{ flex: 1 }}>
                    Bu görevi onaylayabilir veya reddedebilirsiniz.
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleOutlineIcon />}
                      onClick={handleApprove}
                      disabled={mutating}
                    >
                      Onayla
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<HighlightOffOutlinedIcon />}
                      onClick={handleReject}
                      disabled={mutating}
                    >
                      Reddet
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            )}

          {/* Düzenleme Dialogu */}
          <Dialog
            open={editOpen}
            onClose={mutating ? undefined : handleEditClose}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Görev Düzenle</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Başlık"
                  size="small"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                  autoFocus
                  disabled={mutating}
                />
                <TextField
                  label="Açıklama"
                  size="small"
                  multiline
                  minRows={3}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  disabled={mutating}
                />
                {/* Departman seçimi gerekiyorsa burada ekleyebilirsin */}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                variant="text"
                onClick={handleEditClose}
                disabled={mutating}
              >
                Vazgeç
              </Button>
              <Button
                variant="contained"
                onClick={handleEditSave}
                disabled={mutating || !editTitle.trim()}
              >
                {mutating ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
});

export default TaskDetailPage;