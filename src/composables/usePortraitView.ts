import { ref } from 'vue'
import { useAuthForm } from '../composables/useAuthForm'
import { fetchWithRefresh } from '../api/http'

interface Metrics {
  bmi: number
  cardio: number
  metabolism: number
  sleepQuality: number
}

interface Recommendation {
  id: string
  icon: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  status: 'completed' | 'pending'
}

interface PortraitData {
  healthScore: number
  exerciseScore: number
  mealScore: number
  sleepScore: number
  radarData: {
    dimensions: string[]
    current: number[]
    ideal: number[]
  }
  metrics: Metrics
  recommendations: Recommendation[]
  timelineEvents: TimelineEvent[]
}

export function usePortraitView() {
  const { checkHealthInfoNeeded } = useAuthForm()

  const showHealthSetupModal = ref(false)
  const isRefreshing = ref(false)

  const portraitData = ref<PortraitData>({
    healthScore: 0,
    exerciseScore: 0,
    mealScore: 0,
    sleepScore: 0,
    
    radarData: {
      dimensions: ['运动', '饮食', '睡眠', '心理', '社交'],
      current: [0, 0, 0, 0, 0],
      ideal: [85, 80, 85, 80, 80]
    },
    
    metrics: {
      bmi: 0,
      cardio: 0,
      metabolism: 0,
      sleepQuality: 0
    },
    
    recommendations: [],
    timelineEvents: []
  })

  function handleHealthSetupClose() {
    console.log('用户尝试关闭健康档案设置 - 但必须完成')
  }

  async function handleHealthSetupSuccess() {
    showHealthSetupModal.value = false
    console.log('用户完成了健康档案设置！准备刷新健康画像数据...')
    
    try {
      const response = await fetchWithRefresh(
        '/api/health/refresh-from-checkin',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (!response.ok) {
        console.warn('后端数据刷新请求失败', response.status)
      } else {
        console.log('后端已触发 aiChat 分析，数据已更新到数据库')
      }
    } catch (err) {
      console.error('调用后端刷新接口出错:', err)
    }
    
    await pollForPortraitData()
  }

  async function pollForPortraitData() {
    let attempts = 0
    const maxAttempts = 30
    const baseDelay = 500
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetchWithRefresh(
          '/api/health/portrait',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          
          const hasValidData = data?.data?.exerciseScore > 0 || 
                             data?.data?.mealScore > 0 || 
                             data?.data?.sleepScore > 0
          
          if (hasValidData) {
            console.log('获取到有效的健康画像数据，停止轮询')
            await loadPortraitData()
            return
          }
        }
      } catch (err) {
        console.error('轮询出错:', err)
      }
      
      attempts++
      const delayMs = baseDelay * (attempts > 5 ? 2 : 1.2 ** attempts)
      console.log(`轮询第 ${attempts} 次，等待 ${delayMs}ms 后重试...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
    
    console.warn('轮询超时，未获取到有效数据')
    await loadPortraitData()
  }

  async function handleRefreshClick() {
    console.log('用户点击刷新按钮，准备强制刷新数据...')
    
    isRefreshing.value = true
    
    try {
      const response = await fetchWithRefresh(
        '/api/health/force-refresh',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (!response.ok) {
        console.error('强制刷新请求失败', response.status)
        alert('数据刷新失败，请稍后重试')
        return
      }

      console.log('强制刷新请求已发送，等待 AI 分析结果...')
      
      await pollForRefreshData()
    } catch (err) {
      console.error('调用强制刷新接口出错:', err)
      alert('刷新出错，请稍后重试')
    } finally {
      isRefreshing.value = false
    }
  }

  async function pollForRefreshData() {
    let attempts = 0
    const maxAttempts = 60
    const baseDelay = 500
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetchWithRefresh(
          '/api/health/portrait',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          const portraitInfo = data?.data
          
          const hasValidData = portraitInfo?.exerciseScore > 0 || 
                             portraitInfo?.mealScore > 0 || 
                             portraitInfo?.sleepScore > 0
          
          if (hasValidData) {
            console.log('获取到最新的健康画像数据')
            await loadPortraitData()
            alert('数据刷新成功！')
            return
          }
        }
      } catch (err) {
        console.error('轮询出错:', err)
      }
      
      attempts++
      const delayMs = baseDelay * (attempts > 5 ? 2 : 1.2 ** attempts)
      console.log(`轮询第 ${attempts} 次，等待 ${delayMs}ms 后重试...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
    
    console.warn('轮询超时，AI 分析可能未完成')
    await loadPortraitData()
  }

  async function loadPortraitData() {
    try {
      const response = await fetchWithRefresh(
        '/api/health/portrait',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        
        if (data?.success && data.data) {
          const portraitInfo = data.data
          
          const exerciseScore = portraitInfo.exerciseScore || 0
          const mealScore = portraitInfo.mealScore || 0
          const sleepScore = portraitInfo.sleepScore || 0
          
          const healthScore = Math.round((exerciseScore + mealScore + sleepScore) / 3)
          
          const recommendations = (portraitInfo.recommendations || []).map((rec: any, idx: number) => ({
            id: `rec-${idx}`,
            icon: rec.icon || '💡',
            title: rec.title || '健康建议',
            description: rec.description || '持续改进你的健康生活方式',
            priority: (rec.priority || 'medium') as 'high' | 'medium' | 'low'
          }))
          
          const timelineEvents = (portraitInfo.timeline || []).map((event: any, idx: number) => ({
            id: `event-${idx}`,
            date: event.date || new Date().toISOString(),
            title: event.title || '健康事件',
            description: event.description || '',
            status: (event.status === 'completed' ? 'completed' : 'pending') as 'completed' | 'pending'
          }))
          
          portraitData.value = {
            healthScore,
            exerciseScore,
            mealScore,
            sleepScore,
            
            radarData: {
              dimensions: ['运动', '饮食', '睡眠', '心理', '社交'],
              current: [exerciseScore, mealScore, sleepScore, 70, 75],
              ideal: [85, 80, 85, 80, 80]
            },
            
            metrics: {
              bmi: typeof portraitInfo.bmi === 'string' ? parseFloat(portraitInfo.bmi) : (portraitInfo.bmi || 0),
              cardio: portraitInfo.cardioLevel || 0,
              metabolism: portraitInfo.metabolism || 0,
              sleepQuality: sleepScore
            },
            
            recommendations: recommendations.length > 0 ? recommendations : [
              {
                id: 'default-1',
                icon: '🏃',
                title: '增加有氧运动',
                description: '建议每周进行3-5次有氧运动，每次30分钟以上',
                priority: 'high'
              },
              {
                id: 'default-2',
                icon: '🥗',
                title: '均衡膳食结构',
                description: '增加蔬菜水果摄入，减少高热量食物',
                priority: 'high'
              },
              {
                id: 'default-3',
                icon: '🌙',
                title: '规律作息',
                description: '建议22:30前入睡，保证7-8小时睡眠时间',
                priority: 'high'
              }
            ],
            
            timelineEvents: timelineEvents.length > 0 ? timelineEvents : [
              {
                id: 'default-1',
                date: new Date().toISOString(),
                title: '健康档案已建立',
                description: '您的个人健康档案已成功创建',
                status: 'completed'
              }
            ]
          }
          
          console.log('✅ 健康画像数据已加载:', portraitData.value)
        }
      }
    } catch (error) {
      console.error('加载健康画像数据失败:', error)
    }
  }

  async function initPortrait() {
    try {
      const needsHealthInfo = await checkHealthInfoNeeded()
      if (needsHealthInfo) {
        showHealthSetupModal.value = true
        return
      }

      console.log('健康档案已完成，加载现有数据...')
      await loadPortraitData()
    } catch (err) {
      console.error('页面初始化错误:', err)
    }
  }

  return {
    showHealthSetupModal,
    isRefreshing,
    portraitData,
    handleHealthSetupClose,
    handleHealthSetupSuccess,
    handleRefreshClick,
    initPortrait
  }
}
