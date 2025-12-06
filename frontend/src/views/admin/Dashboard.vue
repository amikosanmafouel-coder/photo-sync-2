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

    <!-- Navigation Menu -->
    <div class="admin-nav">
      <router-link to="/admin/categories" class="nav-card">
        Manage Categories
      </router-link>
      <!-- You can add User Management link here too -->
    </div>

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
.admin-nav { display: flex; gap: 20px; margin-bottom: 30px; }
.nav-card {
  background: #fff; padding: 20px; border-radius: 8px;
  text-decoration: none; color: #333; font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.nav-card:hover { background: #f9fafb; }
table { width: 100%; border-collapse: collapse; margin-top: 15px; }
th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
.client { color: blue; font-weight: bold; }
.photographer { color: green; font-weight: bold; }
.btn-delete { background: red; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; }
</style>
