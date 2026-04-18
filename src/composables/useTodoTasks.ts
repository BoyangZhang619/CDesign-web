/**
 * TODO 任务相关的 Composable
 */

import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import http from '@/api/http';

export interface TaskItem {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  type: string;
  category?: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  due_date: string;
  due_time?: string;
  is_daily: boolean;
  completed_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TasksResponse {
  data: TaskItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskStatsResponse {
  data: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completion_rate: number;
  };
}

/**
 * 获取指定日期的任务
 * @param date 格式: YYYY-MM-DD
 */
export async function fetchTasksByDate(date: string): Promise<TaskItem[]> {
  const authStore = useAuthStore();
  if (!authStore.token) {
    console.error('未认证');
    return [];
  }

  try {
    const apiUrl = http.defaults.baseURL;
    const response = await fetch(
      `${apiUrl}/tasks?date=${date}&limit=100`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        credentials: 'include'
      }
    );

    if (response.ok) {
      const result: TasksResponse = await response.json();
      return result.data || [];
    } else {
      console.error('获取任务失败:', response.status);
      return [];
    }
  } catch (error) {
    console.error('获取任务出错:', error);
    return [];
  }
}

/**
 * 获取今天的任务
 */
export async function fetchTodayTasks(): Promise<TaskItem[]> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  return fetchTasksByDate(dateStr);
}

/**
 * 获取指定年月的任务统计
 */
export async function fetchTaskStats(date?: string): Promise<any> {
  const authStore = useAuthStore();
  if (!authStore.token) {
    console.error('未认证');
    return null;
  }

  try {
    const apiUrl = http.defaults.baseURL;
    const urlPath = date
      ? `/tasks/stats?date=${date}`
      : `/tasks/stats`;

    const response = await fetch(
      `${apiUrl}${urlPath}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        credentials: 'include'
      }
    );

    if (response.ok) {
      const result: TaskStatsResponse = await response.json();
      return result.data;
    } else {
      console.error('获取任务统计失败:', response.status);
      return null;
    }
  } catch (error) {
    console.error('获取任务统计出错:', error);
    return null;
  }
}

/**
 * 格式化任务时间显示
 */
export function formatTaskTime(task: TaskItem): string {
  if (!task.due_time) {
    return new Date(task.due_date).toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric'
    });
  }
  return task.due_time.substring(0, 5); // HH:mm format
}

/**
 * 计算任务完成度百分比
 */
export function calculateCompletionRate(stats: any): number {
  if (!stats || stats.total === 0) return 0;
  return Math.round((stats.completed / stats.total) * 100);
}

/**
 * 使用待办任务列表的 Composable 钩子
 */
export function useTodoTasks() {
  const todayTasks = ref<TaskItem[]>([]);
  const selectedDateTasks = ref<TaskItem[]>([]);
  const taskStats = ref<any>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 加载今天的任务
  const loadTodayTasks = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      todayTasks.value = await fetchTodayTasks();
      // 同时获取今天的统计信息
      const today = new Date().toISOString().split('T')[0];
      taskStats.value = await fetchTaskStats(today);
    } catch (err) {
      error.value = String(err);
      console.error('加载今天任务失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 加载指定日期的任务
  const loadTasksByDate = async (date: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      selectedDateTasks.value = await fetchTasksByDate(date);
      taskStats.value = await fetchTaskStats(date);
    } catch (err) {
      error.value = String(err);
      console.error('加载指定日期任务失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 获取今天的任务完成度百分比
  const todayCompletionPercentage = computed(() => {
    if (!taskStats.value) return 0;
    return calculateCompletionRate(taskStats.value);
  });

  // 获取未完成的今天任务列表
  const incompleteTodayTasks = computed(() => {
    if (!Array.isArray(todayTasks.value)) {
      return [];
    }
    return todayTasks.value.filter(task => task.status === 'pending');
  });

  return {
    todayTasks,
    selectedDateTasks,
    taskStats,
    isLoading,
    error,
    loadTodayTasks,
    loadTasksByDate,
    todayCompletionPercentage,
    incompleteTodayTasks,
    formatTaskTime,
    calculateCompletionRate
  };
}
