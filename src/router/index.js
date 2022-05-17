import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from "../stores/auth";

// Import Vue components
import Home from '../../views/Home.vue'
import Reset from '../../views/Reset.vue'


const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/reset/:token', name: 'Reset', component: Reset }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  // ...
  const store = useAuthStore();
  if (document.cookie) {
    if (!!document.cookie.split(';').find((cookie) => cookie.startsWith('jwt='))) {
      store.isLoggedIn = true
      console.log("You're now log")
    }
    else {
      store.isLoggedIn = false
      localStorage.removeItem('user')
      console.log("You're not log")
    }
  }
  // explicitly return false to cancel the navigation
  next()
})

export default router
