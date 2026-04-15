<template>
  <section class="appointments-calendar">
    <!-- 头部 -->
    <div class="calendar-header-top">
      <h3 class="section-title">TODOLIST</h3>
      <div class="tabs">
        <button :class="['tab-btn', { active: !showCalendar }]" @click="handleTabChange(false)">每日</button>
        <button :class="['tab-btn', { active: showCalendar }]" @click="handleTabChange(true)">月度</button>
      </div>
    </div>

    <!-- 日历视图 -->
    <div class="calendar" v-if="showCalendar">
      <div class="calendar-header">
        <h4>{{ demoTime.year }}年{{ demoTime.month + 1 }}月</h4>
        <div class="calendar-nav">
          <button class="nav-btn" @click="plusMonth(-1)">←</button>
          <button class="nav-btn" @click="plusMonth(1)">→</button>
        </div>
      </div>

      <div class="weekdays">
        <div class="weekday" v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day">
          {{ day }}
        </div>
      </div>

      <div class="dates">
        <div class="date-cell empty" v-for="n in (new Date(demoTime.year, demoTime.month).getDay())"
          :key="'empty-' + n"></div>
        <div class="date-cell" v-for="date in demoMonthDays" :key="'date-' + date"
          :class="{ today: date === curTime.date && demoTime.month === curTime.month && demoTime.year === curTime.year, selected: selectedDate === `${demoTime.year}-${String(demoTime.month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}` }"
          @click="handleDateSelect(date)">
          {{ date }}
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-container">
      <div v-if="scheduleData.length === 0" class="tasks-empty">
        <p>暂无任务</p>
        <small>开始创建你的第一个任务吧</small>
      </div>

      <div v-else class="tasks-list">
        <div v-for="task in scheduleData.slice(0, 4)" :key="task.id" class="task-item" :class="[
          `priority-${task.priority}`,
          { completed: task.status === 'completed' }
        ]">
          <!-- 左侧：优先级指示 + 任务信息 -->
          <div class="task-left">
            <div class="priority-indicator"></div>
            <div class="task-info">
              <h4 class="task-title">{{ task.title }}</h4>
              <p class="task-time">
                📅 {{ task.time }}
              </p>
            </div>
          </div>

          <!-- 右侧：优先级标签 + 状态 -->
          <div class="task-right">
            <span class="priority-badge">{{ getPriorityLabel(task.priority) }}</span>
            <span class="status-icon" @click="jumpToDetail">
              <svg v-if="task.status === 'completed'" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7.5" stroke="#4caf50" stroke-width="1.5" fill="#e8f5e9" />
                <path d="M5.5 8L7 9.5L10.5 6" stroke="#4caf50" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7.5" stroke="#bbb" stroke-width="1.5" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部链接 -->
    <button class="see-more-btn" @click="jumpToDetail">查看完整日程 →</button>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import { useTodolist } from '../../../composables/useTodolist';
import { fetchWithRefresh } from '../../../api/http';

const router = useRouter();
const { tasks, fetchTasks } = useTodolist();

const scheduleData = ref<any[]>([]);
const selectedDate = ref<string>('');
const showCalendar = ref(false);

const curTime = reactive({
  year: (new Date()).getFullYear(),
  month: (new Date()).getMonth(),
  date: (new Date()).getDate(),
  day: (new Date()).getDay(),
  hour: (new Date()).getHours(),
  minute: (new Date()).getMinutes()
});

let _cnt_year = (new Date()).getFullYear();
let _cnt_month = (new Date()).getMonth();
const demoTime = reactive({
  year: _cnt_year,
  month: _cnt_month
});

const demoMonthDays = computed(() => {
  return new Date(new Date(demoTime.year, demoTime.month).getFullYear(), new Date(demoTime.year, demoTime.month).getMonth() + 1, 0).getDate();
});

// 格式化任务时间显示
const formatTaskTime = (task: any): string => {
  if (!task.due_time) {
    const date = new Date(task.due_date);
    return date.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric'
    });
  }
  return task.due_time.substring(0, 5); // HH:mm format
};

// 获取今天的任务（未完成）
const todayTasks = computed(() => {
  if (!Array.isArray(tasks.value)) return [];
  return toRaw(tasks.value);
});

