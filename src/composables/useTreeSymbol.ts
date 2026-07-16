/**
 * 树象征物数据映射
 * 将用户健康数据映射为树的视觉状态
 */
import { ref } from 'vue'
import { fetchWithRefresh } from '../api/http'

export interface TreeState {
  // 叶子
  leafCount: number        // 0-100 叶片数量
  leafHue: number          // 色相偏移：0(黄)=差 → 120(绿)=好
  // 树干
  trunkWidth: number       // 0.6-1.4 树干粗细倍率
  // 根
  rootDepth: number        // 0-1 根系深度
  // 花
  flowerCount: number       // 0-8 花朵数量（成就）
  // 鸟巢
  hasNest: boolean          // 是否有鸟巢（连续7天完美打卡）
  hasEggs: boolean          // 鸟巢里是否有蛋（连续30天）
  // 飘落
  petalCount: number        // 0-10 飘落花瓣（当日心情好）
  // 背景
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  // 原始数据
  streak: number           // 连续打卡天数
  healthScore: number      // 综合健康分 0-100
  exerciseScore: number    // 运动分
  mealScore: number        // 饮食分
  sleepScore: number       // 睡眠分
  mood: number             // 当日心情 1-5
}

export function useTreeSymbol() {
  const loading = ref(false)
  const tree = ref<TreeState>(defaultTree())

  function defaultTree(): TreeState {
    return {
      leafCount: 5, leafHue: 90, trunkWidth: 1, rootDepth: 0.3,
      flowerCount: 0, hasNest: false, hasEggs: false, petalCount: 0,
      season: 'spring', streak: 0, healthScore: 0, exerciseScore: 0,
      mealScore: 0, sleepScore: 0, mood: 3,
    }
  }

  async function loadTreeData() {
    loading.value = true
    try {
      // 获取健康画像数据
      const portraitRes = await fetchWithRefresh('/health/portrait', { method: 'GET' })
      if (portraitRes.ok) {
        const d = await portraitRes.json()
        if (d?.success && d.data) {
          const p = d.data
          tree.value.exerciseScore = p.exerciseScore || p.exercise_score || 0
          tree.value.mealScore = p.mealScore || p.meal_score || 0
          tree.value.sleepScore = p.sleepScore || p.sleep_score || 0
          tree.value.healthScore = p.overallScore || p.overall_score || 0
          tree.value.mood = p.mood || 3
        }
      }

      // 获取近期打卡数据（用于计算连续天数）
      const historyRes = await fetchWithRefresh('/history/get?limit=30', { method: 'GET' })
      if (historyRes.ok) {
        const hd = await historyRes.json()
        if (hd?.success && hd.data?.records) {
          tree.value.streak = calcStreak(hd.data.records)
        }
      }

      // 映射为树的视觉状态
      mapToTree()
    } catch { /* 静默 */ }
    finally { loading.value = false }
  }

  /** 计算连续打卡天数 */
  function calcStreak(records: Array<{ checkin_date?: string; created_at?: string }>): number {
    const dates = new Set(
      records.map(r => (r.checkin_date || r.created_at || '').slice(0, 10)).filter(Boolean)
    )
    const sorted = [...dates].sort().reverse()
    if (sorted.length === 0) return 0
    let streak = 0
    const today = new Date().toISOString().slice(0, 10)
    // 检查今天或昨天是否有打卡
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    if (sorted[0] !== today && sorted[0] !== yesterday) return 0
    let target = new Date(sorted[0])
    for (const d of sorted) {
      const expected = target.toISOString().slice(0, 10)
      if (d === expected) {
        streak++
        target.setDate(target.getDate() - 1)
      } else if (d < expected) break
    }
    return streak
  }

  /** 将原始数据映射为树的视觉参数 */
  function mapToTree() {
    const t = tree.value

    // 叶子：连续天数 → 数量 (0→5, 7→30, 30→70, 100→100)
    const streakDays = Math.min(t.streak, 100)
    t.leafCount = Math.round(5 + streakDays * 0.95)  // 5~100

    // 叶子颜色：健康分 0→黄(30), 50→浅绿(80), 100→翠绿(120)
    t.leafHue = 30 + (t.healthScore / 100) * 90

    // 树干：运动分 0→细(0.6), 50→正常(1.0), 100→粗(1.4)
    t.trunkWidth = 0.6 + (t.exerciseScore / 100) * 0.8

    // 根系：睡眠分 0→浅(0.1), 50→中等(0.5), 100→深(1.0)
    t.rootDepth = Math.max(0.1, t.sleepScore / 100)

    // 花：每完成一个里程碑(+20健康分)开一朵花
    t.flowerCount = Math.min(8, Math.floor(t.healthScore / 12.5))

    // 鸟巢：连续7天
    t.hasNest = t.streak >= 7
    t.hasEggs = t.streak >= 30

    // 花瓣：心情好(4-5)时有花瓣飘落
    t.petalCount = t.mood >= 4 ? (t.mood - 3) * 5 : 0

    // 季节：根据健康分大趋势
    if (t.healthScore >= 80) t.season = 'summer'
    else if (t.healthScore >= 50) t.season = 'spring'
    else if (t.healthScore >= 30) t.season = 'autumn'
    else t.season = 'winter'
  }

  return { tree, loading, loadTreeData }
}
