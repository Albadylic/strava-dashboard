<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import AthleteAvatar from '@/components/AthleteAvatar.vue'

const authStore = useAuthStore()
const drawer = ref(true)

const navItems = [
  { title: 'This Week', to: '/this-week', icon: 'mdi-calendar-week' },
  { title: 'This Month', to: '/this-month', icon: 'mdi-calendar-month' },
  { title: 'Weekly Comparison', to: '/weekly-comparison', icon: 'mdi-chart-timeline-variant' },
  { title: 'Personal Records', to: '/personal-records', icon: 'mdi-trophy' },
  { title: 'Pace Chart', to: '/pace-chart', icon: 'mdi-speedometer' },
  { title: 'Distance Chart', to: '/distance-chart', icon: 'mdi-map-marker-distance' },
]

function logout() {
  authStore.logout()
}
</script>

<template>
  <v-navigation-drawer v-model="drawer" app>
    <v-list-item class="pa-4">
      <template #prepend>
        <AthleteAvatar :athlete="authStore.athlete" :size="40" />
      </template>
      <v-list-item-title class="font-weight-bold">
        {{ authStore.athlete?.firstname }} {{ authStore.athlete?.lastname }}
      </v-list-item-title>
      <v-list-item-subtitle>Strava Dashboard</v-list-item-subtitle>
    </v-list-item>

    <v-divider />

    <v-list nav density="comfortable">
      <v-list-item
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        rounded="lg"
        class="mx-2"
      />
    </v-list>

    <template #append>
      <div class="pa-4">
        <v-btn
          block
          variant="outlined"
          color="error"
          prepend-icon="mdi-logout"
          @click="logout"
        >
          Logout
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <v-app-bar app elevation="0" color="surface">
    <v-app-bar-nav-icon @click="drawer = !drawer" />
    <v-app-bar-title>
      <v-icon icon="mdi-run" color="primary" class="mr-2" />
      Strava Dashboard
    </v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-container fluid class="pa-6">
      <router-view />
    </v-container>
  </v-main>
</template>
