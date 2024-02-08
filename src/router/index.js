import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GeneralView from '../views/GeneralView.vue'
import ChangelogView from '../views/ChangelogView.vue'
import BookmarksView from '../views/BookmarksView.vue'

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: GeneralView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/general',
      name: 'general',
      component: GeneralView
    },
    {
      path: '/changelog',
      name: 'changelog',
      component: ChangelogView
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: BookmarksView
    }
  ]
})

export default router
