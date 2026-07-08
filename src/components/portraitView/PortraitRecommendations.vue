<template>
  <div class="portrait-recommendations">
    <div class="recommendations-header">
      <div class="recommendations-title">健康建议</div>
      <div class="recommendations-count">{{ recommendations.length }}</div>
    </div>

    <div v-if="recommendations.length === 0" class="empty-state">
      <div class="empty-icon">✨</div>
      <div class="empty-text">暂无个性化建议</div>
    </div>

    <div v-else class="recommendations-list">
      <div
        v-for="item in recommendations"
        :key="item.id"
        class="recommendation-item"
        :class="item.priority"
      >
        <div class="recommendation-left">
          <div class="recommendation-priority" :class="item.priority">
            {{ getPriorityLabel(item.priority) }}
          </div>
          <div class="recommendation-icon">{{ item.icon }}</div>
        </div>

        <div class="recommendation-content">
          <div class="recommendation-title">{{ item.title }}</div>
          <div class="recommendation-description">{{ item.description }}</div>
        </div>

        <div class="recommendation-action">
          <button class="btn-detail" @click="handleDetail(item.id)">
            详情
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Recommendation {
  id: string
  icon: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

defineProps({
  recommendations: {
    type: Array as () => Recommendation[],
    default: () => []
  }
})

const getPriorityLabel = (priority: string): string => {
  const labels: { [key: string]: string } = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || '中'
}

const handleDetail = (id: string) => {
  console.log('查看建议详情:', id)
  // 这里可以添加查看详情的逻辑
}
</script>

<style lang="scss" scoped src="@/scss/components/portraitView/PortraitRecommendations.scss"></style>
