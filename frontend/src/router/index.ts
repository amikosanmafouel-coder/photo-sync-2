import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Layouts
import AuthLayout from '../layouts/AuthLayout.vue';
import MainLayout from '../layouts/MainLayout.vue';

// Views
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import ClientDashboard from '../views/client/Dashboard.vue';
import PhotographerDashboard from '../views/photographer/Dashboard.vue';
import AdminDashboard from '../views/admin/Dashboard.vue';
import CategoryManager from '../views/admin/CategoryManager.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },

    // AUTH ROUTES
    { path: '/login', component: Login, meta: { layout: AuthLayout } },
    { path: '/register', component: Register, meta: { layout: AuthLayout } },

    // CLIENT ROUTES
    {
      path: '/client/dashboard',
      component: ClientDashboard,
      meta: { layout: MainLayout, requiresAuth: true, role: 'client' }
    },

    // PHOTOGRAPHER ROUTES
    {
      path: '/photographer/dashboard',
      component: PhotographerDashboard,
      meta: { layout: MainLayout, requiresAuth: true, role: 'photographer' }
    },

    // ADMIN ROUTES
    {
      path: '/admin/dashboard',
      component: AdminDashboard,
      meta: { layout: MainLayout, requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/categories',
        component: CategoryManager,
        meta: {
            layout: MainLayout,
            requiresAuth: true,
            role: 'admin'
        }
    },

    // Fallback
    { path: '/dashboard', redirect: () => '/login' }
  ]
});

// --- STRICT ROLE PROTECTION GUARD ---
router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();

  // 1. DATA INTEGRITY CHECK (On Page Refresh)
  // If we have a token but no user data, wait to fetch it before deciding navigation
  if (auth.token && !auth.user) {
      await auth.fetchUser();
  }

  const isAuthenticated = !!auth.token;

  // 2. UNAUTHENTICATED BLOCK
  // If route requires auth and user is not logged in -> Login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  // 3. ALREADY LOGGED IN REDIRECT
  // If user is logged in but tries to go to Login/Register -> Send to their Dashboard
  if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
     const userRole = auth.user?.role;
     return next(`/${userRole}/dashboard`);
  }

  // 4. STRICT ROLE ENFORCEMENT
  // If the route has a specific role assigned (e.g. 'admin')
  if (to.meta.role) {
       // If the user's role does not match the route's required role
       if (auth.user && auth.user.role !== to.meta.role) {
           // DENY ACCESS: Redirect them to THEIR correct dashboard
            return next(`/${auth.user.role}/dashboard`);
       }
  }

  // 5. Allow navigation
  next();
});

export default router;
