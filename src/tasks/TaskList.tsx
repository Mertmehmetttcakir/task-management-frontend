import React, { useCallback, useEffect, useState } from "react";
import { TaskDto } from "../services/TaskService";
import { observer } from "mobx-react";
import { authStore } from "../stores/authStore";
import { uiStore } from "../stores/uiStore";
import { ConditionDialog, ContentDialog, ErrorDialog, SuccessDialog } from "toprak-ui";
import { TaskTable } from "./components/TaskTable";
import "../styles/index.css";
import { Container, Stack, CircularProgress, Alert, Typography, TextField, Box, MenuItem, Button } from "@mui/material";
import { taskStore } from '../stores/taskStore';
import { assignedDepartment, departmentLabel } from "./status";
import { useNavigate } from "react-router-dom";
import { TaskKanbanBoard } from './components/TaskKanbanBoard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import TableRowsIcon from '@mui/icons-material/TableRows';
// moved statusLabel/statusClass to ./status

const TaskList: React.FC = observer(() => {
	// Local UI state for dialogs & forms remains; tasks/view moved to taskStore
	const { tasks, loading, error, view, mutating } = taskStore;
	const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [formAssignedDept, setFormAssignedDept] = useState<number | "">("");
	const [titleFilter, setTitleFilter] = useState('');
	const [departmentFilter, setDepartmentFilter] = useState('');
	const [userFilter, setUserFilter] = useState('');
	const navigate = useNavigate();
	const [useKanban, setUseKanban] = useState(false);

	const departmentOptions = Array.from(new Set(tasks.map(t => t.assignedDepartment)));

	const filteredTasks = tasks.filter(task =>
		task.title.toLowerCase().includes(titleFilter.toLowerCase()) &&
		(departmentFilter !== '' ? task.assignedDepartment === Number(departmentFilter) : true)
	);

	const loadTasks = useCallback(async () => {
		await taskStore.load();
	}, []);

	useEffect(() => {
		if (authStore.isLoggedIn) {
			loadTasks();
		}
	}, [authStore.isLoggedIn, loadTasks, view]);

	const handleResetFilters = () => {
		setTitleFilter('');
		setDepartmentFilter('');
		setUserFilter('');
	}

	const openEditDialog = (t: TaskDto) => {
		setEditingTask(t);
		setEditTitle(t.title ?? "");
		setEditDescription(t.description ?? "");
		setIsCreating(false);
		uiStore.onShowContentModal();
	};

	const openCreateDialog = () => {
		setEditingTask(null);
		setEditTitle("");
		setEditDescription("");
		setFormAssignedDept(authStore.department ?? "");
		setIsCreating(true);
		uiStore.onShowContentModal();
	};

	const handleConfirmEdit = async () => {
		const isCreate = isCreating;
		if (!editTitle.trim()) {
			uiStore.onShowErrorModal("Başlık gerekli.");
			return;
		}
		try {
			if (isCreate) {
				const assignedDepartment =
					typeof formAssignedDept === "string"
						? parseInt(formAssignedDept)
						: formAssignedDept || 0;
				await taskStore.createTask({
					title: editTitle.trim(),
					description: editDescription.trim(),
					assignedDepartment
				});
				uiStore.onShowSuccessModal("Görev oluşturuldu.");
			} else {
				if (!editingTask) return;
				await taskStore.updateTask(editingTask.id, {
					title: editTitle.trim(),
					description: editDescription.trim()
				});
				uiStore.onShowSuccessModal("Görev güncellendi.");
			}
			uiStore.onHideContentModal();
			setEditingTask(null);
			setIsCreating(false);
		} catch (e: any) {
			uiStore.onShowErrorModal(
				e?.response?.data?.message ||
				(isCreate ? "Oluşturma başarısız." : "Güncelleme başarısız.")
			);
		}
	};

	const requestDelete = (t: TaskDto) => {
		uiStore.onShowConditionModal(
			`#${t.id} - ${t.title} görevini silmek istediğinize emin misiniz?`,
			async () => {
				try {
					await taskStore.remove(t.id);
					uiStore.onHideConditionModal();
					uiStore.onShowSuccessModal("Görev silindi.");
				} catch (e: any) {
					uiStore.onHideConditionModal();
					uiStore.onShowErrorModal(
						e?.response?.data?.message || "Silme işlemi başarısız."
					);
				}
			},
			() => uiStore.onHideConditionModal()
		);
	};

	const approveTask = async (t: TaskDto) => {
		if (t.status !== 0 || authStore.department == null || authStore.department !== t.assignedDepartment) {
			uiStore.onShowErrorModal("Bu görevi onaylamak için yetkiniz yok.");
			return;
		}
		try {
			await taskStore.approve(t.id);
			uiStore.onShowSuccessModal("Görev onaylandı.");
		} catch (e: any) {
			uiStore.onShowErrorModal(
				e?.response?.data?.message || "Onay işlemi başarısız oldu."
			);
		}
	};

	const rejectTask = (t: TaskDto) => {
		if (t.status !== 0 || authStore.department == null || authStore.department !== t.assignedDepartment) {
			uiStore.onShowErrorModal("Bu görevi reddetmek için yetkiniz yok.");
			return;
		}
		uiStore.onShowConditionModal(
			`#${t.id} - ${t.title} görevini reddetmek istediğinize emin misiniz?`,
			async () => {
				try {
					await taskStore.reject(t.id);
					uiStore.onHideConditionModal();
					uiStore.onShowSuccessModal("Görev reddedildi.");
				} catch (e: any) {
					uiStore.onHideConditionModal();
					uiStore.onShowErrorModal(
						e?.response?.data?.message || "Reddetme işlemi başarısız oldu."
					);
				}
			},
			() => uiStore.onHideConditionModal(),
			"Reddet"
		);
	};

	  React.useEffect(() => {
	    const handler = () => openCreateDialog();
	    window.addEventListener('task:new', handler);
	    return () => window.removeEventListener('task:new', handler);
	  }, []);

		return (
				<Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 }, pb: 4, minHeight: 'calc(100vh - 140px)' }}>
	<Typography variant="h5" fontWeight={600} sx={{ mb: 1.5 }}>
        {view === "mine" ? "Görevlerim" : view === "dept" ? "Departmanımın Görevleri" : "Tüm Görevler"}
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
	sx={{ mb: 1.5 }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexGrow={1}>
          <TextField
							label="Başlık Ara"
							size="small"
							value={titleFilter}
							onChange={(e) => setTitleFilter(e.target.value)}
							sx={{ width: { xs: '100%', sm: '300px' } }}
						/>
						<TextField
							label="Departman Filtrele"
							size="small"
							select
							value={departmentFilter}
							onChange={(e) => setDepartmentFilter(e.target.value)}
							sx={{ width: { xs: '100%', sm: '200px' } }}
						>
							<MenuItem value="">
								Tümü
							</MenuItem>
							{departmentOptions.map(dept => (
								<MenuItem key={dept} value={dept}>
									{departmentLabel(dept as number)}
								</MenuItem>
							))}
						</TextField>
          <Button
            onClick={handleResetFilters}
            variant="outlined"
            sx={{ minWidth: '150px',  color: 'black', borderColor: 'grey.700' }}
          >
            Filtreleri Temizle
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant={useKanban ? "outlined" : "contained"}
            startIcon={<TableRowsIcon />}
            onClick={() => setUseKanban(false)}
          >
            Tablo
          </Button>
          <Button
            size="small"
            variant={useKanban ? "contained" : "outlined"}
            startIcon={<ViewKanbanIcon />}
            onClick={() => setUseKanban(true)}
          >
            Kanban
          </Button>
        </Stack>
      </Stack>

      {loading && (
					
					<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
						<CircularProgress size={20} />
						<Typography>Yükleniyor...</Typography>
					</Stack>
				)}
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
				)}

      {!loading && !error && (
        !useKanban ? (
			
          <Box className="table-wrapper">
            <TaskTable
							tasks={filteredTasks}
							saving={mutating}
							currentUserId={authStore.userId}
							currentDepartment={authStore.department}
							onDetail={(t) => navigate(`/tasks/detail/${t.id}` )}
							onEdit={openEditDialog}
							onDelete={requestDelete}
							onApprove={approveTask}
							onReject={rejectTask}
						/>
          </Box>
        ) : (
          <Box sx={{ mt: 1, position: 'relative' }}>
            <TaskKanbanBoard
							tasks ={filteredTasks}
							saving={mutating}
							canChangeStatus= {(t) => authStore.department != null && authStore.department === t.assignedDepartment && t.status === 0}
							onDetail={(t) => navigate(`/tasks/detail/${t.id}` )}
						/>
          </Box>
        )
      )}

			{/* Global dialogs via toprak-state + toprak-ui */}
			<ConditionDialog
				open={uiStore.conditionModal.open}
				title={uiStore.conditionModal.title || "Emin misiniz?"}
				message={uiStore.conditionModal.text}
				submitButtonText={uiStore.conditionModal.submitButtonText}
				onConfirm={uiStore.conditionModal.onConfirm || (() => {})}
				onCancel={uiStore.conditionModal.onCancel || (() => {})}
			/>

			<ErrorDialog
				open={uiStore.errorModal.open}
				title={uiStore.errorModal.title}
				message={uiStore.errorModal.text}
				onConfirm={uiStore.onHideErrorModal}
			/>

			<SuccessDialog
				open={uiStore.successModal.open}
				title={uiStore.successModal.title}
				message={uiStore.successModal.text}
				onConfirm={uiStore.onHideSuccessModal}
			/>

					<ContentDialog
				open={uiStore.contentModal.open}
				title={isCreating ? "Yeni Görev" : editingTask ? `Görevi Düzenle #${editingTask.id}` : "Görevi Düzenle"}
				onCancel={uiStore.onHideContentModal}
				onConfirm={handleConfirmEdit}
				submitDisabled={
					mutating ||
					!editTitle.trim() ||
					(isCreating && (formAssignedDept === ""))
				}
				maxWidth="sm"
			>
						<Box sx={{ py: 1 }}>
							<Stack spacing={2}>
								<TextField
									id="edit-title"
									label="Başlık"
									size="small"
									fullWidth
									value={editTitle}
									onChange={(e) => setEditTitle(e.target.value)}
								/>
								<TextField
									id="edit-description"
									label="Açıklama"
									size="small"
									fullWidth
									multiline
									minRows={4}
									value={editDescription}
									onChange={(e) => setEditDescription(e.target.value)}
								/>
								{isCreating && (
									<TextField
										id="assigned-dept"
										label="Atanacak Departman"
										select
										size="small"
										fullWidth
										value={formAssignedDept}
										onChange={(e) =>
											setFormAssignedDept(
												e.target.value === "" ? "" : Number(e.target.value) as assignedDepartment
											)
										}
									>
										<MenuItem disabled value="">
											Departman Seç
										</MenuItem>
										{Object.values(assignedDepartment)
											.filter(v => typeof v === "number")
											.map(v => (
												<MenuItem key={v} value={v}>
													{departmentLabel(v)}
												</MenuItem>
											))}
									</TextField>
								)}
							</Stack>
						</Box>
						
			</ContentDialog>
			
				</Container>
				
			);
});
export default TaskList;
