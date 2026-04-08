<template>
  <section class="upcoming-appointment">
    <h3 class="section-title">Upcoming appointment</h3>

    <div class="appointment-card">
      <div class="appointment-image"></div>
      <div class="appointment-info">
        <h4 class="hospital-name">Manggis ST Hospital</h4>
        <p class="hospital-location">New York, USA</p>
        <div class="doctor-info">
          <div class="doctor-avatar"></div>
          <div>
            <p class="doctor-name">Dr. Emilia Wilson</p>
            <p class="doctor-specialty">Physiotherapy</p>
          </div>
        </div>
        <button class="video-call-btn">Video call</button>
        <div class="appointment-details">
          <span class="detail-item">
            <span class="detail-icon">📅</span>
            14 Mar 2022
          </span>
          <span class="detail-item">
            <span class="detail-icon">⏰</span>
            09.00 pm
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.upcoming-appointment {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 15px 0;
}

.appointment-card {
  display: flex;
  gap: 15px;
}

.appointment-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: linear-gradient(135deg, #a8d5e2 0%, #7ec8d4 100%);
  flex-shrink: 0;
}

.appointment-info {
  flex: 1;
}

.hospital-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 2px 0;
}

.hospital-location {
  font-size: 12px;
  color: #95a5a6;
  margin: 0 0 10px 0;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.doctor-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8a580 0%, #d4956f 100%);
  flex-shrink: 0;
}

.doctor-name {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.doctor-specialty {
  font-size: 11px;
  color: #95a5a6;
  margin: 0;
}

.video-call-btn {
  background: linear-gradient(135deg, #a8d5ba 0%, #7ec8a3 100%);
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.video-call-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.appointment-details {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #7f8c8d;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
}

.detail-icon {
  font-size: 10px;
}
</style>
