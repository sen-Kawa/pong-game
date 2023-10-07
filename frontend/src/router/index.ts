import { Scope } from '@/stores/match'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: { name: 'home' } },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue')
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('../views/GameView.vue')
    },
    {
      path: '/leader',
      name: 'leader',
      component: () => import('../views/LeaderView.vue')
    },
    {
      path: '/user/Preference',
      name: 'preference',
      meta: { requiredAuth: true },
      component: () => import('../components/user/PreferenceComp.vue')
    },
    {
      path: '/user/Profile',
      name: 'profile',
      component: () => import('../components/user/ProfileComp.vue')
    },
    {
      path: '/user/Matchhistory',
      name: 'matchhistory',
      component: () => import('../components/user/MatchHistory.vue'),
      props: { initialScope: Scope.personal }
    },
    {
      path: '/user/Friends',
      name: 'friends',
      component: () => import('../components/user/friends/FriendsList.vue')
    },
    {
      path: '/user/2fa',
      name: '2fa',
      component: () => import('../components/user/Validate2FA.vue')
    },
    {
      path: '/user/firsttime',
      name: 'firsttime',
      component: () => import('../components/user/FirstTime.vue')
    },
    {
      path: '/game/queue',
      name: 'queue',
      component: () => import('../components/match/WaitingRoom.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) next('/')
  next()
})
export default router
