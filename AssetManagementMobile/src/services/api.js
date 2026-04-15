import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Real backend URL on Render
const API_URL = 'https://asset-mobile-1.onrender.com/api';

const api = axios.create({
    baseURL: 'https://asset-mobile-1.onrender.com/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    async (config) => {
        try {
            const savedUser = await AsyncStorage.getItem('user');
            if (savedUser) {
                const { token } = JSON.parse(savedUser);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            console.error('Error attaching token to request', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
