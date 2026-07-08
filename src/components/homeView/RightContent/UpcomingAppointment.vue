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

<style lang="scss" scoped src="@/scss/components/homeView/RightContent/UpcomingAppointment.scss"></style>
