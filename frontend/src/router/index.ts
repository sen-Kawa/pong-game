import { createWebHistory, createRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: { name: 'home' } },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('../views/Game.vue')
    },
    {
      path: '/leader',
      name: 'leader',
      component: () => import('../views/Leader.vue')
    },
    {
      path: '/user/preference',
      name: 'preference',
      meta: { requiredAuth: true },
      component: () => import('../components/user/Preference.vue')
    },
    {
      path: '/user/profile',
      name: 'profile',
      component: () => import('../components/user/Profile.vue')
    },
    {
      path: '/user/matchhistory',
      name: 'matchhistory',
      component: () => import('../components/user/MatchHistory.vue')
    },
    {
      path: '/user/2fa',
      name: '2fa',
      component: () => import('../components/user/2fa.vue')
    },
    {
      path: '/user/success',
      name: 'Success',
      component: () => import('../components/user/LoggedIn.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) next('/')
  next()
})
export default router
