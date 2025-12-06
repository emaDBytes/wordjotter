/**
 * Supabase Authentication Service
 * 
 * Provides authentication functions for the WordJotter application.
 * Handles user registration, login, logout, and auth state management.
 * 
 * @module services/supabaseAuthService
 */

import { supabase } from '../config/supabase';

/**
 * Registers a new user with email and password.
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password (min 6 characters)
 * @returns {Promise<Object>} Object with success status and user/error data
 */
export const registerUser = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Signs in an existing user with email and password.
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Object with success status and user/error data
 */
export const loginUser = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Signs out the current user.
 * 
 * @returns {Promise<Object>} Object with success status and optional error
 */
export const logoutUser = async () => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Subscribes to authentication state changes.
 * 
 * @param {Function} callback - Function called when auth state changes
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToAuthChanges = (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
            callback(session?.user || null);
        }
    );

    return subscription;
};