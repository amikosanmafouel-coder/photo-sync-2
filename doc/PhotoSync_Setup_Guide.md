Here is the complete, step-by-step documentation for building the **Photo-Sync** application. This guide incorporates all the best practices and fixes we implemented, ensuring a smooth setup for anyone replicating the project.

---

# Photo-Sync: Project Documentation & Setup Guide

**Project Overview:** A platform connecting Clients with Photographers.
**Tech Stack:**
*   **Backend:** Laravel 12 (Hosted on Google Cloud Shell)
*   **Database:** PostgreSQL (Hosted on Neon.tech)
*   **Frontend:** Vue.js 3 + TypeScript (Hosted on Vercel)
*   **Tunneling:** Ngrok (To expose Cloud Shell to the public)

---

## Prerequisites
Ensure you have accounts with:
1.  **Google Cloud Platform** (for Cloud Shell).
2.  **Neon.tech** (for the database).
3.  **GitHub** (for version control).
4.  **Vercel** (for frontend hosting).
5.  **Ngrok** (for tunneling).

---

## Part 1: Backend Environment Setup (Google Cloud Shell)

Google Cloud Shell is ephemeral (it resets system files on restart). We must configure it to persist the PHP PostgreSQL driver.

### 1.1 Persistent Driver Installation
Run this immediately upon opening Cloud Shell to create a startup script:

```bash
# Create the script
cat << 'EOF' > ~/.customize_environment
#!/bin/sh
apt-get update
apt-get install -y php-pgsql
EOF

# Make executable and run
chmod +x ~/.customize_environment
sudo ./customize_environment
```

### 1.2 Install Laravel
Create the project in your home directory:

```bash
composer create-project laravel/laravel photo-sync
cd photo-sync
```

### 1.3 Configure Database (Neon)
1.  Get your connection string from the **Neon Console**.
2.  Edit `.env`:
    ```bash
    nano .env
    ```
3.  Update the database section:
    ```ini
    DB_CONNECTION=pgsql
    DB_HOST=ep-your-endpoint.us-east-2.aws.neon.tech
    DB_PORT=5432
    DB_DATABASE=neondb
    DB_USERNAME=neondb_owner
    DB_PASSWORD=your_neon_password
    ```
4.  Run migrations to verify connection:
    ```bash
    php artisan migrate
    ```

---

## Part 2: Backend Logic & Authentication

We implement role-based authentication (Client vs. Photographer).

### 2.1 API & CORS Setup
Laravel 12 requires explicit API installation.

1.  **Install API:**
    ```bash
    php artisan install:api
    ```
2.  **Publish CORS Config:**
    ```bash
    php artisan config:publish cors
    ```
3.  **Edit `config/cors.php`:**
    To allow development (Cloud Shell preview) and Production (Vercel), allow all origins:
    ```php
    'allowed_origins' => ['*'],
    ```

### 2.2 Database Roles
1.  **Create Migration:**
    ```bash
    php artisan make:migration add_role_to_users_table --table=users
    ```
2.  **Edit the Migration File:**
    ```php
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('client'); // 'client' or 'photographer'
        });
    }
    ```
3.  **Migrate:** `php artisan migrate`

### 2.3 User Model Update
Edit `app/Models/User.php`:
1.  Add `use Laravel\Sanctum\HasApiTokens;`
2.  Add `HasApiTokens` to the class traits.
3.  Add `'role'` to the `$fillable` array.

### 2.4 Auth Controller
Create `app/Http/Controllers/AuthController.php` handling Login, Register, and Logout.
*   **Register:** Creates user, assigns role, returns token.
*   **Login:** Validates credentials, returns token.
*   **Logout:** Deletes token.

### 2.5 API Routes
Edit `routes/api.php`:
```php
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
```

---

## Part 3: Exposing the Backend (Ngrok)

Since Cloud Shell is private, we use Ngrok to allow Vercel to access the API.

### 3.1 Permanent Installation
Install Ngrok in the Home directory (`~`) so it persists.

```bash
cd ~
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
rm ngrok-v3-stable-linux-amd64.tgz
chmod +x ngrok
```

