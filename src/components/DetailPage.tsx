import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button, Paper } from '@mui/material';
import { TaskService, TaskDto } from '../services/TaskService';
import TaskDetailContent from '../tasks/components/TaskDetailContent';
import KeyboardBackspaceOutlinedIcon from '@mui/icons-material/KeyboardBackspaceOutlined';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { state } = useLocation(); // optional: state?.task ile yeniden fetch etmeme
  const taskId = Number(id);
  const [task, setTask] = useState<TaskDto | null>(state?.task || null);
  const [loading, setLoading] = useState(!state?.task);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task || !taskId) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await TaskService.getTask(taskId);
        if (alive) setTask(data);
      } catch (e: any) {
        if (alive) setError(e?.message || 'Görev bulunamadı.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [task, taskId]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960 , mx: 'auto' }}>
      <Button
        startIcon={<KeyboardBackspaceOutlinedIcon />}
        onClick={() => nav(-1)}
        size="medium"
        sx={{ mb: 2 }}
      >
        Geri
      </Button>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!loading && error && (
        <Typography color="error" variant="body2">{error}</Typography>
      )}

      {!loading && task && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <TaskDetailContent task={task} />
        </Paper>
      )}
    </Box>
  );
};

export default TaskDetailPage;