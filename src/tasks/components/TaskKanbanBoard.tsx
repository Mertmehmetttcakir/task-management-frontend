import React, { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Card, CardContent, Typography, Stack, Box, Chip, Paper,
  IconButton, Button
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { observer } from 'mobx-react-lite';
import { statusLabel, TaskStatus, departmentLabel } from '../status';
import { TaskKanbanBoardProps } from './TaskKanbanBoardProps';
import taskStore from '../../stores/taskStore';
import { uiStore } from '../../stores/uiStore';

// Tekrarlanan status tablosu (merkezi tanım varsa oradan da alabilirsin)
const statusColumns: { id: string; status: TaskStatus; title: string; color: 'warning' | 'error' | 'success' }[] = [
  { id: 'pending', status: TaskStatus.Pending, title: 'Pending',  color: 'warning' },
  { id: 'approved', status: TaskStatus.Approved, title: 'Approved', color: 'success' },
  { id: 'rejected', status: TaskStatus.Rejected, title: 'Rejected', color: 'error' }
];

export const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = observer(({
  tasks,
  saving,                // Geriye dönük uyumluluk; verilmezse store.mutating kullan
  canChangeStatus,
  onDetail,
  onEdit,
  onDelete,
  maxPerColumn = 5
}) => {
  // Tek kaynak: dışarıdan tasks yoksa store.filteredTasks
  const source = tasks ?? taskStore.filteredTasks;
  const mutating = saving ?? taskStore.mutating;

  // Lokal sadece sunum amaçlı sıralama + kolon genişletme
  const [ordered, setOrdered] = useState<Record<number, number>>({});
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, typeof source> = {
      [TaskStatus.Pending]: [],
      [TaskStatus.Approved]: [],
      [TaskStatus.Rejected]: []
    };
    source.forEach(t => {
      map[t.status]?.push(t);
    });
    Object.keys(map).forEach(k => {
      map[k as unknown as TaskStatus].sort((a, b) => {
        const oa = ordered[a.id] ?? 0;
        const ob = ordered[b.id] ?? 0;
        return oa - ob;
      });
    });
    return map;
  }, [source, ordered]);

  const handleApprove = async (taskId: number) => {
    try {
      await taskStore.approve(taskId);
      uiStore.onShowSuccessModal?.('Görev onaylandı.');
    } catch (e: any) {
      uiStore.onShowErrorModal?.(e?.response?.data?.message || 'Onay başarısız.');
    }
  };

  const handleReject = async (taskId: number) => {
    try {
      await taskStore.reject(taskId);
      uiStore.onShowSuccessModal?.('Görev reddedildi.');
    } catch (e: any) {
      uiStore.onShowErrorModal?.(e?.response?.data?.message || 'Reddetme başarısız.');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source: src, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === src.droppableId && destination.index === src.index) return;

    const taskId = Number(draggableId);
    const task = source.find(t => t.id === taskId);
    if (!task) return;

    const sourceCol = src.droppableId;
    const destCol = destination.droppableId;
    const sourceStatus = statusColumns.find(c => c.id === sourceCol)?.status;
    const destStatus = statusColumns.find(c => c.id === destCol)?.status;
    if (sourceStatus == null || destStatus == null) return;

    // Aynı kolonda sadece sıralama
    if (sourceStatus === destStatus) {
      setOrdered(prev => ({ ...prev, [taskId]: destination.index }));
      return;
    }

    // Yetki kontrolü (callback varsa ona bırak, yoksa basit kural)
    const allowed = canChangeStatus ? canChangeStatus(task) : task.status === TaskStatus.Pending;
    if (!allowed) {
      uiStore.onShowErrorModal?.('Bu görevin durumunu değiştirme yetkiniz yok.');
      return;
    }

    // Sadece Pending -> Approved / Rejected
    if (sourceStatus !== TaskStatus.Pending ||
        !(destStatus === TaskStatus.Approved || destStatus === TaskStatus.Rejected)) {
      uiStore.onShowErrorModal?.('Bu sürükleme geçerli değil.');
      return;
    }

    // Optimistik lokal görsel sıralama (kolon hedefine eklenmiş gibi)
    // (İstersen burada patch ile status set edebilirsin, ancak approve/reject zaten patch yapıyor)
    try {
      if (destStatus === TaskStatus.Approved) {
        await handleApprove(taskId);
      } else {
        await handleReject(taskId);
      }
    } catch {
    
      // Hata mesajı store/UI tarafından veriliyor
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box className="kanban-board">
        {statusColumns.map(col => {
          const allColTasks = grouped[col.status];
          const isExpanded = expandedColumns.has(col.id);
          const visibleTasks = isExpanded ? allColTasks : allColTasks.slice(0, maxPerColumn);
          const hiddenCount = allColTasks.length - visibleTasks.length;

          return (
            <Box key={col.id} flex="0 0 320px" className="kanban-column-wrapper">
              <Paper
                variant="outlined"
                className="kanban-paper"
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>{col.title}</Typography>
                  <Chip size="small" label={allColTasks.length} color={col.color} />
                </Stack>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <Stack
                      ref={provided.innerRef}
                      className="kanban-tasks"
                      data-dropping={snapshot.isDraggingOver ? 'true' : 'false'}
                      {...provided.droppableProps}
                    >
                      {visibleTasks.map((t, index) => (
                        <Draggable
                          key={t.id}
                          draggableId={String(t.id)}
                          index={index}
                          isDragDisabled={mutating}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <Card
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className="kanban-card"
                              variant="outlined"
                              sx={{
                                opacity: mutating ? 0.55 : 1,
                                cursor: dragSnapshot.isDragging ? 'grabbing' : 'grab'
                              }}
                            >
                              <CardContent sx={{ p: 1.2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                  <Box
                                    {...dragProvided.dragHandleProps}
                                    sx={{ flex: 1, pr: 1 }}
                                    onDoubleClick={() => onDetail?.(t)}
                                  >
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom noWrap>
                                      #{t.id} {t.title}
                                    </Typography>
                                  </Box>
                                  <Stack direction="row" spacing={0.5}>
                                    {onDetail && (
                                      <IconButton size="small" onClick={() => onDetail(t)}>
                                        <Typography variant="caption" fontSize="small"  sx={{ mr: 1 }}>Detay</Typography>
                                        <VisibilityOutlinedIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                    {onEdit && (
                                      <IconButton size="small" onClick={() => onEdit(t)}>
                                        <EditOutlinedIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                    {onDelete && (
                                      <IconButton size="small" onClick={() => onDelete(t)}>
                                        <DeleteOutlineOutlinedIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Stack>
                                </Stack>

                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: .5 }}>
                                  <Chip size="small" label={statusLabel(t.status)} color={col.color} />
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label={departmentLabel(t.assignedDepartment as any)}
                                  />
                                </Stack>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}

                      {visibleTasks.length === 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Görev yok
                        </Typography>
                      )}

                      {hiddenCount > 0 && !isExpanded && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setExpandedColumns(prev => new Set(prev).add(col.id));
                          }}
                          sx={{ mt: .5, alignSelf: 'flex-start' }}
                        >
                          +{hiddenCount} daha göster
                        </Button>
                      )}

                      {isExpanded && allColTasks.length > maxPerColumn && (
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => {
                            setExpandedColumns(prev => {
                              const n = new Set(prev);
                              n.delete(col.id);
                              return n;
                            });
                          }}
                          sx={{ mt: .5, alignSelf: 'flex-start', opacity: .75 }}
                        >
                          Daralt
                        </Button>
                      )}
                    </Stack>
                  )}
                </Droppable>
              </Paper>
            </Box>
          );
        })}
      </Box>
    </DragDropContext>
  );
});

export default TaskKanbanBoard;