### 3.2 Authenticate & Run
1.  Get your Authtoken from [dashboard.ngrok.com](https://dashboard.ngrok.com).
2.  Run: `./ngrok config add-authtoken YOUR_TOKEN`
3.  **Start Tunnel:**
    ```bash
    ~/ngrok http 8000
    ```
4.  Copy the URL (e.g., `https://your-app.ngrok-free.app`).

---

## Part 4: Frontend Architecture (Vue.js + TypeScript)

We use a Monorepo structure (Frontend folder inside Laravel root).

### 4.1 Initialization
```bash
cd ~/photo-sync
npm create vite@latest frontend -- --template vue-ts
cd frontend
npm install vue-router pinia axios
```

### 4.2 Folder Structure
Create these folders inside `src/`:
*   `layouts/` (AuthLayout, MainLayout)
*   `views/` (auth, client, photographer)
*   `stores/` (Pinia state)
*   `services/` (Axios config)
*   `router/` (Routing logic)

### 4.3 API Service (`src/services/api.ts`)
Configured to handle Ngrok headers and Bearer tokens automatically.

```typescript
import axios from 'axios';
const API_URL = 'https://YOUR-NGROK-URL.ngrok-free.app/api'; 

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true' // Bypasses Ngrok landing page
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
export default api;
```

### 4.4 State Management (`src/stores/auth.ts`)
Uses Pinia to manage User and Token. Includes a `fetchUser()` action to persist login state on page refresh.

### 4.5 Router (`src/router/index.ts`)
*   Uses `meta: { layout: ... }` to switch between Layouts.
*   Includes **Navigation Guards** to:
    1.  Protect dashboard routes.
    2.  Redirect logged-in users away from Login.
    3.  Direct users to the correct dashboard based on Role.
*   **Fix:** Uses `_from` to avoid TypeScript "unused variable" errors during build.

### 4.6 Vercel Configuration (`vercel.json`)
Required to fix 404 errors on refresh (SPA Routing).
Create `frontend/vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Part 4.5: Frontend Implementation Details

This section contains the exact code needed for the Vue components to handle the Logic, Layouts, and Dashboards correctly.

### 1. State Management (Pinia Store)
This file handles the communication with the backend and keeps the user logged in when the page refreshes.

**File:** `src/stores/auth.ts`
```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any>(null);
    const token = ref<string | null>(localStorage.getItem('token'));

    // Helper to update state
    function setAuth(newToken: string, newUser: any) {
        token.value = newToken;
        user.value = newUser;
        localStorage.setItem('token', newToken);
    }

    // Helper to clear state
    function clearAuth() {
        user.value = null;
        token.value = null;
        localStorage.removeItem('token');
    }

    async function login(credentials: any) {
        const response = await api.post('/login', credentials);
        setAuth(response.data.access_token, response.data.user);
    }

    async function register(userData: any) {
        const response = await api.post('/register', userData);
        setAuth(response.data.access_token, response.data.user);
    }

    async function logout() {
        try {
            await api.post('/logout'); // Tell backend to delete token
        } catch (e) {
            // Ignore error if already logged out
        } finally {
            clearAuth(); // Always clear frontend state
        }
    }

    // Critical: Restores User Session on Page Refresh
    async function fetchUser() {
        if (!token.value) return;
        try {
            const response = await api.get('/user');
            user.value = response.data;
        } catch (error) {
            clearAuth(); // Token invalid? Log them out.
        }
    }

    return { user, token, login, register, logout, fetchUser };
});
```

---

### 2. Layouts
We use two layouts to distinguish between public pages (Login/Register) and private pages (Dashboards).

**File:** `src/layouts/AuthLayout.vue` (Simple centered box)
```html
<template>
  <div class="auth-layout">
    <div class="auth-box">
      <h2>Photo-Sync</h2>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; background-color: #f3f4f6;
}
.auth-box {
  background: white; padding: 2rem; border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px;
  text-align: center;
}
</style>
```

**File:** `src/layouts/MainLayout.vue` (Contains Navbar & Logout Logic)
```html
<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

// Async logout to prevent race conditions
const handleLogout = async () => {
  await auth.logout();
  router.push('/login');
};
</script>

<template>
  <div class="main-layout">
    <header>
      <div class="logo">Photo-Sync</div>
      <div class="user-info" v-if="auth.user">
         <span>{{ auth.user.name }} ({{ auth.user.role }})</span>
         <button @click="handleLogout">Logout</button>
      </div>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped>
header {
  background: #333; color: white; padding: 1rem 2rem;
  display: flex; justify-content: space-between; align-items: center;
}
main { padding: 2rem; }
button {
  background: #e11d48; color: white; border: none; padding: 0.5rem 1rem;
  cursor: pointer; border-radius: 4px; margin-left: 10px;
}
</style>
```

---

### 3. Authentication Views
These views handle the user input and redirection.

**File:** `src/views/auth/Login.vue`
*Note: We check the role immediately after login to redirect to the correct dashboard.*
```html
<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');

const handleLogin = async () => {
  try {
    await auth.login({ email: email.value, password: password.value });
    
    // Explicit Redirect based on Role
    if (auth.user?.role === 'photographer') {
        router.push('/photographer/dashboard');
    } else {
        router.push('/client/dashboard');
    }
  } catch (e) {
    error.value = 'Invalid credentials';
  }
};
</script>

<template>
  <form @submit.prevent="handleLogin">
    <h3>Login</h3>
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button type="submit">Sign In</button>
    <p v-if="error" style="color: red">{{ error }}</p>
    <p style="margin-top:10px; font-size:0.9em;">
      No account? <router-link to="/register">Register</router-link>
    </p>
  </form>
