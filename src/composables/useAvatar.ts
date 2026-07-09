/**
 * 头像持久化与 fallback 链：
 * 1. localStorage 有 → 先渲染本地，再异步请求 API 更新
 * 2. localStorage 无 → 随机默认头像 → 异步请求 API
 * 3. API 成功 → 替换并存入 localStorage
 * 4. API 失败 → 保持当前（本地或默认）
 */
import { ref, onMounted } from 'vue'
import { fetchWithRefresh } from '../api/http'

const AVATAR_KEY = 'stuheal_pixel_avatar'

// 8 个极简 16×16 像素默认头像（hex 字符串，256 chars）
const DEFAULT_AVATARS: string[] = [
  // 1. 笑脸
  '0000000000000000000111111110000000011000000110000001001111001000000100000001000000010000100100000001000000000010011111001000000001000000010000000011000000110000000001111111000000000000000000000000',
  // 2. 星星
  '0000000000000000000000000100000000000001110000000000000111000000000001111111000000000111111100000000011111110000000000011100000000000011111000000000001111100000000000010000000000000000000000000000',
  // 3. 钻石
  '0000000000000000000000000100000000000001110000000000011111000000000011111100000000011111110000000001111111000000000011111100000000000111000000000000010000000000000000000000000000000000000000000000',
  // 4. 心形
  '0000000000000000000110000110000000011111111000000001111111100000000111111110000000011111111000000000111111100000000001111110000000000011110000000000000110000000000000000000000000000000000000000000000',
  // 5. 猫脸
  '0000000000000000000100000010000000111111111000000011100001110000001100000011000000111111111100000011101110111000000111111111000000001100011000000000110001100000000011111110000000000000000000000000',
  // 6. 月亮
  '0000000000000000000000111110000000000111111100000000011111110000000001111000000000000111100000000000011110000000000000111000000000000011100000000000001110000000000000111000000000000011000000000000000',
  // 7. 闪电
  '0000000000000000000000001110000000000001111000000000000111100000000000001110000000000011110000000000111100000000000011100000000000001100000000000000100000000000000000000000000000000000000000000000000',
  // 8. 花朵
  '0000000000000000000000000100000000000001010000000000011111000000000011111100000000000111000000000011111111000000000111000000000011111100000000000111000000000000000000000000000000000000000000000000000',
].map(s => s.replace(/\s/g, ''))

export function useAvatar() {
  const pixelData = ref('')
  const pixelLevel = ref(16)
  const hasAvatar = ref(false)
  const loading = ref(true)

  /** 从 localStorage 加载缓存 */
  function loadCached(): boolean {
    try {
      const cached = localStorage.getItem(AVATAR_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.pixelData && parsed.level) {
          pixelData.value = parsed.pixelData
          pixelLevel.value = parsed.level
          hasAvatar.value = true
          return true
        }
      }
    } catch { /* corrupted cache */ }
    return false
  }

  /** 保存到 localStorage */
  function saveCache(data: string, level: number) {
    try {
      localStorage.setItem(AVATAR_KEY, JSON.stringify({ pixelData: data, level }))
    } catch { /* quota exceeded */ }
  }

  /** 随机选默认头像 */
  function pickDefault() {
    const idx = Math.floor(Math.random() * DEFAULT_AVATARS.length)
    pixelData.value = DEFAULT_AVATARS[idx]
    pixelLevel.value = 16
    hasAvatar.value = true
  }

  /** 完整加载流程 */
  async function load() {
    loading.value = true

    // Step 1: 尝试 localStorage
    const hasCached = loadCached()

    if (!hasCached) {
      // Step 2: 无缓存 → 随机默认头像
      pickDefault()
    }

    // Step 3: 尝试从 API 获取最新头像
    try {
      const res = await fetchWithRefresh('/avatars', { method: 'GET' })
      if (res.ok) {
        const data = await res.json()
        if (data?.success && data.data?.avatar) {
          const av = data.data.avatar
          pixelData.value = av.pixelData
          pixelLevel.value = av.level
          hasAvatar.value = true
          saveCache(av.pixelData, av.level) // 更新缓存
        }
      }
    } catch {
      // API 失败 → 保持当前（缓存或默认）
    }

    loading.value = false
  }

  // Auto-load
  onMounted(load)

  return { pixelData, pixelLevel, hasAvatar, loading, load }
}
