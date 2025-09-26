import React, { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, Typography, Stack, Box, Chip, Paper } from '@mui/material';
import { statusLabel, TaskStatus, departmentLabel, assignedDepartment } from '../status';
import { TaskKanbanBoardProps } from './TaskKanbanBoardProps';
import { TaskService } from '../../services/TaskService';
import { taskStore } from '../../stores/taskStore';
import { uiStore } from '../../stores/uiStore';


const statusColumns : {id : string, status: TaskStatus, title: string, color: 'warning' | 'error' | 'success'}[] = [
    {id: 'pending', status: 0, title: 'Pending', color: 'warning'},
    {id: 'approved', status: 1, title: 'Approved', color: 'success'},
    {id: 'rejected', status: 2, title: 'Rejected', color: 'error'},
];  

export const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({ tasks, saving, canChangeStatus, onDetail , onEdit, onDelete }) => {
     const [ordered, setOrdered] = useState<Record<number, number>>({});
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
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
                {statusColumns.map(col => {
                    const colTasks = grouped[col.status];
                    return (
                        <Box key={col.id} flex={1} minWidth={260}>
                            <Paper variant="outlined" sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                    <Typography variant="subtitle1" fontWeight={600}>{col.title}</Typography>
                                    <Chip size="small" label={colTasks.length} color={col.color} />
                                </Stack>
                                <Droppable droppableId={col.id}>
                                    {(provided, snapshot) => (
                                        <Stack
                                            ref={provided.innerRef}
                                            spacing={1}
                                            sx={{
                                                flex: 1,
                                                minHeight: 60,
                                                p: 0.5,
                                                borderRadius: 1,
                                                transition: 'background-color .15s',
                                                backgroundColor: snapshot.isDraggingOver ? 'action.hover' : 'transparent'
                                            }}
                                            {...provided.droppableProps}
                                        >
                                            {colTasks.map((t, index) => (
                                                <Draggable draggableId={String(t.id)} index={index} key={t.id} isDragDisabled={saving}>
                                                    {(dragProvided, dragSnapshot) => (
                                                        <Card
                                                            ref={dragProvided.innerRef}
                                                            {...dragProvided.draggableProps}
                                                            {...dragProvided.dragHandleProps}
                                                            variant="outlined"
                                                            sx={{
                                                                cursor: dragSnapshot.isDragging ? 'grabbing' : 'grab',
                                                                opacity: saving ? 0.6 : 1
                                                            }}
                                                            onClick={() => onDetail(t)
    
                                                                
                                                            }
                                                        >
                                                            <CardContent sx={{ p: 1.5 }}>
                                                              <Typography variant="subtitle2" fontWeight={600} gutterBottom noWrap>
                                                                    #{t.id} {t.title}
                                                                </Typography>
                                                                {t.description && (
                                                                    <Typography variant="caption" sx={{ display: 'block', mb: .5 }} noWrap>
                                                                        {t.description}
                                                                    </Typography>
                                                                )}
                                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                                    <Chip size="small" label={statusLabel(t.status)} color={col.color} />
                                                                    <Chip size="small" variant="outlined" label={departmentLabel(t.assignedDepartment as assignedDepartment)} />
                                                                </Stack>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {colTasks.length === 0 && (
                                                <Typography variant="caption" color="text.secondary" sx={{ px: .5 }}>
                                                    Görev yok
                                                </Typography>
                                            )}
                                        </Stack>
                                    )}
                                </Droppable>
                            </Paper>
                        </Box>
                    );
                })}
            </Stack>
        </DragDropContext>
    );
};
