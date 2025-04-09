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
