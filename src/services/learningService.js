import { getSavedWords, updateWordLearningStatus } from "./databaseService";
import {
  getWordsForReview,
  updateWordAfterReview,
} from "../services/learningService";

// Spaced repetition intervals in days
const INTERVALS = [1, 3, 7, 14, 30, 90];

// Get words that should be reviewed today based on their learning stastus
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

export const updateWordAfterReview = async (wordId, isCorrect) => {
  try {
    // Get the curent word to check its learning level
    const words = await getSavedWords();
    const word = words.find((w) => w.id === wordId);

    if (!word) {
      return false;
    }

    // current learning level (zero, if not set yet )
    let learningLevel = word.learning_level || 0;

    // Adjust learning level based on answer
    if (isCorrect) {
      // move to next level if correct (max at INTERVALS.length - 1)
      learningLevel = Math.min(learningLevel + 1, INTERVALS.length - 1);
    } else {
      // move bacj to first level if incorrect
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
    console.error("Error in updating word learning stastus: ", error);
    return false;
  }
};
