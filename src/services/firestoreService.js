import { db } from '../config/firebase';
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

/**
 * Spaced repetition intervals in days
 */
const INTERVALS = [1, 3, 7, 14, 30, 90];

/**
 * Get words due for review
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Array>} Array of words due for review
 */
export const getWordsForReview = async (userId) => {
    const words = await getWords(userId);
    const today = new Date();

    return words.filter((word) => {
        // If word has never been reviewed or has no nextReview, include it
        if (word.difficulty === 0 || !word.nextReview) {
            return true;
        }

        // Check if nextReview date is today or earlier
        const nextReviewDate = word.nextReview.toDate ? word.nextReview.toDate() : new Date(word.nextReview);
        return nextReviewDate <= today;
    });
};

/**
 * Update word after review (spaced repetition)
 * @param {string} userId - The authenticated user's ID
 * @param {string} wordId - The document ID
 * @param {boolean} isCorrect - Whether user knew the word
 * @returns {Promise<void>}
 */
export const updateWordAfterReview = async (userId, wordId, isCorrect) => {
    const words = await getWords(userId);
    const word = words.find((w) => w.id === wordId);

    if (!word) return;

    let difficulty = word.difficulty || 0;

    if (isCorrect) {
        // Move to next level (max 5)
        difficulty = Math.min(difficulty + 1, INTERVALS.length - 1);
    } else {
        // Reset to level 0
        difficulty = 0;
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + INTERVALS[difficulty]);

    await updateWord(userId, wordId, {
        difficulty: difficulty,
        lastReviewed: new Date(),
        nextReview: nextReview,
        reviewCount: (word.reviewCount || 0) + 1
    });
};