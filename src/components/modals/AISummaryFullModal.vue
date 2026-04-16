<template>
  <transition name="modal-fade">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <span class="modal-icon">{{ icon }}</span>
            <h2 class="modal-title">{{ title }}</h2>
          </div>
          <button class="modal-close" @click="close">✕</button>
        </div>

        <div class="modal-body">
          <div class="summary-content">
            <p class="summary-text">{{ content }}</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-close" @click="close">关闭</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  visible: boolean
  icon?: string
  title?: string
  content?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  icon: '📊',
  title: 'AI 总结',
  content: ''
})

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}

// 监听外部 visible 变化，防止滚动
watch(() => props.visible, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
}, { immediate: true })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  font-size: 24px;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #2c3e50;
}

.modal-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #555;
  white-space: pre-wrap;
  word-break: break-word;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-close {
  padding: 10px 24px;
  background: #f0f0f0;
  color: #2c3e50;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #e0e0e0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    max-height: 90vh;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-footer {
    padding: 12px 16px;
  }

  .modal-title {
    font-size: 16px;
  }

  .summary-text {
    font-size: 13px;
  }
}
</style>
