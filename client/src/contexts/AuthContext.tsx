import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { loginUser, registerUser } from '../services/api'; 
import { UserInfo, AuthContextType, LoginCredentials, RegisterData } from '../types'; 

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: React.ReactNode; 
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true); 

    useEffect(() => {
        setLoading(true);
        try {
            const storedUserInfo = localStorage.getItem('userInfo');
            if (storedUserInfo) {
                const parsedUser: UserInfo = JSON.parse(storedUserInfo);
                 if(parsedUser?._id && parsedUser?.token) {
                    setUser(parsedUser);
                 } else {
                    console.warn("Invalid user info structure in localStorage.");
                    localStorage.removeItem('userInfo');
                 }
            }
        } catch (error) {
             console.error("Failed to parse user info from localStorage:", error);
             localStorage.removeItem('userInfo'); 
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (credentials: LoginCredentials): Promise<UserInfo> => {
        try {
            setLoading(true);
            const { data } = await loginUser(credentials);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            setLoading(false);
            return data;
        } catch (error) {
            setLoading(false);
            console.error("Login failed:", error);
            throw error;
        }
    };

    const register = async (data: RegisterData): Promise<UserInfo> => {
        try {
            setLoading(true);
            const { data: registeredUser } = await registerUser(data);
            localStorage.setItem('userInfo', JSON.stringify(registeredUser));
            setUser(registeredUser);
            setLoading(false);
            return registeredUser;
        } catch (error) {
            setLoading(false);
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated: !!user, 
        login,
        register,
        logout,
    }), [user, loading]); 

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : null }
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};