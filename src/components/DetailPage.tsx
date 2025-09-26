import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Chip,
  Paper,
  Divider,
  IconButton,
  Button,
  Grid,
  Skeleton,
  Tooltip
} from '@mui/material';
import KeyboardBackspaceOutlinedIcon from '@mui/icons-material/KeyboardBackspaceOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { TaskService, TaskDto } from '../services/TaskService';
import { assignedDepartment, departmentLabel } from '../tasks/status';
const statusColorMap: Record<number, 'warning' | 'success' | 'error'> = {
  0: 'warning',
  1: 'success',
  2: 'error'
};

const statusLabel = (s: number) =>
  s === 0 ? 'Pending' : s === 1 ? 'Approved' : 'Rejected';



const TaskDetailPage: React.FC = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { state } = useLocation() as { state?: { task?: TaskDto } };
  const taskId = Number(id);
  const [task, setTask] = useState<TaskDto | null>(state?.task || null);
  const [loading, setLoading] = useState(!state?.task);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const t = await TaskService.getTask(taskId);
      setTask(t);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Görev yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (!task) load();
  }, [task, load]);

  const onApprove = async () => {
    if (!task) return;
    setSaving(true);
    try {
      await TaskService.completeTask(task.id, 1);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Onay başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const onReject = async () => {
    if (!task) return;
    setSaving(true);
    try {
      await TaskService.completeTask(task.id, 2);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Reddetme başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    if (!task) return;
    // Yönlendirme tabanlı çözüm
    nav(`/tasks/${task.id}/edit`, { state: { task } });

    // Eğer modal kullanacaksan (örnek):
    // uiStore.openTaskEdit(task);
  };

  const MetaItem: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <Box>
      <Typography variant="caption" sx={{ opacity: .6 }}>{label}</Typography>
      <Typography variant="body2" fontWeight={500} noWrap>
        {value ?? <span style={{ opacity: .4 }}>—</span>}
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
          {loading ? 'Görev Detayı' : task ? `#${task.id} ${task.title}` : 'Görev'}
        </Typography>
        {loading && <Skeleton width={90} height={32} />}
        {!loading && task && (
          <Chip
            size="small"
            color={statusColorMap[task.status]}
            label={statusLabel(task.status)}
            sx={{ fontWeight: 600 }}
          />
        )}
        <Tooltip title="Yenile">
          <span>
            <IconButton size="small" onClick={load} disabled={loading || saving}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Düzenle">
          <span>
            <IconButton
              size="small"
              disabled={saving || loading || !task}
              onClick={handleEdit}
              
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Sil">
          <span>
            <IconButton size="small" color="error" disabled={saving || loading || !task}>
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
          {/* Meta Bilgiler */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}><MetaItem label="ID" value={`#${task.id}`} /></Grid>
                <Grid item xs={12} sm={3}><MetaItem label="Departman" value={departmentLabel(task.assignedDepartment)} /></Grid>
                <Grid item xs={12} sm={3}><MetaItem label="Oluşturan" value={task.user.name} /></Grid>
                <Grid item xs={12} sm={3}><MetaItem label="Durum" value={
                  <Chip size="small" color={statusColorMap[task.status]} label={statusLabel(task.status)} />
                } /></Grid>
              </Grid>
            </Paper>

          {/* Açıklama */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                Açıklama
              </Typography>
              <Divider />
              {task.description
                ? <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{task.description}</Typography>
                : <Typography variant="body2" sx={{ opacity: .6, fontStyle: 'italic' }}>Açıklama yok</Typography>}
            </Stack>
          </Paper>

          {/* İşlem Alanı */}
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
                    onClick={onApprove}
                    disabled={saving}
                  >
                    Onayla
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<HighlightOffOutlinedIcon />}
                    onClick={onReject}
                    disabled={saving}
                  >
                    Reddet
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          )}

          {/* Placeholder - Log */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              Aktivite / Log (Yakında)
            </Typography>
            <Typography variant="body2" sx={{ opacity: .55 }}>
              Durum değişiklikleri ve yorumlar burada listelenecek.
            </Typography>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default TaskDetailPage;