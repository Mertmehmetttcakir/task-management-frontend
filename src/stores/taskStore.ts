import { makeAutoObservable, reaction } from 'mobx';
import { TaskDto, TaskService } from '../services/TaskService';
import { authStore } from './authStore';
import { Task } from '@mui/icons-material';

export type TaskViewMode = 'all' | 'mine' | 'dept';

class TaskStore {
	tasks: TaskDto[] = [];
	loading = false;
	error: string  | null= null;
	view: TaskViewMode = 'all';

	currentUserId: number | null = null;
	currentDepartment: number | null = null;

	constructor() {
		makeAutoObservable(this, {}, { autoBind: true });
	}


	setView(v: TaskViewMode) {this.view = v;}
	setLoading(v: boolean) { this.loading = v; }
	setError(msg: string | null) { this.error = msg; }
	setCurrentUser(id: number | null) {this.currentUserId = id;}
	setCurrentDepartment(dept:number | null) {this.currentDepartment = dept;}
	setTasks(list: TaskDto[]) { this.tasks = list; }


	mutating = false; // tekil aksiyon (create/update/approve/reject/delete)

	setMutating = (v: boolean) => { this.mutating = v; };

	createTask = async (data: { title: string; description?: string; assignedDepartment: number }) => {
		this.setMutating(true);
		this.setError(null);
		try {
			if (!(TaskService as any).createTask) {
				throw new Error('createTask endpoint bulunamadı');
			}
			const created: TaskDto = await (TaskService as any).createTask(data);
			this.upsert(created);
			return created;
		} catch (e: any) {
			this.setError(e?.response?.data?.message || e.message || 'Görev oluşturulamadı.');
			throw e;
		} finally {
			this.setMutating(false);
		}
	};
	upsert = (t: TaskDto) => {
		const i = this.tasks.findIndex(x => x.id === t.id);
		if (i >= 0) {
			this.tasks[i] = t;
		} else {
			this.tasks.push(t);
		}
	}

	removeLocal = (id: number) => {
		this.tasks = this.tasks.filter(t => t.id !== id);
	}

	patch = (id: number, partial: Partial<TaskDto>): TaskDto | null => {
		const t = this.getTask(id);
		if(!t) return null;
		const prev = { ...t };
		Object.assign(t, partial);
		return prev;
	}

	getTask = (id: number)=> {
		return this.tasks.find(t => t.id === id) || null;
	}

	get filteredTasks(): TaskDto[] {
		switch (this.view) {
			case 'mine':
				if (this.currentUserId == null) return this.tasks;
				return this.tasks.filter(t=> (t as any).assignedUserId === this.currentUserId);
			case 'dept':
				if (this.currentDepartment == null) return this.tasks;
				return this.tasks.filter(t=> t.assignedDepartment === this.currentDepartment);
				default:
				return this.tasks;
		}	 
	}

	async load() {
		this.setLoading(true);
		this.setError(null);
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
				this.setTasks(data);
			} catch (e: any) {
				this.setError(e?.response?.data?.message || e.message || 'Görevler yüklenemedi.');
				this.setTasks([]);
			} finally {
				this.setLoading(false);
			}
	};


	reloadCurrentView = async () => {
		await this.load();
	};

fetchTask = async (id:number)=> {
		this.setLoading(true);
		this.setError(null);
		try {
			const t = TaskService.getTask
			? await TaskService.getTask(id)
			: await (TaskService as any).get(id);
			this.upsert(t);
		}catch (e: any) {
			this.setError(e?.response?.data?.message || e.message || 'Görev yüklenemedi.');
		} finally {
			this.setLoading(false);
		}	
			};

			approve = async (id: number) => {
				const prev = this.patch(id, { status: 1 });
				this.setMutating(true);
				try {
					await TaskService.completeTask(id, 1);
					await this.fetchTask(id);
				} catch (e) {
					if (prev) this.upsert(prev);
					throw e;
				} finally {
					this.setMutating(false);
				}
			};

			reject = async (id: number) => {
				const prev = this.patch(id, { status: 2 });
				this.setMutating(true);
				try {
					await TaskService.completeTask(id, 2);
					await this.fetchTask(id);
				} catch (e) {
					if (prev) this.upsert(prev);
					throw e;
				} finally {
					this.setMutating(false);
				}
	}; 

		updateTask = async (
			id:number,
			data: { title: string; description?: string; assignedDepartment?: number | null }
		) => {
			const snap = this.getTask(id) ? { ...this.getTask(id)! } : null;
			this.patch(id, data);
			this.setMutating(true);
			try {
				if((TaskService as any).updateTask) {
					await (TaskService as any).updateTask(id, data);
				} else if((TaskService as any).update) {
					await (TaskService as any).update(id, data);
				} 
				await this.fetchTask(id);
			} catch (e) {
				if (snap) this.upsert(snap);
				throw e;
			} finally {
				this.setMutating(false);
			}
		};

		  remove = async (id: number) => {
    const prev = this.getTask(id);
    if (!prev) return;
    this.removeLocal(id);
    this.setMutating(true);
    try {
      if ((TaskService as any).deleteTask) {
        await (TaskService as any).deleteTask(id);
      } else if ((TaskService as any).delete) {
        await (TaskService as any).delete(id);
      }
    } catch (e) {
      this.upsert(prev);
      throw e;
    } finally {
      this.setMutating(false);
    }
  };

  init = () => {
    // view değişince listeyi yeniden yükle
    reaction(
      () => this.view,
      () => {
        this.load();
      }
    );
    // Kullanıcı departman değişirse dept modundaysa güncelle
    reaction(
      () => [this.view, this.currentDepartment] as const,
      ([v]) => {
        if (v === 'dept') this.load();
      }
    );
  };
}


export const taskStore = new TaskStore();

export default taskStore;