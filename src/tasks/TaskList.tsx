import React, { useCallback, useEffect, useState } from "react";
import { TaskDto, TaskService } from "../services/TaskService";
import { observer } from "mobx-react";
import { authStore } from "../stores/authStore";
import { uiStore } from "../stores/uiStore";
import { ConditionDialog, ContentDialog, ErrorDialog, SuccessDialog } from "toprak-ui";
import { statusClass, statusLabel } from "./status";
import { TaskTable } from "./components/TaskTable";
import "../styles/index.css";
import { Container, Stack, CircularProgress, Alert, Typography, TextField, Box, MenuItem } from "@mui/material";
import { taskStore } from '../stores/taskStore';
import { assignedDepartment, departmentLabel } from "./status";
import { useNavigate } from "react-router-dom";

// moved statusLabel/statusClass to ./status

const TaskList: React.FC = observer(() => {
	// Local UI state for dialogs & forms remains; tasks/view moved to taskStore
	const { tasks, loading, error, view } = taskStore;
	const [saving, setSaving] = useState(false);
	const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [formAssignedDept, setFormAssignedDept] = useState<number | "">("");
	const [detailTask, setDetailTask] = useState<TaskDto | null>(null);
	const navigate = useNavigate();

	const loadTasks = useCallback(async () => {
		await taskStore.load();
	}, []);

	useEffect(() => {
		if (authStore.isLoggedIn) {
			loadTasks();
		}
	}, [authStore.isLoggedIn, loadTasks, view]);

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
		try {
			setSaving(true);
			if (isCreating) {
				const assignedDepartment = typeof formAssignedDept === "string" ? parseInt(formAssignedDept) : formAssignedDept;
				await TaskService.createTask({ title: editTitle, description: editDescription, assignedDepartment: assignedDepartment || 0 });
				uiStore.onHideContentModal();
				uiStore.onShowSuccessModal("Görev oluşturuldu.");
			} else {
				if (!editingTask) return;
				await TaskService.updateTask(editingTask.id, { title: editTitle, description: editDescription });
				uiStore.onHideContentModal();
				uiStore.onShowSuccessModal("Görev güncellendi.");
			}
			await loadTasks();
		} catch (e: any) {
			uiStore.onShowErrorModal(e?.response?.data?.message ?? (isCreating ? "Oluşturma başarısız oldu." : "Güncelleme başarısız oldu."));
		} finally {
			setSaving(false);
			setEditingTask(null);
			setIsCreating(false);
		}
	};

	const requestDelete = (t: TaskDto) => {
		uiStore.onShowConditionModal(
			`#${t.id} - ${t.title} görevini silmek istediğinize emin misiniz?`,
			async () => {
				try {
					await TaskService.deleteTask(t.id);
					uiStore.onHideConditionModal();
					uiStore.onShowSuccessModal("Görev silindi.");
					await loadTasks();
				} catch (e: any) {
					uiStore.onHideConditionModal();
					uiStore.onShowErrorModal(e?.response?.data?.message ?? "Silme işlemi başarısız oldu.");
				}
			},
			() => {
				uiStore.onHideConditionModal();
			}
		);

	};

	if (!authStore.isLoggedIn) {
			return (
				<Container maxWidth="md" sx={{ py: 3 }}>
					<Alert severity="info">Lütfen giriş yapınız.</Alert>
				</Container>
			);
	}

	const approveTask = async (t: TaskDto) => {
		// Guard: only assigned department can approve pending tasks
		if (t.status !== 0 || authStore.department == null || authStore.department !== t.assignedDepartment) {
			uiStore.onShowErrorModal("Bu görevi onaylamak için yetkiniz yok.");
			return;
		}
		try {
			setSaving(true);
			await TaskService.completeTask(t.id, 1);
			uiStore.onShowSuccessModal("Görev onaylandı.");
			await loadTasks();
		} catch (e: any) {
			uiStore.onShowErrorModal(e?.response?.data?.message ?? "Onay işlemi başarısız oldu.");
		} finally {
			setSaving(false);
		}
	};

	const rejectTask = (t: TaskDto) => {
		// Guard: only assigned department can reject pending tasks
		if (t.status !== 0 || authStore.department == null || authStore.department !== t.assignedDepartment) {
			uiStore.onShowErrorModal("Bu görevi reddetmek için yetkiniz yok.");
			return; 
		}
		uiStore.onShowConditionModal(
			`#${t.id} - ${t.title} görevini reddetmek istediğinize emin misiniz?`,
			async () => {
				try {
					await TaskService.completeTask(t.id, 2);
					uiStore.onHideConditionModal();
					uiStore.onShowSuccessModal("Görev reddedildi.");
					await loadTasks();
				} catch (e: any) {
					uiStore.onHideConditionModal();
					uiStore.onShowErrorModal(e?.response?.data?.message ?? "Reddetme işlemi başarısız oldu.");
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
				<Container maxWidth="lg" sx={{ py: 3 }}>
					<Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
						{view === "mine" ? "Görevlerim" : view === "dept" ? "Departmanımın Görevleri" : "Tüm Görevler"}
					</Typography>

				{loading && (
					<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
						<CircularProgress size={20} />
						<Typography>Yükleniyor...</Typography>
					</Stack>
				)}
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
				)}
				{(!loading && !error) && (
					<Box className="table-wrapper">
						<TaskTable
							tasks={tasks}
							saving={saving}
							currentUserId={authStore.userId}
							currentDepartment={authStore.department}
							onDetail={(t) => navigate(`/tasks/${t.id}` )}
							onEdit={openEditDialog}
							onDelete={requestDelete}
							onApprove={approveTask}
							onReject={rejectTask}
						/>
					</Box>
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
				submitDisabled={saving || !editTitle.trim() || (isCreating && (formAssignedDept === ""))}
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
													{departmentLabel(v as assignedDepartment)}
												</MenuItem>
											))}
									</TextField>
								)}
							</Stack>
						</Box>
						
			</ContentDialog>
			{/* Task detail dialog */}
			
				</Container>
			);
});

export default TaskList;
