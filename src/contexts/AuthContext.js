/**
 * Authentication Context
 * 
 * Provides global authentication state management for the WordJotter app.
 * Tracks current user and loading state, making auth data accessible
 * to all components without prop drilling.
 * 
 * @module contexts/AuthContext
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { subscribeToAuthChanges } from '../services/authService';

// Create the context
const AuthContext = createContext();

/**
 * AuthProvider component wraps the app and provides auth state to all children.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.Component} Provider component with auth state
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to auth state changes when component mounts
        const unsubscribe = subscribeToAuthChanges((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return unsubscribe;
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to access authentication context.
 * Must be used within an AuthProvider.
 * 
 * @returns {Object} Auth context value containing user, loading, and isAuthenticated
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};