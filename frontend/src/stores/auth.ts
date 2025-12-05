import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any>(null);
    const token = ref<string | null>(localStorage.getItem('token'));

    async function login(credentials: any) {
        const response = await api.post('/login', credentials);
        token.value = response.data.access_token;
        user.value = response.data.user;

        // Save to local storage so we stay logged in on refresh
        if (token.value) {
            localStorage.setItem('token', token.value);
        }
    }

    async function register(userData: any) {
        const response = await api.post('/register', userData);
        token.value = response.data.access_token;
        user.value = response.data.user;

        if (token.value) {
            localStorage.setItem('token', token.value);
        }
    }

    function logout() {
        // Try to notify backend, but clear local state regardless
        api.post('/logout').catch(() => {});
        user.value = null;
        token.value = null;
        localStorage.removeItem('token');
    }

    return { user, token, login, register, logout };
});
