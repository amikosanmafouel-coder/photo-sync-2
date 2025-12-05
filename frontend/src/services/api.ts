import axios from 'axios';

// REPLACE THIS WITH YOUR CURRENT NGROK URL
const API_URL = 'https://diedra-uncheering-synthia.ngrok-free.dev/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true' // Keeps Ngrok happy
    }
});

// Add a request interceptor to include the Token if we have one
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
