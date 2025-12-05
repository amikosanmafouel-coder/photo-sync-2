<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';
const auth = useAuthStore();
</script>
<template>
  <div class="client-dashboard">
    <h1>Client Dashboard</h1>
    <p>Welcome back, {{ auth.user?.name }}!</p>
    <div class="card">
        <h3>Find Photographers</h3>
        <p>Search mechanism coming soon...</p>
    </div>
  </div>
</template>
<style scoped>
.card { background: #eff6ff; padding: 20px; border-radius: 8px; margin-top: 20px; }
</style>
