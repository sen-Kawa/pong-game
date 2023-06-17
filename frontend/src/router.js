import HomeComponent from '@/views/Home';
import EditComponent from '@/components/user/Edit';
import { createWebHistory, createRouter } from "vue-router";

const router = new createRouter({
	history: createWebHistory(),
	routes: [
	  { path: '/', redirect: { name: 'home' } },
	  { path: '/home', name: 'home', component: HomeComponent },
	  { path: '/edit/:id', name: 'Edit', component: EditComponent },
	]
  })

export default router