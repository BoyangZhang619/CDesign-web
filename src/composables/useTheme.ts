import { ref, watchEffect } from 'vue'

const THEME_KEY = 'stuheal-theme'

const theme = ref<'light' | 'dark'>(
  (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light'
)

export function useTheme() {
  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.value)
    localStorage.setItem(THEME_KEY, theme.value)
  })

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    theme,
    toggleTheme,
    isDark: () => theme.value === 'dark',
    isLight: () => theme.value === 'light',
  }
}
