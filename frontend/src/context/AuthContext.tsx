'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '../lib/axios';

interface User {
    id: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    register: async () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = () => {
            const token = Cookies.get('token');
            const userStr = localStorage.getItem('user');

            if (token && userStr) {
                try {
                    setUser(JSON.parse(userStr));
                } catch (e) {
                    console.error('Failed to parse user from local storage');
                    logout();
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (data: any) => {
        try {
            const response = await api.post('/auth/login', data);
            const { access_token, user: loggedInUser } = response.data;

            Cookies.set('token', access_token, { expires: 1 }); // 1 day expiration
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            setUser(loggedInUser);
            router.push('/dashboard');
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (data: any) => {
        try {
            await api.post('/auth/register', data);
            // Auto-login or redirect to login
            router.push('/login');
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        Cookies.remove('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
