<script setup lang="ts">
import { computed, onMounted } from 'vue'; // Import onMounted
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth'; // Import Store
import MainLayout from './layouts/MainLayout.vue';

const route = useRoute();
const auth = useAuthStore(); // Use Store

// When App starts, try to get the user details using the token
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
