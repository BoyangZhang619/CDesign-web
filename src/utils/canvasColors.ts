/**
 * Canvas 图表主题色读取
 *
 * Canvas API 无法直接使用 CSS 变量，需要在绘制时通过 getComputedStyle 读取。
 * 每次调用都重新读取，确保主题切换后图表自动适配。
 */

/** 读取一个 CSS 自定义属性，去掉首尾空格 */
function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** 将 hex 颜色转为 rgba */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/** 图表主题颜色集，每次访问都重新读取 CSS 变量 */
export const chartTheme = {
  /** 网格线颜色 */
  get grid() { return cssVar('--color-border') || '#E2E8F0' },

  /** 标签/辅助文字颜色 */
  get label() { return cssVar('--color-text-tertiary') || '#B0B9C2' },

  /** 主题色 */
  get accent() { return cssVar('--color-accent') || '#6A9AB8' },

  /** 主题色（带透明度） */
  accentAlpha(alpha: number): string {
    return hexToRgba(this.accent, alpha)
  },

  // ── 语义类别色（跨主题不变，标识运动/饮食/睡眠） ──────────
  categoryExercise: '#F58529' as const,
  categoryMeal: '#78C850' as const,
  categorySleep: '#833AB4' as const,
}
