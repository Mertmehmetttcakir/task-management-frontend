import axios from "axios";
import { ApiService } from "toprak-api";

export interface TaskUserDto {
  id: number;
  name: string;
}


export enum TaskStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export interface TaskDto {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  assignedDepartment: number;
  user: TaskUserDto;
}

export interface ApiListResponse<T> {
  code: string;
  payload: T;
}

export const TaskService = {
  async getAll(): Promise<TaskDto[]> {
    return ApiService.call<TaskDto[]>(
      axios.get<ApiListResponse<TaskDto[]>>("http://localhost:5000/api/task")
    );
  },

  async getMyTasks(): Promise<TaskDto[]> {
    return ApiService.call<TaskDto[]>(
      axios.get<ApiListResponse<TaskDto[]>>("http://localhost:5000/api/task/my-tasks")
    );
  },

    async getDepartmentTasks(): Promise<TaskDto[]> {
      // Backend derives user's department from JWT; returns tasks assigned to that department (pendings)
      return ApiService.call<TaskDto[]>(
        axios.get<ApiListResponse<TaskDto[]>>(`http://localhost:5000/api/task/pendings`)
      );
    },

  async updateTask(id: number, body: { title: string; description: string }): Promise<TaskDto> {
    return ApiService.call<TaskDto>(
      axios.put<ApiListResponse<TaskDto>>(`http://localhost:5000/api/task/${id}`, body)
    );
  },

  async createTask(body: { title: string; description: string; assignedDepartment: number }): Promise<TaskDto> {
    return ApiService.call<TaskDto>(
      axios.post<ApiListResponse<TaskDto>>(`http://localhost:5000/api/task`, body)
    );
  },

  async deleteTask(id: number): Promise<TaskDto> {
    // Prefer standard HTTP DELETE; fall back to legacy GET route if backend expects it
    try {
      return await ApiService.call<TaskDto>(
        axios.delete<ApiListResponse<TaskDto>>(`http://localhost:5000/api/task/${id}`)
      );
    } catch (err) {
      return ApiService.call<TaskDto>(
        axios.get<ApiListResponse<TaskDto>>(`http://localhost:5000/api/task/${id}`)
      );
    }
  },
  async completeTask(id: number, status: 1 | 2): Promise<TaskDto> {
    // Use explicit endpoints; fall back to query-param style for compatibility
    if (status === 1) {
      try {
        return await ApiService.call<TaskDto>(
          axios.get<ApiListResponse<TaskDto>>(`http://localhost:5000/api/task/complete/${id}`)
        );
      } catch (err) {
        return ApiService.call<TaskDto>(
          axios.get<ApiListResponse<TaskDto>>(`http://localhost:5000/api/task/complete/${id}?status=1`)
        );
      }
    } else {
      try {
        return await ApiService.call<TaskDto>(
          axios.get<ApiListResponse<TaskDto>>(`http://localhost:5000/api/task/reject/${id}`)
        );
      } catch (err) {
        return ApiService.call<TaskDto>(
          axios.get<ApiListResponse<TaskDto>>(`http://localhost:5000/api/task/complete/${id}?status=2`)
        );
      }
    }
  }
};
