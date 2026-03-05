<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const error = ref<string | null>(null)

onMounted(async () => {
  const code = route.query.code as string | undefined
  const queryError = route.query.error as string | undefined

  if (queryError) {
    error.value = `Strava authorization denied: ${queryError}`
    return
  }

  if (!code) {
    error.value = 'No authorization code received'
    return
  }

  try {
    await authStore.handleOAuthCallback(code)
    router.replace({ name: 'this-week' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Authentication failed'
  }
})
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4" class="text-center">
        <template v-if="error">
          <v-icon icon="mdi-alert-circle" size="64" color="error" class="mb-4" />
          <p class="text-h6 mb-4">{{ error }}</p>
          <v-btn to="/login" color="primary" variant="flat">
            Try Again
          </v-btn>
        </template>
        <template v-else>
          <v-progress-circular indeterminate color="primary" size="64" class="mb-4" />
          <p class="text-h6">Connecting to Strava...</p>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>
