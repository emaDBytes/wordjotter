/**
 * Database Service
 *
 * Provides functions for SQLite database operations including initialization,
 * CRUD operations for vocabulary words, and setting management.
 *
 * @module services/databaseService
 */

import * as SQLite from "expo-sqlite";

// Open or create the database
const db = SQLite.openDatabaseSync("wordjotter.db");

/**
 * Initializes the database by creating required tables if they don't ezist.
 * Creates the saved_words table and quick_notes table.
 */
export const initDatabase = () => {
  db.execAsync(`
        CREATE TABLE IF NOT EXISTS saved_words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            language TEXT NOT NULL,
            definition TEXT,
            phonetic TEXT,
            example TEXT,
            notes TEXT,
            category TEXT,
            learning_level INTEGER DEFAULT 0,
            next_review_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS quick_notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          word TEXT NOT NULL,
          language TEXT NOT NULL,
          notes TEXT,
          processed INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};

/**
 * Saves a word and its associated data to hte database.
 * @param {object} wordData - Object containing word information
 * @param {string} wordData.word - The word text
 * @param {string} wordData.language - Language code ('en' or 'fi')
 * @param {string} wordData.definition - word definition
 * @param {string} wordData.phonetic - Phonetic pronaunciation (optiona;)
 * @param {string} wordData.example - Example usage (optional)
 * @param {string} wordData.notes - User's notes (optional)
 * @param {string} wordData.category - Word's category (defaults to 'default')
 * @returns {Promise<boolean>} - True if save operation secceeds, false otherwise
 */
export const saveWord = async (wordData) => {
  const {
    word,
    language,
    definition,
    phonetic,
    example,
    notes = "",
    category = "default",
  } = wordData;

  try {
    await db.runAsync(
      "INSERT INTO saved_words (word, language, definition, phonetic, example, notes, category) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [word, language, definition, phonetic, example, notes, category]
    );
    return true;
  } catch (error) {
    console.error("Error saving word: ", error);
    return false;
  }
};

/**
 *
 * @returns REtrives all saved words from the database ordered by creation date (newest first).
 *
 * @returns {Promise<Array>} Array of word objexts
 */
export const getSavedWords = async () => {
  try {
    const result = await db.getAllAsync(
      "SELECT * FROM saved_words ORDER BY created_at DESC"
    );
    return result;
  } catch (error) {
    console.error("Whoops, those saved words ran off the page! Look: ", error);
    return [];
  }
};

/**
 * Deletes a word from the database by its ID.
 *
 * @param {number} id - ID of the word to be deleted
 * @returns {Promise<boolean>} true if deletion succeeds, false otherwise
 */
export const deleteWord = async (id) => {
  try {
    await db.runAsync("DELETE FROM saved_words WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error("Oops, that word refuses to say goodbye; ", error);
    return false;
  }
};

/**
 * Retrieves words filtered by their catefory.
 *
 * @param {string} category - Category to be used to filter
 * @returns {Promise<Array>} Array of word objects matching the category
 */
export const getWordsByCategory = async (category) => {
  try {
    const result = await db.getAllAsync(
      "SELECT * FROM saved_words WHERE category = ? ORDER BY created_at DESC",
      [category]
    );
    return result;
  } catch (error) {
    console.error("Yikes, the word sorter’s napping. ", error);
  }
};

/**
 * Saves user reminder settings to the database.
 * Crates the reminder_settings table if it doesn't exist.
 *
 * @param {Object} settings - Reminder settings object
 * @param {boolean} settings.enabled - Whether reminders are enabled
 * @param {number} settings.hour - Hour o f day for reminder (0-23)
 * @param {number} settings.minute - Minuted of hour for reminder (0-59)
 * @returns {Promise<boolean>} True of save operation succeeds, false otherwise
 */
export const saveReminderSetting = async (settings) => {
  const { enabled, hour, minute } = settings;

  try {
    // Check if the table exists
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS reminder_settings (
        id INTEGER PRIMARY KEY,
        enabled INTEGER DEFAULT 0,
        hour INTEGER DEFAULT 20,
        minute INTEGER DEFAULT 0
      );`);

    // Delete any existing setting first!
    await db.runAsync("DELETE FROM reminder_settings WHERE id = 1");

    // insert new setting
    await db.runAsync(
      "INSERT INTO reminder_settings (id, enabled, hour, minute) VALUES (?, ?, ?, ?)",
      [1, enabled ? 1 : 0, hour, minute]
    );
    return true;
  } catch (error) {
    console.error("Error in saving reninder settings: ", error);
    return false;
  }
};

/**
 *
 * @returns Retrieves user reminder settings form the database.
 * Creates the reminder_settings table if it does not exist.
 *
 * @returns {Promise<Object>} Object containing reminder settings
 * @returns {boolean} settings.enabled - whther reminders are enabled
 * @returns {number} settings.hour - Hour of day for reminder (0-23)
 * @returns {number} settings.minute - MInute of hour for reminder (0-59)
 */
