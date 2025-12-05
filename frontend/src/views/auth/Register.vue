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
        name: name.value,
        email: email.value,
        password: password.value,
        role: role.value
    });
    router.push('/dashboard'); // Guard will handle redirection
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
    <p style="margin-top:10px; font-size:0.9em;">
      <router-link to="/login">Back to Login</router-link>
    </p>
  </form>
</template>

<style scoped>
input { display: block; width: 100%; margin-bottom: 10px; padding: 8px; }
button { width: 100%; padding: 10px; background: #10b981; color: white; border: none; cursor: pointer; }
</style>
