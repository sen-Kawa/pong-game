import { createWebHistory, createRouter } from "vue-router";

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
			path: '/user/:user',
			name: 'user',
			component: () => import('../views/User.vue')
		},
		{
			path: '/user/Preference',
			name: 'preference',
			component: () => import('../components/user/Preference.vue')
		},
		{
			path: '/user/Profile',
			name: 'profile',
			component: () => import('../components/user/Profile.vue')
		},
		{
			path: '/user/Matchhistory',
			name: 'matchhistory',
			component: () => import('../components/user/Matchhistory.vue')
		},
	]
  })

export default router