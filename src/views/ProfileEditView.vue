<template>
  <div class="profile-edit container-md">
    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="form">
      <!-- Alerts -->
      <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>
      <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

      <!-- Avatar Section -->
      <section class="card">
        <h3 class="card-title">头像</h3>
        <div class="avatar-row">
          <PixelAvatar
            v-if="hasPixelAvatar"
            :pixelData="pixelData"
            :level="pixelLevel"
            :size="64"
          />
          <img v-else-if="editInfo.avatar_url"
            :src="editInfo.avatar_url" alt="头像"
            class="avatar-img-fallback"
          />
          <div v-else class="avatar-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--color-text-tertiary)"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <router-link to="/avatar-editor" class="avatar-edit-link">
            {{ hasPixelAvatar ? '编辑像素头像' : '创建像素头像' }}
          </router-link>
        </div>
      </section>

      <!-- Basic Info -->
      <section class="card">
        <h3 class="card-title">基本信息</h3>
        <div class="field">
          <label for="nickname" class="field-label">昵称</label>
          <input id="nickname" v-model="editInfo.nickname" class="field-input" placeholder="你的昵称" />
        </div>
        <div class="field">
          <label for="bio" class="field-label">个人简介</label>
          <textarea id="bio" v-model="editInfo.bio" class="field-input field-textarea"
            placeholder="介绍一下自己..." maxlength="500" rows="3"></textarea>
          <span class="field-hint">{{ (editInfo.bio || '').length }}/500</span>
        </div>
        <div class="field">
          <label for="email" class="field-label">邮箱</label>
          <input id="email" v-model="editInfo.email" class="field-input" placeholder="your@email.com" disabled />
          <span class="field-hint">邮箱暂不支持修改</span>
        </div>
      </section>

      <!-- Contact -->
      <section class="card">
        <h3 class="card-title">联系方式</h3>
        <div class="field">
          <label for="phone" class="field-label">手机号</label>
          <input id="phone" v-model="editInfo.phone" class="field-input" placeholder="选填" />
        </div>
        <div class="field">
          <label for="location" class="field-label">所在地</label>
          <input id="location" v-model="editInfo.location" class="field-input" placeholder="选填" />
        </div>
        <div class="field">
          <label for="website" class="field-label">个人网站</label>
          <input id="website" v-model="editInfo.website" class="field-input" placeholder="选填" />
        </div>
      </section>

      <!-- Submit -->
      <button type="submit" class="btn-save" :disabled="!hasChanges || saving">
        {{ saving ? '保存中...' : hasChanges ? '保存修改' : '无变更' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserProfile } from '../composables/useUserProfile'
import { fetchWithRefresh } from '../api/http'
import PixelAvatar from '../components/PixelAvatar.vue'

const router = useRouter()
const { userInfo, updateUserInfo } = useUserProfile()

const loading = ref(true)
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Pixel avatar
const pixelData = ref('')
const pixelLevel = ref(16)
const hasPixelAvatar = ref(false)

const editInfo = reactive({
  nickname: '',
  email: '',
  bio: '',
  phone: '',
  location: '',
  website: '',
  avatar_url: '',
})

const originalJson = ref('')

const hasChanges = computed(() => JSON.stringify(editInfo) !== originalJson.value)

async function loadPixelAvatar() {
  try {
    const res = await fetchWithRefresh('/avatars', { method: 'GET' })
    if (res.ok) {
      const data = await res.json()
      if (data?.success && data.data?.avatar) {
        pixelData.value = data.data.avatar.pixelData
        pixelLevel.value = data.data.avatar.level
        hasPixelAvatar.value = true
      }
    }
  } catch { /* no avatar yet */ }
}

onMounted(async () => {
  try {
    await useUserProfile().loadUserInfo()
    const u = userInfo.value
    if (u) {
      editInfo.nickname = u.nickname || ''
      editInfo.email = u.email || ''
      editInfo.bio = u.bio || ''
      editInfo.phone = u.phone || ''
      editInfo.location = u.location || ''
      editInfo.website = u.website || ''
      editInfo.avatar_url = u.avatar_url || ''
      originalJson.value = JSON.stringify(editInfo)
    }
    await loadPixelAvatar()
  } catch (err: any) {
    errorMsg.value = '加载用户信息失败: ' + err.message
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  if (!hasChanges.value) return
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res = await fetchWithRefresh('/auth/update-user-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editInfo),
    })
    const data = await res.json()
    if (data?.success) {
      originalJson.value = JSON.stringify(editInfo)
      successMsg.value = '保存成功'
      setTimeout(() => router.push('/profile'), 800)
    } else {
      throw new Error(data.message || '保存失败')
    }
  } catch (err: any) {
    errorMsg.value = err.message || '保存失败'
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.profile-edit { padding: var(--space-5) var(--space-4); }

// ── Loading ─────────────────────────────────────────────────
.loading { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-3);
  p { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
}
.loading-spinner {
  width: 32px; height: 32px; border: 3px solid var(--color-border);
  border-top-color: var(--color-accent); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

// ── Form ────────────────────────────────────────────────────
.form { display: flex; flex-direction: column; gap: var(--space-4); }

// ── Alerts ──────────────────────────────────────────────────
.alert {
  padding: var(--space-3) var(--space-4); border-radius: var(--radius-md);
  font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
}
.alert-error { background: var(--color-danger-light); color: var(--color-danger); }
.alert-success { background: var(--color-success-light); color: var(--color-success); }

// ── Card ────────────────────────────────────────────────────
.card {
  background: var(--color-bg); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: var(--space-5);
}
.card-title {
  font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary); text-transform: uppercase;
  letter-spacing: 0.5px; margin-bottom: var(--space-4);
}

// ── Avatar Row ──────────────────────────────────────────────
.avatar-row {
  display: flex; align-items: center; gap: var(--space-4);
}
.avatar-img-fallback { width: 64px; height: 64px; border-radius: var(--radius-xl); object-fit: cover; }
.avatar-empty {
  width: 64px; height: 64px; border-radius: var(--radius-xl);
  background: var(--color-bg-tertiary); display: flex;
  align-items: center; justify-content: center;
}
.avatar-edit-link {
  font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
  &:hover { color: var(--color-accent-hover); }
}

// ── Fields ──────────────────────────────────────────────────
.field { margin-bottom: var(--space-4);
  &:last-child { margin-bottom: 0; }
}
.field-label {
  display: block; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
  color: var(--color-text); margin-bottom: var(--space-2);
}
.field-input {
  width: 100%; padding: var(--space-3) var(--space-3);
  background: var(--color-bg-secondary); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); font-size: var(--font-size-base);
  color: var(--color-text); transition: border-color var(--transition-fast);
  &:focus { border-color: var(--color-accent); background: var(--color-bg); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.field-textarea { resize: vertical; }
.field-hint {
  display: block; font-size: var(--font-size-xs); color: var(--color-text-tertiary);
  margin-top: var(--space-1);
}

// ── Save ────────────────────────────────────────────────────
.btn-save {
  width: 100%; padding: var(--space-3) var(--space-4);
  background: var(--color-accent); color: #fff;
  font-size: var(--font-size-base); font-weight: var(--font-weight-semibold);
  border: none; border-radius: var(--radius-md); cursor: pointer;
  transition: all var(--transition-fast);
  &:hover:not(:disabled) { background: var(--color-accent-hover); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}
</style>
