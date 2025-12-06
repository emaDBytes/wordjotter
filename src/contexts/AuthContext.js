/**
 * Authentication Context for WordJotter
 * 
 * Provides global authentication state management using React Context API.
 * Wraps the application to provide user state and auth functions to all components.
 * 
 * @module contexts/AuthContext
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { subscribeToAuthChanges } from '../services/supabaseAuthService';

const AuthContext = createContext({});

/**
 * Authentication Provider Component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component wrapping children
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const subscription = subscribeToAuthChanges((user) => {
            setUser(user);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to access authentication context
 * 
 * @returns {Object} Auth context with user and loading state
 */
export const useAuth = () => {
    return useContext(AuthContext);
};