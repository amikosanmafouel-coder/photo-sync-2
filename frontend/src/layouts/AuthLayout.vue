<template>
  <!-- This is like your base_auth.html.twig -->
  <div class="auth-layout">
    <div class="auth-box">
      <h2>Photo-Sync</h2>
      <!-- <slot /> is equivalent to {% block body %} -->
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f4f6;
}
.auth-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}
h2 { margin-bottom: 1.5rem; color: #333; }
</style>
