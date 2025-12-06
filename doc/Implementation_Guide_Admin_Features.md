# 🛡️ Implementation Guide: Admin Role & Features

This document outlines the standard procedure for adding **Admin** capabilities to the Photo-Sync application.

## Part 1: General Architecture Strategy

To maintain a clean separation of concerns, the Admin role is treated as a distinct domain in both the Backend and Frontend.

### 1. Backend Strategy (Laravel)
*   **Database:** The `role` column in the `users` table will accept the value `'admin'`.
*   **Security (Middleware):** We do not rely solely on frontend hiding. We must create a server-side Middleware (e.g., `EnsureIsAdmin`) to reject API requests from non-admins.
*   **Controllers:** Admin logic should reside in dedicated controllers (e.g., `Admin\UserController.php`) to avoid polluting public controllers.
*   **Routes:** Admin routes should be grouped with a specific prefix (`/api/admin`) and protected by the Admin Middleware.

### 2. Frontend Strategy (Vue.js)
*   **Views:** All admin pages live in `src/views/admin/`.
*   **Components:** Reusable admin widgets (tables, charts) live in `src/components/admin/`.
*   **Routing:**
    *   Routes must have `meta: { role: 'admin' }`.
    *   The `router.beforeEach` guard must be updated to allow access to these routes.
    *   The Login redirect logic must include a case for Admins.

---

## Part 2: Step-by-Step Implementation Example
**Feature:** "User Management Dashboard" (Admin can view all users and delete them).

### Phase A: Backend Implementation

#### Step 1: Create the Admin Middleware
We need a guard to ensure only admins can access these endpoints.

1.  Run the command:
    ```bash
    php artisan make:middleware EnsureIsAdmin
    ```
2.  Edit `app/Http/Middleware/EnsureIsAdmin.php`:
    ```php
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is logged in AND is an admin
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized: Admin access only'], 403);
        }
        return $next($request);
    }
    ```
3.  Register the middleware alias in `bootstrap/app.php` (Laravel 11/12 style):
    ```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureIsAdmin::class,
        ]);
    })
    ```

#### Step 2: Create the Admin Controller
1.  Run the command:
    ```bash
    php artisan make:controller Admin/UserController
    ```
2.  Edit `app/Http/Controllers/Admin/UserController.php`:
    ```php
    namespace App\Http\Controllers\Admin;

    use App\Http\Controllers\Controller;
    use App\Models\User;
    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        public function index()
        {
            // Return all users except the one making the request
            return User::where('id', '!=', auth()->id())->get();
        }

        public function destroy(User $user)
        {
            $user->delete();
            return response()->json(['message' => 'User deleted successfully']);
        }
    }
    ```

#### Step 3: Define Admin Routes
Edit `routes/api.php`:

```php
use App\Http\Controllers\Admin\UserController;

// ... existing routes ...

// Admin Protected Routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
});
```

#### Step 4: Create an Admin User (Seeding)
Since you cannot "Register" as an admin via the public form, you must create one manually via the terminal.

1.  Open `tinker` (Laravel's interactive shell):
    ```bash
    php artisan tinker
    ```
2.  Run this PHP code:
    ```php
    App\Models\User::create([
        'name' => 'Super Admin',
        'email' => 'admin@photo.com',
        'password' => 'admin123', // Model will hash this
        'role' => 'admin'
    ]);
    exit
    ```

---

### Phase B: Frontend Implementation

#### Step 5: Create the Admin Dashboard View
Create `src/views/admin/Dashboard.vue`. This will fetch the list of users from the API we just created.

```html
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api'; // Re-use our configured Axios instance

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const users = ref<User[]>([]);
const loading = ref(false);

const fetchUsers = async () => {
  loading.value = true;
  try {
    // Note the /admin prefix we added in routes/api.php
    const response = await api.get('/admin/users');
    users.value = response.data;
  } catch (e) {
    alert('Failed to load users');
  } finally {
    loading.value = false;
  }
};

const deleteUser = async (id: number) => {
  if(!confirm('Are you sure?')) return;
  try {
    await api.delete(`/admin/users/${id}`);
    users.value = users.value.filter(u => u.id !== id); // Remove from UI
  } catch (e) {
    alert('Failed to delete user');
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="admin-dashboard">
    <h1>Admin Panel</h1>
    <div class="card">
      <h3>User Management</h3>
      <p v-if="loading">Loading...</p>
      <table v-else>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
                <span :class="user.role">{{ user.role }}</span>
            </td>
            <td>
                <button @click="deleteUser(user.id)" class="btn-delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard { padding: 20px; }
table { width: 100%; border-collapse: collapse; margin-top: 15px; }
th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
.client { color: blue; font-weight: bold; }
.photographer { color: green; font-weight: bold; }
.btn-delete { background: red; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; }
</style>
```

#### Step 6: Update Logic for Redirects (Login & Router)

We need to tell the app what to do when an Admin logs in.

**1. Update `src/views/auth/Login.vue`:**
Update the `handleLogin` function to include the admin check.

```typescript
const handleLogin = async () => {
  try {
    await auth.login({ email: email.value, password: password.value });
    
    // REDIRECT LOGIC
    if (auth.user?.role === 'admin') {
        router.push('/admin/dashboard');
    } else if (auth.user?.role === 'photographer') {
        router.push('/photographer/dashboard');
    } else {
        router.push('/client/dashboard');
    }
  } catch (e) {
    error.value = 'Invalid credentials';
  }
};
```

**2. Update `src/router/index.ts`:**
Register the route and update the security guard.

```typescript
// Import the new view
import AdminDashboard from '../views/admin/Dashboard.vue';

// ... Inside routes array ...
{
  path: '/admin/dashboard',
  component: AdminDashboard,
  // Use MainLayout (or create a specific AdminLayout if you prefer)
  meta: { layout: MainLayout, requiresAuth: true, role: 'admin' }
},

// ... Inside router.beforeEach guard ...
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  const isAuthenticated = !!auth.token;

  if (to.meta.requiresAuth && !isAuthenticated) return next('/login');

  // Redirect logged-in users away from Login/Register
  if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
     if (auth.user?.role === 'admin') return next('/admin/dashboard'); // <--- ADD THIS
     if (auth.user?.role === 'photographer') return next('/photographer/dashboard');
     return next('/client/dashboard');
  }

  // Role Protection (Optional but recommended)
  // Ensure a 'client' cannot access '/admin/dashboard'
  if (to.meta.role && auth.user?.role && to.meta.role !== auth.user.role) {
      // If role mismatch, send them to their correct dashboard
      if (auth.user.role === 'admin') return next('/admin/dashboard');
      if (auth.user.role === 'photographer') return next('/photographer/dashboard');
      return next('/client/dashboard');
  }

  next();
});
```

### Phase C: Deployment

1.  **Commit & Push:** Push changes to GitHub.
2.  **Vercel:** Wait for the frontend to redeploy.
3.  **Cloud Shell:** Ensure your server is running.
4.  **Login:** Log in with the `admin@photo.com` credentials you created in Step 4.
