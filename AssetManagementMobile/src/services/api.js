import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 192.168.1.5 is your local machine's IP address
const API_URL = 'http://192.168.1.5:3000/api';

const api = axios.create({
    baseURL: 'http://192.168.1.5:3000/api',
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
