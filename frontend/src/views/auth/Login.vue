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
    // The router guard in index.ts will redirect /dashboard to the correct role page
    router.push('/dashboard');
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
