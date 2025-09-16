import React, { useCallback, useEffect, useState } from "react";
import { TaskDto, TaskService } from "../services/TaskService";
import { observer } from "mobx-react";
import { authStore } from "../stores/authStore";
import { uiStore } from "../stores/uiStore";
import { ConditionDialog, ContentDialog, ErrorDialog, SuccessDialog } from "toprak-ui";
import { statusClass, statusLabel } from "./status";
import { TaskTable } from "./components/TaskTable";
import "../styles/index.css";

// moved statusLabel/statusClass to ./status

type ViewMode = "all" | "mine" | "dept";

const TaskList: React.FC = observer(() => {
	const [tasks, setTasks] = useState<TaskDto[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [view, setView] = useState<ViewMode>("all");
	const [saving, setSaving] = useState(false);
	const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [formAssignedDept, setFormAssignedDept] = useState<number | "">("");
	const [detailTask, setDetailTask] = useState<TaskDto | null>(null);

	const loadTasks = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			let data: TaskDto[] = [];
			if (view === "mine") {
				data = await TaskService.getMyTasks();
			} else if (view === "dept") {
				if (authStore.department == null) {
					setError("Departman bilgisi bulunamadı.");
					setTasks([]);
					return;
				}
				data = await TaskService.getDepartmentTasks();
			} else {
				data = await TaskService.getAll();
			}
			setTasks(data);
		} catch (e: any) {
			setError(e?.response?.data?.message ?? "Görevler yüklenemedi.");
		} finally {
			setLoading(false);
		}
	}, [view]);

	useEffect(() => {
		if (authStore.isLoggedIn) {
			loadTasks();
		}
	}, [authStore.isLoggedIn, loadTasks]);

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
		return <div className="container">Lütfen giriş yapınız.</div>;
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

	return (
		<div className="container">
			<div className="header-row">
				<h2>
					{view === "mine" ? "Görevlerim" : view === "dept" ? "Departmanımın Görevleri" : "Tüm Görevler"}
				</h2>
				<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
					<div>
						<button className={view === 'all' ? "btn btn-primary" : "btn"} onClick={() => setView('all')}>
							Tümü
						</button>
						<button className={view === 'mine' ? "btn btn-primary" : "btn"} onClick={() => setView('mine')}>
							Benim Görevlerim
						</button>
						<button className={view === 'dept' ? "btn btn-primary" : "btn"} onClick={() => setView('dept')} disabled={authStore.department == null}>
							Departmanım
						</button>
					</div>
					<button className="btn" onClick={openCreateDialog}>Yeni Görev</button>
				</div>
				<button className="btn btn-danger" onClick={() => authStore.logout()}>
					Çıkış Yap
				</button>
			</div>
			{loading && <div>Yükleniyor...</div>}
			{error && <div className="auth-error">{error}</div>}
			{(!loading && !error) && (
				<div className="table-wrapper">
					<TaskTable
						tasks={tasks}
						saving={saving}
						currentUserId={authStore.userId}
						currentDepartment={authStore.department}
						onDetail={setDetailTask}
						onEdit={openEditDialog}
						onDelete={requestDelete}
						onApprove={approveTask}
						onReject={rejectTask}
					/>
				</div>
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
				<div className="auth-card" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
					<div className="form-group">
						<label htmlFor="edit-title">Başlık</label>
						<input
							id="edit-title"
							type="text"
							value={editTitle}
							onChange={(e) => setEditTitle(e.target.value)}
						/>
					</div>
					<div className="form-group" style={{ marginTop: 12 }}>
						<label htmlFor="edit-description">Açıklama</label>
						<textarea
							id="edit-description"
							value={editDescription}
							onChange={(e) => setEditDescription(e.target.value)}
							rows={4}
							style={{ width: '100%', resize: 'vertical' }}
						/>
					</div>
					{isCreating && (
						<div className="form-group" style={{ marginTop: 12 }}>
							<label htmlFor="assigned-dept">Atanacak Departman</label>
							<input
								id="assigned-dept"
								type="number"
								value={formAssignedDept}
								onChange={(e) => setFormAssignedDept(e.target.value === "" ? "" : Number(e.target.value))}
								min={0}
							/>
						</div>
					)}
				</div>
			</ContentDialog>

			{/* Task detail dialog */}
			<ContentDialog
				open={!!detailTask}
				title={detailTask ? `Görev Detayı #${detailTask.id}` : "Görev Detayı"}
				onCancel={() => setDetailTask(null)}
				onConfirm={() => setDetailTask(null)}
				hideSubmitButton
				maxWidth="sm"
			>
				{detailTask && (
					<div className="auth-card" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
						<p><strong>Başlık:</strong> {detailTask.title}</p>
						<p><strong>Açıklama:</strong> {detailTask.description}</p>
						<p><strong>Durum:</strong> {statusLabel(detailTask.status)}</p>
						<p><strong>Departman:</strong> {detailTask.assignedDepartment}</p>
						<p><strong>Oluşturan:</strong> {detailTask.user?.name}</p>
					</div>
				)}
			</ContentDialog>
		</div>
	);
});

export default TaskList;
