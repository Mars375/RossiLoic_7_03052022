import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// Import Vue components
import Home from '../../views/Home.vue';
import Reset from '../../views/Reset.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/reset/:token', name: 'Reset', component: Reset }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

async function checkAuth() {
  const store = useAuthStore();
  const API_URL = "https://groupomania-back.onrender.com";
  try {
    const response = await axios.get(`${API_URL}/auth/check-auth`, { withCredentials: true });
    if (response.status === 200) {
      store.isLoggedIn = true;
      store.user = response.data.user;
      console.log("You're now logged in");
    }
  } catch (error) {
    store.isLoggedIn = false;
    localStorage.removeItem('user');
    console.log("You're not logged in");
  }
}

router.beforeEach(async (to, from, next) => {
  await checkAuth();
  next();
});

export default router;