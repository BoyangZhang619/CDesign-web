/**
 * 主页数据统计与展示工具
 * 处理东八区时间、数据聚合、趋势分析等
 */

// 东八区时间工具
export function getTimeInCST(): Date {
    const now = new Date()
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000
    const cstTime = new Date(utcTime + 8 * 60 * 60 * 1000)
    return cstTime
}

export function formatCSTTime(date: Date | string): string {
    const cstDate = typeof date === 'string' ? new Date(date) : date
    const year = cstDate.getFullYear()
    const month = String(cstDate.getMonth() + 1).padStart(2, '0')
    const day = String(cstDate.getDate()).padStart(2, '0')
    const hours = String(cstDate.getHours()).padStart(2, '0')
    const minutes = String(cstDate.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
}

export function formatCSTDate(date: Date | string): string {
    const cstDate = typeof date === 'string' ? new Date(date) : date
    const year = cstDate.getFullYear()
    const month = String(cstDate.getMonth() + 1).padStart(2, '0')
    const day = String(cstDate.getDate()).padStart(2, '0')
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekDay = weekDays[cstDate.getDay()]
    return `${year}-${month}-${day} ${weekDay}`
}

export function getCSTDayOfWeek(date: Date | string): string {
    const cstDate = typeof date === 'string' ? new Date(date) : date
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekDays[cstDate.getDay()]
}

// 获取当前的时段描述
export function getTimeOfDay(): {
    period: string
    greeting: string
    emoji: string
    color: string
} {
    const cstTime = getTimeInCST()
    const hour = cstTime.getHours()

    // if (hour >= 5 && hour < 9) {
    //     return {
    //         period: '早晨',
    //         greeting: '早上好，一日之计在于晨',
    //         emoji: '🌅',
    //         color: '#d4af8f'
    //     }
    // } else if (hour >= 9 && hour < 12) {
    //     return {
    //         period: '上午',
    //         greeting: '上午好，准备好打卡了吗',
    //         emoji: '☀️',
    //         color: '#8b9a7f'
    //     }
    // } else if (hour >= 12 && hour < 14) {
    //     return {
    //         period: '中午',
    //         greeting: '午饭时间，休息一下',
    //         emoji: '🍽️',
    //         color: '#d4af8f'
    //     }
    // } else if (hour >= 14 && hour < 18) {
    //     return {
    //         period: '下午',
    //         greeting: '下午好，坚持就是成功',
    //         emoji: '⚡',
    //         color: '#384759'
    //     }
    // } else if (hour >= 18 && hour < 22) {
    //     return {
    //         period: '晚上',
    //         greeting: '晚上好，今天的坚持值得鼓励',
    //         emoji: '🌙',
    //         color: '#7a4a5a'
    //     }
    // } else {
    //     return {
    //         period: '深夜',
    //         greeting: '夜深了，早点休息才能健康',
    //         emoji: '🌟',
    //         color: '#384759'
    //     }
    // }
    const configs = [
        {
            range: [5, 9],
            period: '早晨',
            greeting: '晨光熹微，今日亦是全新的起点',
            emoji: '🌅',
            color: '#d4af8f'
        },
        {
            range: [9, 12],
            period: '上午',
            greeting: '专注当下，去感受时光的流淌',
            emoji: '☀️',
            color: '#8b9a7f'
        },
        {
            range: [12, 14],
            period: '中午',
            greeting: '停歇片刻，与食物温柔相处',
            emoji: '🍽️',
            color: '#d4af8f'
        },
        {
            range: [14, 18],
            period: '下午',
            greeting: '步履不停，在平淡中积蓄力量',
            emoji: '⚡',
            color: '#384759'
        },
        {
            range: [18, 22],
            period: '晚上',
            greeting: '暮色温柔，感谢今日自律的自己',
            emoji: '🌙',
            color: '#7a4a5a'
        },
    ];

    const current = configs.find(c => hour >= c.range[0] && hour < c.range[1])
        || { period: '深夜', greeting: '万物静默，愿你与好梦不期而遇', emoji: '🌟', color: '#384759' };
    return current
}

// 计算健康指数（0-100）- 严格的加权评分系统
export function calculateHealthScore(data: {
    exerciseCount?: number
    exerciseTotalMinutes?: number
    mealCount?: number
    totalCalories?: number
    sleepHours?: number
    hasCheckin?: boolean
}): {
    score: number
    level: string
    description: string
    emoji: string
    breakdown: {
        exercise: { score: number; maxScore: number; reason: string }
        nutrition: { score: number; maxScore: number; reason: string }
        sleep: { score: number; maxScore: number; reason: string }
        checkin: { score: number; maxScore: number; reason: string }
    }
    weakPoints: string[]
} {
    let score = 0 // 从0开始，严格计分

    // ============================================
    // 1. 运动评分（最多+25分）
    // ============================================
    let exerciseScore = 0
    let exerciseReason = ''
    const exerciseMinutes = data.exerciseTotalMinutes || (data.exerciseCount ? data.exerciseCount * 20 : 0)
    if (exerciseMinutes > 0) {
        exerciseScore = Math.min((exerciseMinutes / 150) * 25, 25)
        exerciseReason = `运动${exerciseMinutes}分钟，达到目标${(exerciseMinutes / 150 * 100).toFixed(0)}%`
    } else {
        exerciseReason = '今日未运动'
    }
    score += exerciseScore

    // ============================================
    // 2. 饮食评分（最多+35分）
    // ============================================
    let mealRegularityScore = 0
    let nutritionScore = 0
    let nutritionReason = ''
    
    const mealsPerDay = data.mealCount || 0
    if (mealsPerDay >= 3) {
        mealRegularityScore = 15
    } else if (mealsPerDay === 2) {
        mealRegularityScore = 10
    } else if (mealsPerDay === 1) {
        mealRegularityScore = 5
    }
    
    const totalCalories = data.totalCalories || 0
    if (totalCalories > 0) {
        if (totalCalories >= 1800 && totalCalories <= 2200) {
            nutritionScore = 20
            nutritionReason = `${mealsPerDay}餐，${totalCalories}卡（理想范围）`
        } else if (totalCalories >= 1500 && totalCalories <= 2500) {
            const deviation = Math.abs(totalCalories - 2000)
            nutritionScore = Math.max(20 - (deviation / 500) * 5, 12)
            nutritionReason = `${mealsPerDay}餐，${totalCalories}卡（可接受范围）`
        } else if (totalCalories >= 1200 && totalCalories < 1500) {
            nutritionScore = 8
            nutritionReason = `${mealsPerDay}餐，${totalCalories}卡（卡路里不足）`
        } else if (totalCalories > 2500 && totalCalories <= 3000) {
            nutritionScore = 10
            nutritionReason = `${mealsPerDay}餐，${totalCalories}卡（卡路里偏高）`
        } else {
            nutritionScore = 2
            nutritionReason = `${mealsPerDay}餐，${totalCalories}卡（严重偏差）`
        }
    } else {
        nutritionReason = '今日未进食'
    }
    score += mealRegularityScore + nutritionScore

    // ============================================
    // 3. 睡眠评分（最多+30分）
    // ============================================
    let sleepScore = 0
    let sleepReason = ''
    const sleepHours = data.sleepHours || 0
    if (sleepHours > 0) {
        if (sleepHours >= 7 && sleepHours <= 9) {
            sleepScore = 30
            sleepReason = `睡眠${sleepHours}小时（理想范围）`
        } else if (sleepHours >= 6.5 && sleepHours < 7) {
            sleepScore = 25
            sleepReason = `睡眠${sleepHours}小时（略短）`
        } else if (sleepHours > 9 && sleepHours <= 10) {
            sleepScore = 25
            sleepReason = `睡眠${sleepHours}小时（略长）`
        } else if (sleepHours >= 6 && sleepHours < 6.5) {
            sleepScore = 20
            sleepReason = `睡眠${sleepHours}小时（短睡眠）`
        } else if (sleepHours > 10 && sleepHours <= 11) {
            sleepScore = 20
            sleepReason = `睡眠${sleepHours}小时（长睡眠）`
        } else if (sleepHours >= 5 && sleepHours < 6) {
            sleepScore = 10
            sleepReason = `睡眠${sleepHours}小时（很短）`
        } else if (sleepHours > 11) {
            sleepScore = 8
            sleepReason = `睡眠${sleepHours}小时（过长）`
        } else {
            sleepScore = 3
            sleepReason = `睡眠${sleepHours}小时（严重不足）`
        }
    } else {
        sleepReason = '今日未记录睡眠'
    }
    score += sleepScore

    // ============================================
    // 4. 打卡坚持奖励（+10分）
    // ============================================
    let checkinScore = 0
    let checkinReason = ''
    if (data.hasCheckin) {
        const checkinItems = (data.exerciseCount ? 1 : 0) + (data.mealCount ? 1 : 0) + (data.sleepHours ? 1 : 0)
        if (checkinItems === 3) {
            checkinScore = 10
            checkinReason = '全部打卡'
        } else if (checkinItems > 0) {
            checkinScore = 5
            checkinReason = `部分打卡（${checkinItems}/3）`
        }
    } else {
        checkinReason = '未打卡'
    }
    score += checkinScore

    // 确保分数在0-100之间
    score = Math.max(0, Math.min(score, 100))

    // ============================================
    // 找出薄弱点
    // ============================================
    const scores = [
        { name: '运动', score: exerciseScore, max: 25 },
        { name: '营养', score: mealRegularityScore + nutritionScore, max: 35 },
        { name: '睡眠', score: sleepScore, max: 30 },
        { name: '坚持', score: checkinScore, max: 10 }
    ]
    
    const weakPoints: string[] = []
    scores.sort((a, b) => {
        const ratioA = a.score / a.max
        const ratioB = b.score / b.max
        return ratioA - ratioB
    })
    
    // 获取得分率最低的方面
    scores.slice(0, 3).forEach(item => {
        if (item.score / item.max < 1) {
            const ratio = (item.score / item.max * 100).toFixed(0)
            weakPoints.push(`${item.name}得分偏低（${ratio}%）`)
        }
    })

    // ============================================
    // 等级划分（基于百分制）
    // ============================================
    let level = ''
    let description = ''
    let emoji = ''

    if (score >= 90) {
        level = '优秀'
        description = '你是健康生活的典范！坚持这样的节奏'
        emoji = '🏆'
    } else if (score >= 80) {
        level = '很好'
        description = '健康指数很不错，继续保持好习惯'
        emoji = '⭐'
    } else if (score >= 70) {
        level = '良好'
        description = '健康状态良好，再加一把劲'
        emoji = '✨'
    } else if (score >= 60) {
        level = '中等'
        description = '有所改善，还需要更多努力'
        emoji = '💪'
    } else if (score >= 50) {
        level = '需改进'
        description = '开始关注健康生活吧'
        emoji = '📈'
    } else if (score >= 30) {
        level = '较差'
        description = '健康数据堪忧，需要立即调整'
        emoji = '⚠️'
    } else {
        level = '很差'
        description = '健康状况亮红灯，请重视起来'
        emoji = '🚨'
    }

    return {
        score,
        level,
        description,
        emoji,
        breakdown: {
            exercise: { score: exerciseScore, maxScore: 25, reason: exerciseReason },
            nutrition: { score: mealRegularityScore + nutritionScore, maxScore: 35, reason: nutritionReason },
            sleep: { score: sleepScore, maxScore: 30, reason: sleepReason },
            checkin: { score: checkinScore, maxScore: 10, reason: checkinReason }
        },
        weakPoints
    }
}

// 获取周趋势数据
export function getTrendData(records: any[], days: number = 7): {
    dates: string[]
    values: number[]
    trend: 'up' | 'down' | 'stable'
} {
    const dates: string[] = []
    const values: number[] = []

    const cstTime = getTimeInCST()
    const today = new Date(cstTime.getFullYear(), cstTime.getMonth(), cstTime.getDate())

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        dates.push(dateStr)

        // 统计该日期的记录数
        const count = records.filter(r => {
            const recordDate = typeof r.created_at === 'string' ? r.created_at.split('T')[0] : r.created_at
            return recordDate === dateStr
        }).length

        values.push(count)
    }

    // 判断趋势
    const lastThree = values.slice(-3)
    const avgPrev = lastThree[0] / (lastThree[1] || 1)
    const avgCurr = lastThree[2] / (lastThree[1] || 1)
    const trend = avgCurr > avgPrev ? 'up' : avgCurr < avgPrev ? 'down' : 'stable'

    return { dates, values, trend }
}

