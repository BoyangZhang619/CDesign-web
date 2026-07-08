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

    <div class="show-block">
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
const showCalendar = ref(navigator.userAgent.includes('Mobile') ? false : true); // 移动端默认显示每日，桌面端默认显示月度

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
    const response = await fetchWithRefresh(`/tasks/date/${dateStr}`, {
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

<style lang="scss" scoped src="@/scss/components/homeView/RightContent/AppointmentsSection.scss"></style>
