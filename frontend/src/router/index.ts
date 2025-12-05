import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Import Layouts
import AuthLayout from '../layouts/AuthLayout.vue';
import MainLayout from '../layouts/MainLayout.vue';

// Import Views
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import ClientDashboard from '../views/client/Dashboard.vue';
import PhotographerDashboard from '../views/photographer/Dashboard.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login,
      meta: { layout: AuthLayout }
    },
    {
      path: '/register',
      component: Register,
      meta: { layout: AuthLayout }
    },
    // Role Specific Routes
    {
      path: '/client/dashboard',
      component: ClientDashboard,
      meta: { layout: MainLayout, requiresAuth: true, role: 'client' }
    },
    {
      path: '/photographer/dashboard',
      component: PhotographerDashboard,
      meta: { layout: MainLayout, requiresAuth: true, role: 'photographer' }
    },
    // Fallback for generic /dashboard access
    {
      path: '/dashboard',
      redirect: () => {
         // We will handle this in the "beforeEach" guard below
         return '/login';
      }
    }
  ]
});

// Navigation Guard (Security & Redirection)
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  const isAuthenticated = !!auth.token;

  // 1. Redirect to Login if not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  // 2. Redirect logged-in users away from Login/Register
  if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
     if (auth.user?.role === 'photographer') return next('/photographer/dashboard');
     return next('/client/dashboard');
  }

  // 3. Handle generic "/dashboard" access
  if (to.path === '/dashboard' && isAuthenticated) {
     if (auth.user?.role === 'photographer') return next('/photographer/dashboard');
     return next('/client/dashboard');
  }

  next();
});

export default router;
