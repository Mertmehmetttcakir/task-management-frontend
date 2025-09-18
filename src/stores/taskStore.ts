import { makeAutoObservable } from 'mobx';
import { TaskDto, TaskService } from '../services/TaskService';
import { authStore } from './authStore';

export type TaskViewMode = 'all' | 'mine' | 'dept';

class TaskStore {
	tasks: TaskDto[] = [];
	loading = false;
	error: string = '';
	view: TaskViewMode = 'all';

	constructor() {
		makeAutoObservable(this, {}, { autoBind: true });
	}

	setView(v: TaskViewMode) {
		this.view = v;
	}

	async load() {
		this.loading = true;
		this.error = '';
			try {
				let data: TaskDto[] = [];
				if (this.view === 'mine') {
					data = await TaskService.getMyTasks();
				} else if (this.view === 'dept') {
					if (authStore.department == null) {
						throw new Error('Departman bilgisi bulunamadı.');
					}
					data = await TaskService.getDepartmentTasks();
				} else {
					data = await TaskService.getAll();
				}
				this.tasks = data;
			} catch (e: any) {
				this.error = e?.response?.data?.message || e.message || 'Görevler yüklenemedi.';
				this.tasks = [];
			} finally {
				this.loading = false;
			}
	}

	async reloadCurrentView() {
		await this.load();
	}
}

export const taskStore = new TaskStore();
