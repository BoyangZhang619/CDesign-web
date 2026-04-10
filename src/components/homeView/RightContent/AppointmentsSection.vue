<template>
  <section class="appointments-calendar">
    <div class="list-header">
      <h3 class="section-title">TODOLIST</h3>
      <div class="tabs">
        <button :class="['tab-btn', { active: !showCalendar }]" @click="showCalendar = false">每日</button>
        <button :class="['tab-btn', { active: showCalendar }]" @click="showCalendar = true">月度</button>
      </div>
    </div>

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
        <div class="date-cell empty" v-for="n in (new Date(demoTime.year, demoTime.month).getDay())" :key="'empty-' + n"></div>
        <div
          class="date-cell"
          v-for="date in demoMonthDays"
          :key="'date-' + date"
          :class="{ today: date === curTime.date && demoTime.month === curTime.month && demoTime.year === curTime.year, selected: date%11 === 2 }"
        >
          {{ date }}
        </div>
      </div>
    </div>

    <div class="appointments-list">
      <div v-for="item in (scheduleData.length ? scheduleData.slice(0, 3) : predemoData.slice(0, 3))" :key="item.id" class="appointment-list-item">
        <div class="item-avatar"></div>
        <div class="item-content">
          <p class="item-title">{{ item.title }}</p>
          <p class="item-time">{{ item.time }}</p>
        </div>
      </div>
    </div>

    <button class="see-more-btn" @click="jumpToDetail">查看完整日程 →</button>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const scheduleData = ref([]);
const predemoData = ref([
  { id: 1, title: '12点前碎觉', time: '22:00 - 00:00' },
  { id: 2, title: '及时吃早餐', time: '09:00am - 10:00am' }
]);
const showCalendar = ref(true)
const curTime = reactive({
  year: (new Date()).getFullYear(),
  month: (new Date()).getMonth(),
  date: (new Date()).getDate(),
  day: (new Date()).getDay(),
  hour: (new Date()).getHours(),
  minute: (new Date()).getMinutes()
})
let _cnt_year = (new Date()).getFullYear();
let _cnt_month = (new Date()).getMonth();
const demoTime = reactive({
  year: _cnt_year,
  month: _cnt_month
})
const demoMonthDays = computed(() => {
  return new Date(new Date(demoTime.year,demoTime.month).getFullYear(), new Date(demoTime.year,demoTime.month).getMonth() + 1, 0).getDate();
})

function jumpToDetail() {
  router.push('/todolist');
}

function plusMonth(num: number) {
  demoTime.month += num;

  if (demoTime.month > 11) {
    demoTime.year += Math.floor(demoTime.month / 12);
    demoTime.month = demoTime.month % 12;
  }else if (demoTime.month < 0) {
    demoTime.year += Math.floor(demoTime.month / 12);
    demoTime.month = 12 + demoTime.month % 12;
  }
}

</script>

<style scoped>
.appointments-calendar {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
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

/* Appointments List */
.appointments-list {
  border-top: 1px solid #D4C4B0;
  padding-top: 15px;
  margin-bottom: 15px;
}

.appointment-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.appointment-list-item:hover {
  background: #f9f9f9;
}

.item-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #C9B89C 0%, #A9787B 100%);
  flex-shrink: 0;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.item-time {
  font-size: 11px;
  color: #95a5a6;
  margin: 2px 0 0 0;
}

.item-arrow {
  color: #95a5a6;
}

.see-more-btn {
  width: 100%;
  background: none;
  border: none;
  color: #2c3e50;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px;
  text-align: center;
  transition: all 0.3s ease;
}

.see-more-btn:hover {
  color: #9DB4A0;
}
</style>
