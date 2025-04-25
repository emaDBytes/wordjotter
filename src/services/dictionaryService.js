/**
 * Dictionary Service
 *
 * Handles dictionary lookups for multilingual word definitions.
 * Supports both direct API integration for English and external
 * browser-based dictionary access for Finnish
 *
 * @module services/dictionaryService
 */

import * as WebBrowser from "expo-web-browser";

/**
 * Fetches word definitions based on the specified language.
 * For English words, uses the Free Dictionary API.
 * For Finnish words, returns metadata for external lookup.
 *
 * @param {string} word - The word to look up
 * @param {string} language - Language code ('en' for English, 'fi' for Finnish)
 * @returns {Promise<Array|object>} - Array of definition objects for English or external lookup for Finnish
 * @throws {Error} - If API request fails or language is unsupported
 */
export const fetchWordDefinition = async (word, language = "en") => {
  try {
    if (language === "en") {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/${language}/${word}`
      );

      if (!response.ok) {
        throw new Error("Whoops, that word ghosted us!");
      }

      return await response.json();
    } else if (language === "fi") {
      // For Finnish, open the browser instead of showing results
      return {
        type: "external",
        word: word,
        language: "fi",
      };
    } else {
      throw new Error("Unsupported language");
    }
  } catch (error) {
    throw error;
  }
};

/**
 * OPens the RedFox Dictionary in the device's browser for Finnish word lookups.
 * This provides a comprehensive Finnish-English dictionary experience without requiring direct API integration.
 *
 * @param {string} word - The Finnish word to look up
 * @returns {Promise<Object>} - Result object from WebBrowser.openBrowserAsync
 * @throws {} - If browser cannot be opened or URL is invalid
 */
export const openFinnishDictionary = async (word) => {
  try {
    // Use REdFox dictionary for Finnish lookup
    const url = `https://redfoxsanakirja.fi/fi/sanakirja/-/s/fin/eng/${encodeURIComponent(
      word
    )}`;
    const result = await WebBrowser.openBrowserAsync(url);
    return result;
  } catch (error) {
    console.error("Error in opening browser: ", error);
    throw error;
  }
};
