<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';
const auth = useAuthStore();
</script>
<template>
  <div class="photographer-dashboard">
    <h1>Photographer Studio</h1>
    <p>Welcome, {{ auth.user?.name }}.</p>
    <div class="card">
        <h3>My Portfolio</h3>
        <p>Upload tool coming soon...</p>
    </div>
  </div>
</template>
<style scoped>
.card { background: #fffbeb; padding: 20px; border-radius: 8px; margin-top: 20px; }
</style>
