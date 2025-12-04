import { db } from '../../config/firebase';
import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

/**
 * Get reference to a user's savedWords subcollection
 * @param {string} userId - The authenticated user's ID
 * @returns {CollectionReference} Firestore collection reference
 */
const getSavedWordsRef = (userId) => {
    return collection(db, 'users', userId, 'savedWords');
};

/**
 * Add a new word to user's vocabulary collection
 * @param {string} userId - The authenticated user's ID
 * @param {Object} wordData - Word data (word, language, category, notes)
 * @returns {Promise<string>} The new document ID
 */
export const addWord = async (userId, wordData) => {
    const wordsRef = getSavedWordsRef(userId);
    const docRef = await addDoc(wordsRef, {
        ...wordData,
        createdAt: serverTimestamp(),
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0,
        difficulty: 0
    });
    return docRef.id;
};

/**
 * Retrieve all words for a user, ordered by creation date
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Array>} Array of word objects with IDs
 */
export const getWords = async (userId) => {
    const wordsRef = getSavedWordsRef(userId);
    const q = query(wordsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

// UPDATE a word
export const updateWord = async (userId, wordId, updates) => {
    const wordRef = doc(db, 'users', userId, 'savedWords', wordId);
    await updateDoc(wordRef, updates);
};

/**
 * Delete a word from user's collection
 * @param {string} userId - The authenticated user's ID
 * @param {string} wordId - The document ID to delete
 * @returns {Promise<void>}
 */
export const deleteWord = async (userId, wordId) => {
    const wordRef = doc(db, 'users', userId, 'savedWords', wordId);
    await deleteDoc(wordRef);
};