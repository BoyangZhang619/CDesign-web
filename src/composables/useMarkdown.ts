/**
 * Markdown 渲染 composable
 * 使用 marked 将 AI 回复的 Markdown 文本转为安全 HTML
 */
import { marked } from 'marked'

// 配置 marked
marked.setOptions({
  breaks: true,       // 换行 → <br>
  gfm: true,          // GitHub Flavored Markdown
})

export function useMarkdown() {
  function render(text: string): string {
    if (!text) return ''
    try {
      return marked.parse(text, { async: false }) as string
    } catch {
      // 解析失败时回退为纯文本
      return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
  }

  return { render }
}
