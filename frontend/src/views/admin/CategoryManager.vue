<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';

// IMPORT THE SHARED TYPE
import type { Category } from '../../types/Category';

const categories = ref<Category[]>([]);
const newCategoryName = ref('');
const loading = ref(false);

// 1. Fetch Categories on Load
const fetchCategories = async () => {
  try {
    // Axios knows this returns Category[]
    const response = await api.get<Category[]>('/admin/categories');
    categories.value = response.data;
  } catch (error) {
    console.error('Failed to load categories');
  }
};

// 2. Add Category
const addCategory = async () => {
  if (!newCategoryName.value) return;

  try {
    // We expect a single Category back
    const response = await api.post<Category>('/admin/categories', {
      name: newCategoryName.value
    });
    categories.value.push(response.data);
    newCategoryName.value = '';
  } catch (error) {
    alert('Error creating category');
  }
};

// 3. Delete Category
const deleteCategory = async (id: number) => {
  if (!confirm('Are you sure you want to delete this category?')) return;

  try {
    await api.delete(`/admin/categories/${id}`);
    // Remove from UI
    categories.value = categories.value.filter(c => c.id !== id);
  } catch (error) {
    alert('Failed to delete');
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="category-manager">
    <h1>Photo Categories</h1>

    <!-- Add Form -->
    <div class="add-box">
      <input
        v-model="newCategoryName"
        placeholder="e.g., Wedding, Nature..."
        @keyup.enter="addCategory"
      />
      <button @click="addCategory" :disabled="loading">
        {{ loading ? 'Adding...' : 'Add Category' }}
      </button>
    </div>

    <!-- List -->
    <div class="list-container">
      <div v-if="categories.length === 0" class="empty">No categories found.</div>

      <div v-for="cat in categories" :key="cat.id" class="list-item">
        <span class="name">{{ cat.name }}</span>
        <span class="slug">/{{ cat.slug }}</span>
        <button class="delete-btn" @click="deleteCategory(cat.id)">×</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-manager { padding: 20px; max-width: 600px; }
.add-box { display: flex; gap: 10px; margin-bottom: 20px; }
input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
button { padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; }
button:disabled { background: #93c5fd; }

.list-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px; background: white; border-bottom: 1px solid #eee;
}
.name { font-weight: bold; }
.slug { color: #666; font-size: 0.9em; margin-right: auto; margin-left: 10px; }
.delete-btn { background: #ef4444; width: 30px; height: 30px; padding: 0; display: flex; align-items: center; justify-content: center; }
</style>
