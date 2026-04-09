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

<style scoped>
.portrait-recommendations {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-radius: 12px;
  padding: 20px;
}

.recommendations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #E1D9D0;
}

.recommendations-title {
  font-size: 16px;
  font-weight: 700;
  color: #5A7A87;
}

.recommendations-count {
  background: #9DB4A0;
  color: #FEFCFA;
  font-size: 12px;
  font-weight: 700;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #8B9FA0;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.empty-text {
  font-size: 14px;
  font-weight: 600;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  background: #FFFFFF;
  border-left: 4px solid #E8E1D6;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.recommendation-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.recommendation-item.high {
  border-left-color: #A9787B;
  background: linear-gradient(90deg, rgba(169, 120, 123, 0.05) 0%, transparent 100%);
}

.recommendation-item.medium {
  border-left-color: #C9B89C;
  background: linear-gradient(90deg, rgba(201, 184, 156, 0.05) 0%, transparent 100%);
}

.recommendation-item.low {
  border-left-color: #9DB4A0;
  background: linear-gradient(90deg, rgba(157, 180, 160, 0.05) 0%, transparent 100%);
}

.recommendation-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.recommendation-priority {
  font-size: 10px;
  font-weight: 700;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FEFCFA;
}

.recommendation-priority.high {
  background: #A9787B;
}

.recommendation-priority.medium {
  background: #C9B89C;
}

.recommendation-priority.low {
  background: #9DB4A0;
}

.recommendation-icon {
  font-size: 24px;
}

.recommendation-content {
  flex: 1;
  min-width: 0;
}

.recommendation-title {
  font-size: 14px;
  font-weight: 700;
  color: #5A7A87;
  margin-bottom: 4px;
}

.recommendation-description {
  font-size: 12px;
  color: #8B9FA0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommendation-action {
  flex-shrink: 0;
}

.btn-detail {
  padding: 6px 12px;
  background: linear-gradient(135deg, #9DB4A0 0%, #8FA591 100%);
  color: #FEFCFA;
  border: 1px solid #9DB4A0;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-detail:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(157, 180, 160, 0.3);
}

@media (max-width: 768px) {
  .recommendation-item {
    flex-direction: column;
    gap: 10px;
  }

  .recommendation-left {
    flex-direction: row;
    align-items: center;
  }

  .btn-detail {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .portrait-recommendations {
    padding: 15px;
  }

  .recommendation-item {
    padding: 12px;
  }

  .recommendation-title {
    font-size: 13px;
  }

  .recommendation-description {
    font-size: 11px;
  }

  .recommendation-icon {
    font-size: 20px;
  }
}
</style>
