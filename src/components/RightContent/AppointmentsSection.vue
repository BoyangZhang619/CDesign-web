<template>
  <section class="appointments-calendar">
    <div class="list-header">
      <h3 class="section-title">List of appointments</h3>
      <div class="tabs">
        <button class="tab-btn active">Monthly</button>
        <button class="tab-btn">Daily</button>
      </div>
    </div>

    <div class="calendar">
      <div class="calendar-header">
        <h4>October 2022</h4>
        <div class="calendar-nav">
          <button class="nav-btn">←</button>
          <button class="nav-btn">→</button>
        </div>
      </div>

      <div class="weekdays">
        <div class="weekday" v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day">
          {{ day }}
        </div>
      </div>

      <div class="dates">
        <div class="date-cell empty" v-for="n in 5" :key="'empty-' + n"></div>
        <div
          class="date-cell"
          v-for="date in 31"
          :key="'date-' + date"
          :class="{ today: date === 8, selected: date === 14 }"
        >
          {{ date }}
        </div>
      </div>
    </div>

    <div class="appointments-list">
      <div class="appointment-list-item">
        <img src="https://via.placeholder.com/40" alt="Avatar" class="item-avatar">
        <div class="item-content">
          <p class="item-title">Manage stress</p>
          <p class="item-time">10:00pm - 12:00 pm</p>
        </div>
        <span class="item-arrow">→</span>
      </div>
      <div class="appointment-list-item">
        <img src="https://via.placeholder.com/40" alt="Avatar" class="item-avatar">
        <div class="item-content">
          <p class="item-title">Physiotherapy</p>
          <p class="item-time">09:00am - 10:00 am</p>
        </div>
        <span class="item-arrow">→</span>
      </div>
    </div>

    <button class="see-more-btn">See More Schedule →</button>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.appointments-calendar {
  background: white;
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
  background: #a8d5ba;
  color: white;
  border-color: #a8d5ba;
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
  background: #f39c12;
  color: white;
}

.date-cell.selected {
  background: #a8d5ba;
  color: white;
}

.date-cell.empty {
  cursor: default;
}

/* Appointments List */
.appointments-list {
  border-top: 1px solid #f0f0f0;
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
  object-fit: cover;
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
  color: #a8d5ba;
}
</style>
