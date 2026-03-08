import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for logged in user from storage
        const loadUser = async () => {
            try {
                const savedUser = await AsyncStorage.getItem('user');
                if (savedUser) {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser); // Temporary optimistic load

                    if (parsedUser.token) {
                        try {
                            // Re-attach token to Axios so the background profile fetch and future requests don't 401
                            api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
                            const response = await api.get('/auth/profile');
                            setUser({ ...response.data, token: parsedUser.token });
                            await AsyncStorage.setItem('user', JSON.stringify({ ...response.data, token: parsedUser.token }));
                        } catch (apiError) {
                            console.error('Failed to refresh user from backend', apiError);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to load user', e);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        console.log(`Attempting login for: ${email}`);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, user: backendUser } = response.data;
            const userData = { ...backendUser, token: access_token || response.data.token };
            console.log('Login successful');
            await AsyncStorage.setItem('user', JSON.stringify(userData));

            // Apply token to Axios immediately
            api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

            // Immediately fetch rich profile
            try {
                const profileRes = await api.get('/auth/profile');
                const fullUserData = { ...profileRes.data, token: userData.token };
                await AsyncStorage.setItem('user', JSON.stringify(fullUserData));
                setUser(fullUserData);
            } catch (e) {
                setUser(userData); // Fallback to basic login data
            }

            return { success: true };
        } catch (error) {
            console.error('Login error:', error.message);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const signup = async (name, email, password) => {
        console.log(`Attempting signup for: ${email}`);
        try {
            const response = await api.post('/auth/register', { name, email, password });
            console.log('Signup successful');
            return { success: true };
        } catch (error) {
            console.error('Signup error:', error.message, error.response?.data);
            const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Signup failed';
            return { success: false, message: errorMessage };
        }
    };

    const logout = async () => {
        console.log('Logging out');
        await AsyncStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const updateUser = async (updatedData) => {
        try {
            const newUser = { ...user, ...updatedData };
            await AsyncStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
        } catch (e) {
            console.error('Failed to update user context', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
