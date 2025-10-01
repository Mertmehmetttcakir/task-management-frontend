import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Typography,
  Chip,
  Box,
  Grid,
  Divider,
  Button
} from "@mui/material";
import PendingOutlinedIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/Apartment";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";
import { statusLabel, statusColorMap, departmentLabel } from '../status';
import { observer } from 'mobx-react-lite';
import taskStore from '../../stores/taskStore';
import uiStore from '../../stores/uiStore';
import { TaskStatus } from "../../services/TaskService";
interface TaskDetailContentProps {
  taskId: number;
  onEdit?: () => void;
}

const statusConfig: Record<
  TaskStatus,
  { color: "warning" | "success" | "error"; icon: React.ReactElement }
> = {
  [TaskStatus.Pending]: {
    color: "warning",
    icon: <PendingOutlinedIcon fontSize="small" />
  },
  [TaskStatus.Approved]: {
    color: "success",
    icon: <CheckCircleOutlineIcon fontSize="small" />
  },
  [TaskStatus.Rejected]: {
    color: "error",
    icon: <CancelOutlinedIcon fontSize="small" />
  }
};

export const TaskDetailContent: React.FC<TaskDetailContentProps> = observer(({ taskId, onEdit }) => {
  const task = taskStore.getTask(taskId);
  const { mutating } = taskStore;

  if (!task) {
    return <Typography variant="body2" sx={{ opacity: .6 }}>Görev bulunamadı.</Typography>;
  }

  const approve = async () => {
    try {
      await taskStore.approve(task.id);
      uiStore.onShowSuccessModal?.('Görev onaylandı.');
    } catch (e: any) {
      uiStore.onShowErrorModal?.(e?.response?.data?.message || 'Onay başarısız.');
    }
  };

  const reject = () => {
    uiStore.onShowConditionModal?.(
      `#${task.id} - ${task.title} reddedilsin mi?`,
      async () => {
        try {
          await taskStore.reject(task.id);
          uiStore.onHideConditionModal?.();
          uiStore.onShowSuccessModal?.('Görev reddedildi.');
        } catch (e: any) {
          uiStore.onHideConditionModal?.();
          uiStore.onShowErrorModal?.(e?.response?.data?.message || 'Reddetme başarısız.');
        }
      },
      () => uiStore.onHideConditionModal?.(),
      'Reddet'
    );
  };

  const cfg = statusConfig[task.status];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(248,248,248,0.7))",
        backdropFilter: "blur(3px)"
      }}
    >
      <CardHeader
        titleTypographyProps={{ fontSize: 20, fontWeight: 600 }}
        title={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              size="small"
              icon={<TagOutlinedIcon sx={{ fontSize: 16 }} />}
              label={`#${task.id}`}
              variant="outlined"
              sx={{
                fontWeight: 500,
                "& .MuiChip-label": { px: 0.5 },
                bgcolor: "background.paper"
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: 0.2
              }}
            >
              {task.title}
            </Typography>
            <Chip
              size="small"
              color={cfg.color}
              icon={cfg.icon}
              label={statusLabel(task.status)}
              sx={{
                fontWeight: 500,
                ml: 1,
                "& .MuiChip-label": { px: 0.75 }
              }}
            />
          </Stack>
        }
        sx={{ pb: 0.5 }}
      />
      <CardContent sx={{ pt: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  Departman
                </Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<ApartmentOutlinedIcon sx={{ fontSize: 16 }} />}
                  label={task.assignedDepartment}
                />
              </Stack>
            </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={0.5}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "text.secondary" }}
              >
                Oluşturan
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                icon={<PersonOutlineIcon sx={{ fontSize: 16 }} />}
                label={task.user?.name || "—"}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={0.5}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "text.secondary" }}
              >
                Kullanıcı ID
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}> 
                {task.user?.id ?? "—"}
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: "text.secondary", mb: 0.75, display: "block" }}
        >
          Açıklama
        </Typography>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            fontSize: 14,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            minHeight: 60
          }}
        >
          {task.description?.trim() ? (
            task.description
          ) : (
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
              Açıklama eklenmemiş.
            </Typography>
          )}
        </Box>

        {task.status === 0 && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              color="success"
              disabled={mutating}
              onClick={approve}
            >Onayla</Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              disabled={mutating}
              onClick={reject}
            >Reddet</Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
});

export default TaskDetailContent;

