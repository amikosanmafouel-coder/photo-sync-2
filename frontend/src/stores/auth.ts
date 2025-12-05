import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any>(null);
    const token = ref<string | null>(localStorage.getItem('token'));

    // Helper to set state
    function setAuth(newToken: string, newUser: any) {
        token.value = newToken;
        user.value = newUser;
        localStorage.setItem('token', newToken);
    }

    // Clear state
    function clearAuth() {
        user.value = null;
        token.value = null;
        localStorage.removeItem('token');
    }

    async function login(credentials: any) {
        const response = await api.post('/login', credentials);
        setAuth(response.data.access_token, response.data.user);
    }

    async function register(userData: any) {
        const response = await api.post('/register', userData);
        setAuth(response.data.access_token, response.data.user);
    }

    async function logout() {
        try {
            await api.post('/logout');
        } catch (e) {
            // Ignore errors on logout (e.g. token already expired)
        } finally {
            clearAuth();
        }
    }

    // NEW: Fetch user if we have a token but no user data
    async function fetchUser() {
        if (!token.value) return;
        try {
            const response = await api.get('/user');
            user.value = response.data;
        } catch (error) {
            // If the token is invalid (401), clear it
            clearAuth();
        }
    }

    return { user, token, login, register, logout, fetchUser };
});
