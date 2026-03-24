import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useExerciseCheckin } from './useExerciseCheckin'
import { useMealCheckin } from './useMealCheckin'
import { useSleepCheckin } from './useSleepCheckin'
import {
    getTimeOfDay,
    formatCSTDate,
    calculateHealthScore,
    getTodayStats,
    getMotivationalQuote,
    getTimeInCST
} from '../utils/homePageUtils'

export function useHomePageLogic() {
    const router = useRouter()
    const authStore = useAuthStore()
    const exerciseCheckin = useExerciseCheckin()
    const mealCheckin = useMealCheckin()
    const sleepCheckin = useSleepCheckin()

    // 响应式数据
    const timeOfDay = ref(getTimeOfDay())
    const currentDate = ref(formatCSTDate(getTimeInCST()))
    const motivationalQuote = ref(getMotivationalQuote())
    const healthScore = ref(calculateHealthScore({}))
    const todayStats = ref<any[]>([])
    const recentRecords = ref<any[]>([])
    const showCheckinMenu = ref(false)

    /**
     * 生成动态问候语
     * 根据时间和用户的打卡情况生成个性化问候
     */
    function generateDynamicGreeting(): string {
        const now = getTimeInCST()
        const hour = now.getHours()
        const exerciseCount = exerciseCheckin.records.value.length
        const mealCount = mealCheckin.records.value.length
        const sleepRecords = sleepCheckin.records.value

        // 基础问候
        let greeting = timeOfDay.value.greeting

        // 根据时间和打卡情况添加提醒
        const reminders: string[] = []

        // 下午14点-22点且还没吃饭则提醒吃饭
        if (hour >= 14 && hour < 22 && mealCount === 0) {
            reminders.push('该吃饭了，健康的身体需要均衡营养')
        }

        // 晚上23点后还没睡觉则提醒睡觉
        if (hour >= 23 && sleepRecords.length === 0) {
            reminders.push('夜深了，早点休息噢')
        }

        // 运动次数为0则提醒锻炼
        if (exerciseCount === 0) {
            reminders.push('今天还没有运动呢，动起来吧')
        }

        // 上午9点到下午9点提醒喝水
        if (hour >= 9 && hour < 21) {
            reminders.push('喝口水吧')
        }

        // 如果有提醒则添加
        if (reminders.length > 0) {
            greeting += ' | ' + reminders[0]
        }

        return greeting
    }

    /**
     * 获取统计卡片的单色图标
     */
    function getStatIcon(label: string): string {
        const icons: Record<string, string> = {
            '运动': '◆',
            '饮食': '▤',
            '睡眠': '◇'
        }
        return icons[label] || '•'
    }

    /**
     * 打开运动打卡
     */
    function openExerciseCheckin() {
        showCheckinMenu.value = false
        router.push('/exercise/checkin')
    }

    /**
     * 打开饮食打卡
     */
    function openMealCheckin() {
        showCheckinMenu.value = false
        router.push('/meal/checkin')
    }

    /**
     * 打开睡眠打卡
     */
    function openSleepCheckin() {
        showCheckinMenu.value = false
        router.push('/sleep/checkin')
    }

    /**
     * 更新健康指数
     */
    function updateHealthScore() {
        const exerciseCount = exerciseCheckin.records.value.length
        const mealCount = mealCheckin.records.value.length
        const sleepRecords = sleepCheckin.records.value

        // 计算运动总时长（分钟）
        let exerciseTotalMinutes = 0
        exerciseCheckin.records.value.forEach(record => {
            exerciseTotalMinutes += record.duration_min || 0
        })

        // 计算饮食总卡路里
        let totalCalories = 0
        mealCheckin.records.value.forEach(record => {
            totalCalories += Number(record.calories) || 0
        })

        // 获取睡眠时长
        const sleepHours = sleepRecords.length > 0
            ? parseFloat(String(sleepRecords[0].sleep_duration_hours))
            : 0

        // 调用新的严格评分函数
        healthScore.value = calculateHealthScore({
            exerciseCount,
            exerciseTotalMinutes,
            mealCount,
            totalCalories,
            sleepHours,
            hasCheckin: exerciseCount > 0 || mealCount > 0 || sleepHours > 0
        })
    }

    /**
     * 更新今日统计
     */
    function updateTodayStats() {
        const stats = getTodayStats({
            exerciseCount: exerciseCheckin.records.value.length,
            mealCount: mealCheckin.records.value.length,
            sleepHours: sleepCheckin.records.value.length > 0
                ? parseFloat(String(sleepCheckin.records.value[0].sleep_duration_hours))
                : 0
        })
        todayStats.value = stats
    }

    /**
     * 获取最近打卡记录
     */
    function updateRecentRecords() {
        const allRecords: any[] = []

        // 添加运动记录
        exerciseCheckin.records.value.slice(0, 3).forEach(r => {
            allRecords.push({
                type: '🏃 运动',
                title: r.activity_type,
                time: new Date(r.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                value: `${r.duration_min}分钟`
            })
        })

        // 添加饮食记录
        mealCheckin.records.value.slice(0, 3).forEach(r => {
            allRecords.push({
                type: '🍽️ 饮食',
                title: r.food_name,
                time: new Date(r.meal_time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                value: `${Math.round(Number(r.calories))}卡`
            })
        })

        // 添加睡眠记录
        sleepCheckin.records.value.slice(0, 3).forEach(r => {
            allRecords.push({
                type: '😴 睡眠',
                title: r.is_nap === 0 ? '夜间睡眠' : '午睡',
                time: new Date(r.sleep_start_time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                value: `${Number(r.sleep_duration_hours).toFixed(1)}h`
            })
        })

        // 按时间排序并取最近5条
        recentRecords.value = allRecords.sort((a, b) => {
            const timeA = new Date(`2000-01-01 ${a.time}`).getTime()
            const timeB = new Date(`2000-01-01 ${b.time}`).getTime()
            return timeB - timeA
        }).slice(0, 5)
    }

    /**
     * 加载所有数据
     */
    async function loadAllData() {
        try {
            await authStore.fetchUserInfo()
            await exerciseCheckin.loadRecords()
            await mealCheckin.loadRecords()
            await sleepCheckin.loadRecords()

            updateHealthScore()
            updateTodayStats()
            updateRecentRecords()
        } catch (error) {
            console.error('加载数据失败:', error)
        }
    }

    /**
     * 刷新时间相关的数据
     */
    function refreshTimeData() {
        currentDate.value = formatCSTDate(getTimeInCST())
        timeOfDay.value = getTimeOfDay()
    }

    return {
        // 状态
        timeOfDay,
        currentDate,
        motivationalQuote,
        healthScore,
        todayStats,
        recentRecords,
        showCheckinMenu,
        exerciseCheckin,
        mealCheckin,
        sleepCheckin,

        // 方法
        generateDynamicGreeting,
        getStatIcon,
        openExerciseCheckin,
        openMealCheckin,
        openSleepCheckin,
        updateHealthScore,
        updateTodayStats,
        updateRecentRecords,
        loadAllData,
        refreshTimeData
    }
}