// 获取指定日期的任务
const getTasksByDate = async (dateStr: string): Promise<any[]> => {
  try {
    // console.log(`📅 获取 ${dateStr} 的任务`);
    // 直接调用 API，不经过 useTodolist 的 fetchTasks
    // 这样可以避免 watch 触发造成的死循环
    const response = await fetchWithRefresh(`/api/tasks/date/${dateStr}`, {
      method: 'GET'
    });
    
    const data = await response.json();
    // console.log(`📅 获取 ${dateStr} 任务响应:`, data);
    
    if (data.success && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    return [];
  } catch (err: any) {
    console.error(`❌ 获取 ${dateStr} 任务错误:`, err);
    return [];
  }
};

// 处理 tab 切换
const handleTabChange = (isMonthly: boolean) => {
  showCalendar.value = isMonthly;
  if (!isMonthly) {
    // 每日：加载今天的任务
    updateDailyTasks();
  }
};

// 处理日期选择（月度视图）
const handleDateSelect = (day: number) => {
  const dateStr = `${demoTime.year}-${String(demoTime.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  selectedDate.value = dateStr;
  updateMonthlyTasks(dateStr);
};

// 更新每日任务显示
const updateDailyTasks = () => {
  console.log('🔄 updateDailyTasks: 开始');
  console.log('📊 todayTasks.value.length:', todayTasks.value.length);

  const newScheduleData = todayTasks.value
    .slice(0, 3)
    .map(task => ({
      id: task.id,
      title: task.title,
      time: formatTaskTime(task),
      priority: task.priority || 'medium',
      status: task.status || 'pending'
    }));

  scheduleData.value = newScheduleData;
  console.log('🔄 updateDailyTasks: 完成, scheduleData.length:', scheduleData.value.length);
  console.log('🔄 scheduleData:', scheduleData.value);
};

// 更新月度任务显示
const updateMonthlyTasks = async (dateStr: string) => {
  console.log(`🔄 updateMonthlyTasks: 开始加载 ${dateStr} 的任务`);
  const tasksForDate = await getTasksByDate(dateStr);
  console.log(`🔄 updateMonthlyTasks: 获取 ${dateStr} 的任务, 数量:`, tasksForDate.length);
  
  scheduleData.value = tasksForDate
    .slice(0, 3)
    .map(task => ({
      id: task.id,
      title: task.title,
      time: formatTaskTime(task),
      priority: task.priority || 'medium',
      status: task.status || 'pending'
    }));
  
  console.log(`🔄 updateMonthlyTasks: 完成, scheduleData.length:`, scheduleData.value.length);
};

// 监听任务列表变化
watch(tasks, () => {
  console.log('👀 watch tasks 被触发，showCalendar:', showCalendar.value, 'selectedDate:', selectedDate.value);
  if (showCalendar.value && selectedDate.value) {
    console.log('📅 月度模式，更新月度任务');
    updateMonthlyTasks(selectedDate.value);
  } else if (!showCalendar.value) {
    console.log('📅 每日模式，更新每日任务');
    updateDailyTasks();
  } else {
    console.log('⚠️ watch 触发但不符合条件');
  }
}, { deep: true });

function jumpToDetail() {
  router.push('/todolist');
}

function plusMonth(num: number) {
  demoTime.month += num;

  if (demoTime.month > 11) {
    demoTime.year += Math.floor(demoTime.month / 12);
    demoTime.month = demoTime.month % 12;
  } else if (demoTime.month < 0) {
    demoTime.year += Math.floor(demoTime.month / 12);
    demoTime.month = 12 + demoTime.month % 12;
  }
}

// 初始化：加载今天的任务
onMounted(async () => {
  console.log('📱 AppointmentsSection onMounted 开始');
  console.log('📱 初始 tasks.value:', tasks.value);
  console.log('📱 初始 showCalendar:', showCalendar.value);

  // 确保 fetchTasks 完成
  await fetchTasks();
  console.log('📋 fetchTasks 完成，tasks.value:', tasks.value);
  console.log('📋 tasks.value.length:', tasks.value.length);

  // 手动更新每日任务
  updateDailyTasks();
  console.log('📊 updateDailyTasks 完成，scheduleData:', scheduleData.value);
  console.log('📊 scheduleData.length:', scheduleData.value.length);
});

// 获取优先级标签
const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    'high': '高',
    'medium': '中',
    'low': '低'
  };
  return labels[priority] || priority;
};

</script>

<style scoped>
.appointments-calendar {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.calendar-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0d5c8;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  background: none;
  border: 1px solid #e0e0e0;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #9DB4A0;
  color: white;
  border-color: #9DB4A0;
}

/* Calendar */
.calendar {
  margin-bottom: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.calendar-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.calendar-nav {
  display: flex;
  gap: 5px;
}

.nav-btn {
  background: #f0f0f0;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: #e0e0e0;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #7f8c8d;
  padding: 5px;
}

.dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.date-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s ease;
}

.date-cell:not(.empty):hover {
  background: #f0f0f0;
}

.date-cell.today {
  background: #C9B89C;
  color: white;
}

.date-cell.selected {
  background: #9DB4A0;
  color: white;
}

.date-cell.empty {
  cursor: default;
}

/* Tasks Container */
.tasks-container {
  margin: 15px 0;
}

.tasks-empty {
  text-align: center;
  padding: 30px 20px;
  color: #999;
}

.tasks-empty small {
  display: block;
  margin-top: 8px;
  color: #bbb;
  font-size: 12px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 350px;
  overflow-y: auto;
}

/* Task Item */
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-left: 4px solid #ddd;
  border-radius: 6px;
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.task-item:hover {
  background: #f9f9f9;
  transform: translateX(2px);
}

.task-item.priority-high {
  border-left-color: #d32f2f;
}

.task-item.priority-medium {
  border-left-color: #ff9800;
}

.task-item.priority-low {
  border-left-color: #4caf50;
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #999;
}

.task-left {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.priority-indicator {
  width: 3px;
  height: 30px;
  border-radius: 2px;
  flex-shrink: 0;
}

.task-item.priority-high .priority-indicator {
  background: #d32f2f;
}

.task-item.priority-medium .priority-indicator {
  background: #ff9800;
}

.task-item.priority-low .priority-indicator {
  background: #4caf50;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  color: #2c3e50;
  word-break: break-word;
}

.task-time {
  font-size: 11px;
  color: #95a5a6;
  margin: 4px 0 0 0;
}

.task-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 12px;
}

.priority-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.task-item.priority-high .priority-badge {
  background: #ffebee;
  color: #d32f2f;
}

.task-item.priority-medium .priority-badge {
  background: #fff3e0;
  color: #ff9800;
}

.task-item.priority-low .priority-badge {
  background: #e8f5e9;
  color: #4caf50;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

/* Bottom Button */
.see-more-btn {
  width: 100%;
  background: none;
  border: 1px solid #e0d5c8;
  color: #2c3e50;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 8px;
  text-align: center;
  border-radius: 6px;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.see-more-btn:hover {
  background: #f9f9f9;
  border-color: #9DB4A0;
  color: #9DB4A0;
}
</style>
