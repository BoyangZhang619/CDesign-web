<template>
  <div
    class="pixel-avatar"
    :style="{
      width: size + 'px',
      height: size + 'px',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      display: 'inline-grid',
      gridTemplateColumns: `repeat(${level}, 1fr)`,
      gridTemplateRows: `repeat(${level}, 1fr)`,
      border: '2px solid var(--color-border)',
      background: 'var(--color-bg-tertiary)',
      imageRendering: 'pixelated',
    }"
  >
    <span
      v-for="(color, i) in colors"
      :key="i"
      :style="{ background: color === 'transparent' ? 'transparent' : color }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const PALETTE: Record<string, string> = {
  '0': 'transparent', '1': '#262626', '2': '#FFFFFF', '3': '#0095F6',
  '4': '#ED4956', '5': '#78C850', '6': '#F7B955', '7': '#833AB4',
  '8': '#F58529', '9': '#DD2A7B', 'A': '#405DE6', 'B': '#5851DB',
  'C': '#FD1D1D', 'D': '#F77737', 'E': '#F5F5F5', 'F': '#8E8E8E',
}

const props = withDefaults(defineProps<{
  pixelData: string
  level: number
  size?: number
}>(), { size: 80 })

const colors = computed(() => {
  const result: string[] = []
  for (let i = 0; i < props.level * props.level; i++) {
    const ch = (props.pixelData[i] || '0').toUpperCase()
    result.push(PALETTE[ch] || 'transparent')
  }
  return result
})
</script>
