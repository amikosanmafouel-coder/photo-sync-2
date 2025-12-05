<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<template>
  <!-- This is like your base_dashboard.html.twig -->
  <div class="main-layout">
    <header>
      <div class="logo">Photo-Sync</div>
      <div class="user-info" v-if="auth.user">
         <span>{{ auth.user.name }} ({{ auth.user.role }})</span>
         <button @click="handleLogout">Logout</button>
      </div>
    </header>

    <main>
      <!-- Page content goes here -->
      <slot />
    </main>
  </div>
</template>

<style scoped>
header {
  background: #333;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
main { padding: 2rem; }
button {
  background: #e11d48;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  margin-left: 10px;
}
</style>
