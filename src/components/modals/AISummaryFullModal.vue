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

<style lang="scss" scoped src="@/scss/components/modals/AISummaryFullModal.scss"></style>