export const getReminderSettings = async () => {
  try {
    // Create the table if it does not exist yet
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS reminder_settings (
        id INTEGER PRIMARY KEY,
        enabled INTEGER DEFAULT 0,
        hour INTEGER DEFAULT 20,
        minute INTEGER DEFAULT 0
      );
      `);

    // try to get existing settings
    const settings = await db.getAllAsync(
      "SELECT * FROM reminder_settings WHERE id = 1"
    );

    // if no setting exists, return defaults
    if (settings.length === 0) {
      return {
        enabled: false,
        hour: 20,
        minute: 0,
      };
    }

    // Return the existing settings
    return {
      enabled: settings[0].enabled === 1,
      hour: settings[0].hour,
      minute: settings[0].minute,
    };
  } catch (error) {
    console.error("Error in getting reminder settings: ", error);
    return {
      enabled: false,
      hour: 20,
      minute: 0,
    };
  }
};

/**
 * Updates a word's learning progress in the spaced repetition system.
 *
 * @param {number} wordId - ID of the word to update
 * @param {number} learningLevel - New learning level (0-5)
 * @param {string} nextReviewDate - ISO string fate for next review
 * @returns {Promise<boolean>} True if update succeeds, fales otherwise
 */
export const updateWordLearningStatus = async (
  wordId,
  learningLevel,
  nextReviewDate
) => {
  try {
    await db.runAsync(
      "UPDATE saved_words SET learning_level = ?, next_review_date = ? WHERE id = ?",
      [learningLevel, nextReviewDate, wordId]
    );
    return true;
  } catch (error) {
    console.error("error in updating word learning stastus: ", error);
    return false;
  }
};

/**
 * Retrieves statistics about cocabulary learning progress
 *
 * @returns {Promise<Object>} Object containing learning statistics:
 *  - totalWords: Total number of saved words
 *  - knownWords: Number of words at learning level 3 or higher
 *  - needPractice: Number of words at learning level 0-2
 *  - leaningLevels: Distribution of words by learning level
 */
export const getLearningStats = async () => {
  try {
    // Get all words
    const words = (await getSavedWords()) || [];

    // CAlculate statistics
    const totalWords = words.length;

    // count words by learning level
    const learningLevels = [0, 0, 0, 0, 0, 0]; // 6levels (0-5)

    let knownWords = 0;
    let needPractice = 0;

    words.forEach((word) => {
      // default to level 0 if not set
      const level = word.learning_level !== null ? word.learning_level : 0;

      // Update level counts
      if (level >= 0 && level < learningLevels.length) {
        learningLevels[level]++;
      }

      // count words taht are "known" (level 3+) vs need practice (0-2)
      if (level >= 3) {
        knownWords++;
      } else {
        needPractice++;
      }
    });

    return {
      totalWords,
      knownWords,
      needPractice,
      learningLevels,
    };
  } catch (error) {
    console.error("error in getting learning statustcs: ", error);
    return {
      totalWords: 0,
      knownWords: 0,
      needPractice: 0,
      learningLevels: [0, 0, 0, 0, 0, 0],
    };
  }
};

/**
 * Saves a quick note for later processing.
 *
 * @param {object} noteData - Object containing note information
 * @param {string} noteData.word - The word text
 * @param {string} noteData.language - Language code ('en' or 'fi')
 * @param {string} noteData.notes - Optional context notes
 * @returns {Promise<boolean>} - True if save operation succedds
 */
export const saveQuickNote = async (noteData) => {
  const { word, language, notes = "" } = noteData;

  try {
    await db.runAsync(
      "INSERT INTO quick_notes (word, language, notes) VALUES (?, ?, ?)",
      [word, language, notes]
    );
    return true;
  } catch (error) {
    console.error("Error in jotting: ", error);
    return false;
  }
};

/**
 * Retrieves all quick notes.
 *
 * @param {boolean} includeProcessed - Wethere to include processed notes
 * @returns {Promise<Array>} Array of quick note objects
 */
export const getQuickNotes = async (includeProcessed = false) => {
  try {
    let query = "SELECT * FROM quick_notes";
    if (!includeProcessed) {
      query += "WHERE Processed = 0";
    }
    query += "ORDER BY created_at DESC";

    const result = await db.getAllAsync(query);
    return result;
  } catch (error) {
    console.error("Error in getting quick notes: ", error);
    return [];
  }
};

/**
 * Marks a quick note as processed.
 *
 * @param {number} id - ID of the note to mark as processed
 * @returns {Promise<boolean>} True if update succeeds
 */
export const markNoteProcessed = async (id) => {
  try {
    await db.runAsync("UPDATE quick_notes SET processed = 1 WHERE id = ?", [
      id,
    ]);
    return true;
  } catch (error) {
    console.error("Error marking note as processed: ", error);
    return false;
  }
};

/**
 * Deletes a quick note.
 *
 * @param {number} id - ID of the note to be deleted
 * @returns {Promise<boolean>} True i fdeletion succeeds
 */
export const deleteQuickNote = async (id) => {
  try {
    await db.runAsync("DELETE FROM quick_notes WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error("Error in deleting quick note: ", error);
    return false;
  }
};
