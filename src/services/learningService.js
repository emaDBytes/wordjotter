/**
 * Learning Service
 *
 * Implements a spaced repetition algorithm for vocabulary learning.
 * Manages the scheduling of word reviews based on user performance
 * and provides functionality to retrieve words due for review.
 *
 * @module services/learningService
 */

import { getSavedWords, updateWordLearningStatus } from "./databaseService";

/**
 * Spaced repetition intervals in days.
 * Each index corresponds to a learning level, and the value represents
 * the number of days until the next review.
 *
 * Level 0: 1 day
 * Level 1: 3 days
 * Level 2: 7 days
 * Level 3: 14 days
 * Level 4: 30 days
 * Level 5: 90 days
 */
const INTERVALS = [1, 3, 7, 14, 30, 90];

/**
 * Retrieves words that are due for review based on their next review date.
 * Includes words that have never been reviewed or have no scheduled review date.
 *
 * @returns {Promise<Array>} Array of word objects that should be reviewed today
 * @throws {Error} Logs error to console but does not throw to caller; returns empty array on error
 *
 * @example
 * // Get all words that need review today
 * const wordsToReview = await getWordsForReview();
 * console.log(`You have ${wordsToReview.length} words to review today`);
 */
export const getWordsForReview = async () => {
  try {
    const words = await getSavedWords();
    const today = new Date();

    return words.filter((word) => {
      // If word has never been reviewed or has no next_review_date, include it
      if (!word.learning_level || !word.next_review_date) {
        return true;
      }

      // check if the next review date is today or earlier
      const nextReviewDate = new Date(word.next_review_date);
      return nextReviewDate <= today;
    });
  } catch (error) {
    console.error("Error getting words for review: ", error);
    return [];
  }
};

/**
 * Updates a word's learning progress after user review.
 * Adjusts the learning level based on whether the user knew the word,
 * and schedules the next review date according to the spaced repetition intervals.
 *
 * @param {number} wordId - ID of the word being reviewed
 * @param {boolean} isCorrect - Whether the user correctly recalled the word (true) or needed practice (false)
 * @returns {Promise<boolean>} True if the update operation succeeds, false otherwise
 * @throws {Error} Logs error to console but does not throw to caller; returns false on error
 *
 * @example
 * // After user marks a flashcard as "known"
 * await updateWordAfterReview(wordId, true);
 *
 * // After user marks a flashcard as "needs practice"
 * await updateWordAfterReview(wordId, false);
 */
export const updateWordAfterReview = async (wordId, isCorrect) => {
  try {
    // Get the current word to check its learning level
    const words = await getSavedWords();
    const word = words.find((w) => w.id === wordId);

    if (!word) {
      return false;
    }

    // current learning level (zero, if not set yet )
    let learningLevel = word.learning_level || 0;

    // Adjust learning level based on answer
    if (isCorrect) {
      // Move to next level if correct (max at INTERVALS.length - 1)
      learningLevel = Math.min(learningLevel + 1, INTERVALS.length - 1);
    } else {
      // Move back to first level if incorrect
      learningLevel = 0;
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + INTERVALS[learningLevel]);

    // Update the word in the database
    const success = await updateWordLearningStatus(
      wordId,
      learningLevel,
      nextReviewDate.toISOString()
    );

    return success;
  } catch (error) {
    console.error("Error in updating word learning status: ", error);
    return false;
  }
};
