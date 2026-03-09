import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/oauth/callback',
      name: 'oauth-callback',
      component: () => import('@/views/OAuthCallbackView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/this-week',
        },
        {
          path: 'this-week',
          name: 'this-week',
          component: () => import('@/views/ThisWeekView.vue'),
        },
        {
          path: 'this-month',
          name: 'this-month',
          component: () => import('@/views/ThisMonthView.vue'),
        },
        {
          path: 'weekly-comparison',
          name: 'weekly-comparison',
          component: () => import('@/views/WeeklyComparisonView.vue'),
        },
        {
          path: 'personal-records',
          name: 'personal-records',
          component: () => import('@/views/PersonalRecordsView.vue'),
        },
        {
          path: 'pace-chart',
          name: 'pace-chart',
          component: () => import('@/views/PaceChartView.vue'),
        },
        {
          path: 'distance-chart',
          name: 'distance-chart',
          component: () => import('@/views/DistanceChartView.vue'),
        },
        {
          path: 'insights',
          name: 'insights',
          component: () => import('@/views/InsightsView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'this-week' }
  }
})

export { router }