// 获取今日打卡统计
export function getTodayStats(data: {
    exerciseCount?: number
    mealCount?: number
    sleepHours?: number
}): Array<{
    label: string
    value: string | number
    unit: string
    icon: string
    color: string
}> {
    const stats = []

    if (data.exerciseCount !== undefined) {
        stats.push({
            label: '运动',
            value: data.exerciseCount,
            unit: '次',
            icon: '💪',
            color: '#d4af8f'
        })
    }

    if (data.mealCount !== undefined) {
        stats.push({
            label: '饮食',
            value: data.mealCount,
            unit: '顿',
            icon: '🍽️',
            color: '#8b9a7f'
        })
    }

    if (data.sleepHours !== undefined) {
        stats.push({
            label: '睡眠',
            value: data.sleepHours.toFixed(1),
            unit: '小时',
            icon: '😴',
            color: '#7a4a5a'
        })
    }

    return stats
}

// 获取激励语
export function getMotivationalQuote(): {
    text: string
    author: string
} {
    const quotes = [
        // --- 简体：优雅与自我察觉 ---
        { text: '凡是过往，皆为序章。', author: '莎士比亚' },
        { text: '每个不曾起舞的日子，都是对生命的辜负。', author: '尼采' },
        { text: '所谓自由，不是随心所欲，而是自我主宰。', author: '康德' },
        { text: '自律的顶端，是自由。', author: 'Anonymous' },

        // --- 英文：力量与极简 ---
        { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
        { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
        { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
        { text: 'Be not afraid of going slowly, be afraid only of standing still.', author: 'Proverb' },

        // --- 繁体：诗意与哲思 ---
        { text: '世界愈吵雜，內心愈要安靜。', author: 'Stefan Zweig' },
        { text: '慢慢來，比較快。', author: 'Zen Saying' },
        { text: '時光不負有心人，星光不問趕路人。', author: 'Anonymous' },

        // --- 现代与生活感 ---
        { text: '最好的作品，是你自己。', author: 'zby' },
        { text: '在每一个普通的日子里，积累改变世界的力量。', author: 'Life' }
    ];

    return quotes[Math.floor(Math.random() * quotes.length)]
}
