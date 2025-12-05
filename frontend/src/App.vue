<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';
// ^ Default fallback if needed, though router usually handles it.

const route = useRoute();

// Dynamically choose layout based on route meta, default to 'div' if none found
const layout = computed(() => {
  return route.meta.layout || MainLayout;
});
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
