export interface Task {
  id: string | number
  userId?: string
  title: string
  description?: string
  category: 'diet' | 'exercise' | 'sleep' | 'custom'
  type: string
  checkin_type?: string
  preset_type?: string
  status: 'pending' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  due_date: string
  date_type?: 'tomorrow' | 'workday' | 'weekend' | 'everyday'
  created_at?: string
  updated_at?: string
  completed_at?: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  category: 'diet' | 'exercise' | 'sleep' | 'custom'
  type: string
  checkin_type?: string
  preset_type?: string
  priority: 'low' | 'medium' | 'high'
  due_date: string
  date_type?: 'tomorrow' | 'workday' | 'weekend' | 'everyday'
}

export interface TaskCompletionRecord {
  id?: string | number
  taskId: string | number
  userId?: string
  category?: 'diet' | 'exercise' | 'sleep' | 'custom'
  preset_type?: string
  completed_at: string
  created_at?: string
}

export interface TaskStatistics {
  totalTasks: number
  completedTasks: number
  completionRate: number
  byCategory?: {
    diet: number
    exercise: number
    sleep: number
    custom: number
  }
  byCategoryCompleted?: {
    diet: number
    exercise: number
    sleep: number
    custom: number
  }
  byPriority?: {
    low: number
    medium: number
    high: number
  }
}
