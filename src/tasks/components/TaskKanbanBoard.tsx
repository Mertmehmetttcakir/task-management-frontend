import React, { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, Typography, Stack, Box, Chip, Paper, IconButton, Button } from '@mui/material';
import { statusLabel, TaskStatus, departmentLabel, assignedDepartment } from '../status';
import { TaskKanbanBoardProps } from './TaskKanbanBoardProps';
import { TaskService } from '../../services/TaskService';
import { taskStore } from '../../stores/taskStore';
import { uiStore } from '../../stores/uiStore';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';


const statusColumns : {id : string, status: TaskStatus, title: string, color: 'warning' | 'error' | 'success'}[] = [
    {id: 'pending', status: 0, title: 'Pending', color: 'warning'},
    {id: 'approved', status: 1, title: 'Approved', color: 'success'},
    {id: 'rejected', status: 2, title: 'Rejected', color: 'error'},
];  

export const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({ tasks, saving, canChangeStatus, onDetail , onEdit, onDelete , maxPerColumn=8 }) => {
     const [ordered, setOrdered] = useState<Record<number, number>>({});
  // Hangi kolonun tamamen açıldığını tutar (aksi halde kısıtlı gösterim)
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());
     const grouped = useMemo(() => {
        const map: Record<TaskStatus , typeof tasks> = {
            [TaskStatus.Pending]: [],
            [TaskStatus.Approved]: [],
            [TaskStatus.Rejected]: [],
        };
        tasks.forEach(t => {
            map[t.status]?.push(t);
        });
        Object.keys(map).forEach(k => {
            map[k as unknown as TaskStatus].sort((a,b)=>{
                const oa = ordered[a.id] ?? 0;
                const ob = ordered[b.id] ?? 0;
                return oa - ob;
            });
        });
        return map;
    }, [tasks, ordered]);
    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId &&
            destination.index === source.index) return;

        const taskId = Number(draggableId);
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const sourceCol = source.droppableId;
        const destCol = destination.droppableId;

        const sourceStatus = statusColumns.find(c => c.id === sourceCol)?.status;
        const destStatus = statusColumns.find(c => c.id === destCol)?.status;
        if (sourceStatus == null || destStatus == null) return;

        // Aynı kolon içinde sadece sıralama değişikliği
        if (sourceStatus === destStatus) {
            setOrdered(prev => ({ ...prev, [taskId]: destination.index }));
            return;
        }

        // Yetki kontrolü
        if (!canChangeStatus(task)) {
            uiStore.onShowErrorModal("Bu görevin durumunu değiştirme yetkiniz yok.");
            return;
        }

        // Sadece Pending görevler diğer kolonlara taşınabilir
        if (sourceStatus !== TaskStatus.Pending) {
            uiStore.onShowErrorModal("Sadece Pending görevlerin durumunu değiştirebilirsiniz.");
            return;
        }

        // Durum güncelleme
        try {
            uiStore.onShowSuccessModal("Durum güncelleniyor...");
            if (destStatus === 1 || destStatus ===2) { 
                await TaskService.completeTask(taskId, destStatus);
            }
                await taskStore.load();
        } catch (e: any) {
            uiStore.onShowErrorModal(e?.response?.data?.message ?? "Durum güncellenemedi.");
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
              <Paper variant="outlined" className="kanban-paper" sx={{ height: '100%', display:'flex', flexDirection:'column' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {col.title}
                  </Typography>
                  <Chip size="small" label={allColTasks.length} color={col.color} />
                </Stack>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <Stack
                      ref={provided.innerRef}
                      className="kanban-tasks"
                      data-dropping={snapshot.isDraggingOver ? 'true' : 'false'}
                      /* spacing removed; using pure CSS gap to avoid margin calc jumps */
                      {...provided.droppableProps}
                    >
                      {visibleTasks.map((t, index) => (
                        <Draggable
                          key={t.id}
                          draggableId={String(t.id)}
                          index={index}
                          isDragDisabled={saving}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <Card
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className="kanban-card"
                              variant="outlined"
                              sx={{
                                opacity: saving ? 0.55 : 1,
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
                                  <Chip size="small" variant="outlined" label={departmentLabel(t.assignedDepartment as any)} />
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
                        >+{hiddenCount} daha göster</Button>
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
                        >Daralt</Button>
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
}
    
