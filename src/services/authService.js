/**
 * Firebase Authentication Service
 * 
 * Provides authentication functions for the WordJotter application.
 * Handles user registration, login, logout, and auth state management.
 * 
 * @module services/authService
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Registers a new user with email and password.
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password (min 6 characters)
 * @returns {Promise<Object>} Object with success status and user/error data
 */
export const registerUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
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
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Subscribes to authentication state changes.
 * 
 * @param {Function} callback - Function called when auth state changes
 * @returns {Function} Unsubscribe function to stop listening
 */
export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
};