import { ref, watchEffect } from 'vue'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'

const THEME_KEY = 'stuheal-theme'

const theme = ref<'light' | 'dark'>(
  (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light'
)

const isNative = Capacitor.isNativePlatform()

export function useTheme() {
  // Sync DOM attribute + localStorage + native StatusBar
  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.value)
    localStorage.setItem(THEME_KEY, theme.value)

    if (isNative) {
      if (theme.value === 'dark') {
        StatusBar.setBackgroundColor({ color: '#1A1D22' })
        StatusBar.setStyle({ style: Style.Dark })   // 暗色背景 → 白色图标
      } else {
        StatusBar.setBackgroundColor({ color: '#F0F4F8' })
        StatusBar.setStyle({ style: Style.Light })  // 亮色背景 → 深色图标
      }
      StatusBar.hide() // 全屏沉浸
    }
  })

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggleTheme }
}