</template>

<style scoped>
input { display: block; width: 100%; margin-bottom: 10px; padding: 8px; }
button { width: 100%; padding: 10px; background: #2563eb; color: white; border: none; cursor: pointer; }
</style>
```

**File:** `src/views/auth/Register.vue`
```html
<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('client'); 

const handleRegister = async () => {
  try {
    await auth.register({ 
        name: name.value, email: email.value, 
        password: password.value, role: role.value 
    });
    // Explicit Redirect
    if (role.value === 'photographer') router.push('/photographer/dashboard');
    else router.push('/client/dashboard');
  } catch (e) {
    alert('Registration failed');
  }
};
</script>

<template>
  <form @submit.prevent="handleRegister">
    <h3>Create Account</h3>
    <input v-model="name" type="text" placeholder="Full Name" required />
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    
    <label>I am a:</label>
    <select v-model="role" style="display:block; width:100%; margin:10px 0; padding:8px;">
        <option value="client">Client</option>
        <option value="photographer">Photographer</option>
    </select>

    <button type="submit">Register</button>
    <p style="margin-top:10px;">
      <router-link to="/login">Back to Login</router-link>
    </p>
  </form>
</template>
```

---

### 4. Dashboard Views
Separate views for clean separation of concerns.

**File:** `src/views/client/Dashboard.vue`
```html
<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';
const auth = useAuthStore();
</script>
<template>
  <div>
    <h1>Client Dashboard</h1>
    <p>Welcome back, {{ auth.user?.name }}!</p>
    <div style="background: #eff6ff; padding: 20px; border-radius: 8px;">
        <h3>Find Photographers</h3>
        <p>Search functionality goes here...</p>
    </div>
  </div>
</template>
```

**File:** `src/views/photographer/Dashboard.vue`
```html
<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';
const auth = useAuthStore();
</script>
<template>
  <div>
    <h1>Photographer Studio</h1>
    <p>Welcome back, {{ auth.user?.name }}.</p>
    <div style="background: #fffbeb; padding: 20px; border-radius: 8px;">
        <h3>My Portfolio</h3>
        <p>Upload functionality goes here...</p>
    </div>
  </div>
</template>
```

---

### 5. Routing & App Entry (The Wiring)
This connects everything and handles security checks.

**File:** `src/router/index.ts`
```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AuthLayout from '../layouts/AuthLayout.vue';
import MainLayout from '../layouts/MainLayout.vue';
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import ClientDashboard from '../views/client/Dashboard.vue';
import PhotographerDashboard from '../views/photographer/Dashboard.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login, meta: { layout: AuthLayout } },
    { path: '/register', component: Register, meta: { layout: AuthLayout } },
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
    // Generic fallback
    { path: '/dashboard', redirect: () => '/login' }
  ]
});

// Security Guard
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  const isAuthenticated = !!auth.token;

  // 1. Block unauthenticated users
  if (to.meta.requiresAuth && !isAuthenticated) return next('/login');

  // 2. Redirect logged-in users away from Login
  if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
     if (auth.user?.role === 'photographer') return next('/photographer/dashboard');
     return next('/client/dashboard');
  }
  
  next();
});

export default router;
```

**File:** `src/App.vue`
This file initializes the user session on app load.

```html
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import MainLayout from './layouts/MainLayout.vue'; 

const route = useRoute();
const auth = useAuthStore();

// Try to fetch the user as soon as the app loads (Page Refresh)
onMounted(() => {
  auth.fetchUser();
});

const layout = computed(() => {
  return route.meta.layout || MainLayout;
});
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
```

---

## Part 5: Deployment & Workflow

### 5.1 Push to GitHub
1.  Initialize Git in project root.
2.  Use `gh auth login` for easy authentication in Cloud Shell.
3.  Push code to GitHub.

### 5.2 Deploy to Vercel
1.  Import repository from GitHub.
2.  **Crucial:** Set "Root Directory" to `frontend`.
3.  Deploy.

### 5.3 Daily Startup Routine
Since Cloud Shell sleeps, follow this routine every time you start coding:

1.  **Terminal 1 (Backend):**
    ```bash
    cd ~/photo-sync
    php artisan serve --port=8000
    ```
2.  **Terminal 2 (Tunnel):**
    ```bash
    ~/ngrok http 8000
    ```
    *Check if the Ngrok URL changed. If it did, update `frontend/src/services/api.ts` and push to GitHub.*
3.  **Terminal 3 (Frontend - Optional for Local Dev):**
    ```bash
    cd ~/photo-sync/frontend
    npm run dev -- --host
    ```

### 5.4 Accessing the App
*   **Production:** Go to `https://photo-sync-2.vercel.app`
*   **Credentials:** Log in as Client or Photographer to see the specific dashboards.
