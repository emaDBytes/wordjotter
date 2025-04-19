import * as SQLite from "expo-sqlite";

// Open or create the database
const db = SQLite.openDatabaseSync("wordjotter.db");

// Initialize the database
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
    `);
};

// Save a woed to the database
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

// Get all saved words
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

// Delete a saved word
export const deleteWord = async (id) => {
  try {
    await db.runAsync("DELETE FROM saved_words WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error("Oops, that word refuses to say goodbye; ", error);
    return false;
  }
};

// Get words by category
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

// Get reminder settings
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

// Update a word's learning status
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
