import { supabase } from '../config/supabase';

// ============ SAVED WORDS FUNCTIONS ============

/**
 * Add a new word to user's vocabulary collection
 * @param {string} userId - The authenticated user's ID
 * @param {Object} wordData - Word data (word, language, category, notes)
 * @returns {Promise<string|null>} The new record ID or null on error
 */
export const addWord = async (userId, wordData) => {
    const { data, error } = await supabase
        .from('saved_words')
        .insert({
            user_id: userId,
            word: wordData.word,
            language: wordData.language || 'en',
            category: wordData.category || null,
            notes: wordData.notes || null,
            // created_at uses database default
            last_reviewed: null,
            next_review: null,
            review_count: 0,
            difficulty: 0
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error adding word:', error.message);
        return null;
    }
    return data.id;
};

/**
 * Retrieve all words for a user, ordered by creation date
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Array>} Array of word objects with IDs
 */
export const getWords = async (userId) => {
    const { data, error } = await supabase
        .from('saved_words')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error getting words:', error.message);
        return [];
    }
    return data;
};

/**
 * Update an existing word
 * @param {string} userId - The authenticated user's ID  
 * @param {string} wordId - The record ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 */
export const updateWord = async (userId, wordId, updates) => {
    const { error } = await supabase
        .from('saved_words')
        .update(updates)
        .eq('id', wordId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating word:', error.message);
        return false;
    }
    return true;
};

/**
 * Delete a word from user's collection
 * @param {string} userId - The authenticated user's ID
 * @param {string} wordId - The record ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteWord = async (userId, wordId) => {
    const { error } = await supabase
        .from('saved_words')
        .delete()
        .eq('id', wordId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting word:', error.message);
        return false;
    }
    return true;
};

// ============ LEARNING/REVIEW FUNCTIONS ============

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
        // If word has never been reviewed or difficulty is 0, include it
        if (word.difficulty === 0 || !word.next_review) {
            return true;
        }

        // Check if next_review date is today or earlier
        const nextReviewDate = new Date(word.next_review);
        return nextReviewDate <= today;
    });
};

/**
 * Update word after review (spaced repetition)
 * @param {string} userId - The authenticated user's ID
 * @param {string} wordId - The record ID
 * @param {boolean} isCorrect - Whether user knew the word
 * @returns {Promise<boolean>} Success status
 */
export const updateWordAfterReview = async (userId, wordId, isCorrect) => {
    // First get the current word data
    const { data: word, error: fetchError } = await supabase
        .from('saved_words')
        .select('difficulty, review_count')
        .eq('id', wordId)
        .eq('user_id', userId)
        .single();

    if (fetchError || !word) {
        console.error('Error fetching word for review:', fetchError?.message);
        return false;
    }

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

    const { error } = await supabase
        .from('saved_words')
        .update({
            difficulty: difficulty,
            last_reviewed: new Date().toISOString(),
            next_review: nextReview.toISOString(),
            review_count: (word.review_count || 0) + 1
        })
        .eq('id', wordId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating word after review:', error.message);
        return false;
    }
    return true;
};

// ============ QUICK NOTES FUNCTIONS ============

/**
 * Save a quick note for later processing
 * @param {string} userId - The authenticated user's ID
 * @param {Object} noteData - Note data (word, language, notes)
 * @returns {Promise<string|null>} The new record ID or null on error
 */
export const saveQuickNote = async (userId, noteData) => {
    const { data, error } = await supabase
        .from('quick_notes')
        .insert({
            user_id: userId,
            word: noteData.word,
            language: noteData.language || 'en',
            notes: noteData.notes || null,
            processed: false
            // created_at uses database default
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error saving quick note:', error.message);
        return null;
    }
    return data.id;
};

/**
 * Get quick notes for a user
 * @param {string} userId - The authenticated user's ID
 * @param {boolean} showProcessed - Whether to show processed notes
 * @returns {Promise<Array>} Array of quick notes
 */
export const getQuickNotes = async (userId, showProcessed = false) => {
    const { data, error } = await supabase
        .from('quick_notes')
        .select('*')
        .eq('user_id', userId)
        .eq('processed', showProcessed)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error getting quick notes:', error.message);
        return [];
    }
    return data;
};

/**
 * Mark a quick note as processed
 * @param {string} userId - The authenticated user's ID
 * @param {string} noteId - The record ID to update
 * @returns {Promise<boolean>} Success status
 */
export const markNoteProcessed = async (userId, noteId) => {
    const { error } = await supabase
        .from('quick_notes')
        .update({ processed: true })
        .eq('id', noteId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error marking note processed:', error.message);
        return false;
    }
    return true;
};

/**
 * Delete a quick note
 * @param {string} userId - The authenticated user's ID
 * @param {string} noteId - The record ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteQuickNote = async (userId, noteId) => {
    const { error } = await supabase
        .from('quick_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting quick note:', error.message);
        return false;
    }
    return true;
};

// ============ REMINDER SETTINGS FUNCTIONS ============

/**
 * Save or update reminder settings for a user
 * @param {string} userId - The authenticated user's ID
 * @param {Object} settings - Settings (enabled, hour, minute)
 * @returns {Promise<boolean>} Success status
 */
export const saveReminderSetting = async (userId, settings) => {
    // Supabase upsert: insert if not exists, update if exists
    const { error } = await supabase
        .from('reminder_settings')
        .upsert({
            user_id: userId,
            enabled: settings.enabled,
            hour: settings.hour,
            minute: settings.minute,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        });

    if (error) {
        console.error('Error saving reminder settings:', error.message);
        return false;
    }
    return true;
};

/**
 * Get reminder settings for a user
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Object>} Settings object with defaults if not found
 */
export const getReminderSettings = async (userId) => {
    const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        // Return defaults if no settings exist
        return {
            enabled: false,
            hour: 9,
            minute: 0
        };
    }

    return {
        enabled: data.enabled,
        hour: data.hour,
        minute: data.minute
    };
};